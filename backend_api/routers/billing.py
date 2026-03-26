from datetime import datetime

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.dependencies import get_current_user
from core.plans import PLANS_CONFIG
from core.stripe_config import PRICE_IDS, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
from database import get_db
from models.user import User

router = APIRouter()

# Setup Stripe API Key
stripe.api_key = STRIPE_SECRET_KEY
webhook_secret = STRIPE_WEBHOOK_SECRET


class CheckoutRequest(BaseModel):
    plan: str


@router.post("/create_checkout_session")
async def create_checkout_session(
    data: CheckoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = data.plan
    if plan not in PLANS_CONFIG or plan == "free":
        raise HTTPException(status_code=400, detail="Invalid plan or plan is free")

    if plan not in PRICE_IDS:
        raise HTTPException(status_code=400, detail="Price ID not configured for this plan")

    price_id = PRICE_IDS[plan]

    try:
        # 1. Create or get Stripe Customer
        if not current_user.stripe_customer_id:
            customer = stripe.Customer.create(email=current_user.email, name=current_user.name)
            current_user.stripe_customer_id = customer.id
            db.commit()

        # 2. Create Checkout Session
        checkout_session = stripe.checkout.Session.create(
            customer=current_user.stripe_customer_id,
            payment_method_types=["card"],
            line_items=[
                {
                    "price": price_id,
                    "quantity": 1,
                },
            ],
            mode="subscription",
            success_url="http://localhost:5173/?mode=billing_success&session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://localhost:5173/?mode=pricing",
            metadata={"user_id": current_user.id, "plan": plan},
        )
        return {"checkout_url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/portal")
async def create_customer_portal_session(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No active Stripe customer found.")

    try:
        portal_session = stripe.billing_portal.Session.create(
            customer=current_user.stripe_customer_id,
            return_url="http://localhost:5173/?mode=dashboard",
        )
        return {"portal_url": portal_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subscription")
def get_subscription(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {
        "plan": current_user.plan,
        "expires_at": current_user.plan_expires_at,
        "subscription_id": current_user.stripe_subscription_id,
        "is_active": current_user.plan != "free"
        and (
            current_user.plan_expires_at is None or current_user.plan_expires_at > datetime.utcnow()
        ),
    }


@router.post("/cancel")
def cancel_subscription(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    if not current_user.stripe_subscription_id:
        raise HTTPException(status_code=400, detail="No active subscription found.")

    try:
        # Cancel the subscription in Stripe
        stripe.Subscription.delete(current_user.stripe_subscription_id)

        # We don't downgrade immediately usually (wait for period end), but for simplicity:
        current_user.plan = "free"
        current_user.stripe_subscription_id = None
        db.commit()

        return {"status": "success", "message": "Subscription cancelled"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    request.headers.get("stripe-signature")

    try:
        # Simple local checking or full verification
        # event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)

        # FOR MOCK PURPOSES since we don't have real stripe listening
        import json

        event = json.loads(payload)

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            user_id = session.get("metadata", {}).get("user_id")
            plan = session.get("metadata", {}).get("plan")
            subscription_id = session.get("subscription")

            if user_id and plan:
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    user.plan = plan
                    user.stripe_subscription_id = subscription_id
                    from datetime import timedelta

                    user.plan_expires_at = datetime.utcnow() + timedelta(days=30)
                    db.commit()

        elif event["type"] == "customer.subscription.deleted":
            subscription = event["data"]["object"]
            user = db.query(User).filter(User.stripe_subscription_id == subscription["id"]).first()
            if user:
                user.plan = "free"
                user.stripe_subscription_id = None
                user.plan_expires_at = None
                db.commit()

        elif event["type"] == "invoice.payment_failed":
            invoice = event["data"]["object"]
            customer_email = invoice.get("customer_email")
            # Log the failure for now
            print(f"Payment failed for email: {customer_email}")

        return {"status": "success"}

    except ValueError:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")
