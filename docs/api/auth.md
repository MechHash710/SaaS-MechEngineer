# 🔐 Auth Endpoints

**Prefixo:** `/api/v1/auth`

---

## POST /register

Cria uma nova conta de usuário (plano **free** por padrão).

**Body:**
```json
{
  "email": "engenheiro@empresa.com",
  "password": "minhasenha123",
  "name": "João da Silva"
}
```

**Response 200:**
```json
{
  "id": "uuid-do-usuario",
  "email": "engenheiro@empresa.com",
  "name": "João da Silva",
  "plan": "free"
}
```

---

## POST /login

Autentica o usuário e retorna tokens JWT.

**Body (form-data `application/x-www-form-urlencoded`):**
```
username=engenheiro@empresa.com
password=minhasenha123
```

**Response 200:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

---

## POST /refresh

Renova o `access_token` usando o `refresh_token`.

**Body:**
```json
{ "refresh_token": "eyJ..." }
```

**Response 200:** mesmo schema de `/login`

---

## GET /me

Retorna os dados do usuário autenticado.  
**🔒 Requer:** `Authorization: Bearer <access_token>`

**Response 200:**
```json
{
  "id": "uuid",
  "email": "engenheiro@empresa.com",
  "name": "João da Silva",
  "plan": "pro"
}
```

---

## POST /logout

Finaliza a sessão (client-side: limpa o token armazenado).  
**🔒 Requer:** Bearer Token

**Response 200:**
```json
{ "message": "Logout exitoso." }
```
