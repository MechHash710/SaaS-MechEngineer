import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const handleSubscribe = async (plan: string) => {
    if (!user) {
      window.location.href = '/?mode=login';
      return;
    }

    if (plan === 'free') {
       window.location.href = '/?mode=dashboard';
       return;
    }

    if (user.plan === plan) {
       handlePortal();
       return;
    }

    try {
      setLoadingPlan(plan);
      const res = await api.post('/billing/create_checkout_session', { plan });
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao redirecionar para o pagamento.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    try {
      setLoadingPortal(true);
      const res = await api.get('/billing/portal');
      if (res.data.portal_url) {
        window.location.href = res.data.portal_url;
      }
    } catch(err) {
       console.error(err);
       alert('Erro ao acessar o portal do Stripe.');
    } finally {
       setLoadingPortal(false);
    }
  };

  const plans = [
    { 
      name: 'free', 
      title: 'Basic / Free', 
      price: 'Grátis', 
      desc: 'Para testar e estudantes.', 
      features: ['5 simulações/mês', 'Apenas Memorial PDF', 'S/ acesso API', 'S/ suporte prioritário'],
      btnText: user?.plan === 'free' ? 'Plano Atual' : 'Começar Grátis'
    },
    { 
      name: 'pro', 
      title: 'Pro', 
      price: 'R$ 97/mês', 
      desc: 'Para profissionais liberais e escritórios.', 
      features: ['Simulações Ilimitadas', 'Todos os Relatórios PDF', 'S/ acesso API', 'Suporte Padrão'],
      btnText: user?.plan === 'pro' ? 'Gerenciar Assinatura' : 'Assinar Pro',
      highlight: true
    },
    { 
      name: 'enterprise', 
      title: 'Enterprise', 
      price: 'R$ 297/mês', 
      desc: 'Equipes e Integrações diretas.', 
      features: ['Tudo do Pro', 'Workspaces e Acessos', 'Acesso via API', 'Suporte Prioritário'],
      btnText: user?.plan === 'enterprise' ? 'Gerenciar Assinatura' : 'Assinar Enterprise'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-extrabold text-slate-900">Escolha o plano ideal para você</h2>
        <p className="mt-4 text-xl text-slate-600">Simule projetos com inteligência e fature mais.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((p) => (
          <div key={p.name} className={`p-8 rounded-3xl border ${p.highlight ? 'border-primary-500 shadow-xl scale-105 bg-white' : 'border-slate-200 bg-slate-50'}`}>
            <h3 className="text-2xl font-bold text-slate-900">{p.title}</h3>
            <p className="text-sm text-slate-500 mt-2 min-h-[40px]">{p.desc}</p>
            <div className="my-6">
              <span className="text-4xl font-extrabold text-slate-900">{p.price}</span>
            </div>
            
            <Button 
               variant={p.highlight ? 'primary' : 'secondary'}
               fullWidth
               onClick={() => handleSubscribe(p.name)}
               disabled={(user?.plan === p.name && p.name === 'free') || loadingPlan === p.name || loadingPortal}
               loading={loadingPlan === p.name || (user?.plan === p.name && loadingPortal)}
            >
               {p.btnText}
            </Button>

            <ul className="mt-8 space-y-4">
               {p.features.map((f, i) => (
                 <li key={i} className="flex items-center text-sm text-slate-600">
                    {f.includes("S/") ? <X className="w-5 h-5 text-red-500 mr-3 shrink-0" /> : <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />}
                    {f}
                 </li>
               ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
