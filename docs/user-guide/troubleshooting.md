# Troubleshooting — Problemas Comuns e Soluções

Este guia cobre os erros mais frequentes reportados por usuários beta e como resolvê-los.

---

## Autenticação

### "Tela em branco após fazer login"
**Causa**: O token JWT expirou ou foi invalidado enquanto a sessão estava aberta.

**Solução**:
1. Feche e reabra o navegador
2. Acesse `/?mode=login` manualmente
3. Faça login novamente
4. Se persistir: limpe os dados do site (F12 → Application → Clear Storage)

---

### "Continua pedindo login mesmo após entrar"
**Causa**: O token de refresh expirou ou o cookie de sessão foi bloqueado pelo navegador.

**Solução**:
1. Verifique se cookies de terceiros estão ativados para o domínio da plataforma
2. Desative extensões de bloqueio (uBlock, Privacy Badger) temporariamente
3. Tente no modo anônimo/privado do navegador

---

### "Cadastro realizado mas não consigo fazer login"
**Causa**: A conta pode ter sido criada mas o e-mail de confirmação ainda está pendente, ou houve erro silencioso no registro.

**Solução**:
1. Tente fazer login normalmente — alguns ambientes não exigem confirmação de e-mail
2. Use a opção **Esqueci minha senha** para redefinir
3. Se nada funcionar: entre em contato pelo widget de feedback (botão 💬 no canto inferior direito)

---

## Simuladores

### "Cliquei em Calcular e a tela ficou em branco"
**Causa mais comum**: Erro de conexão com o backend enquanto o resultado estava carregando. O estado de loading foi interrompido sem exibir mensagem de erro.

**Solução**:
1. Recarregue a página (F5)
2. Verifique sua conexão com a internet
3. Tente novamente — geralmente funciona na segunda tentativa
4. Se persistir: use o widget 💬 e descreva qual simulador e quais parâmetros você inseriu

---

### "O resultado do cálculo retornou 0 ou valores negativos"
**Causa**: Parâmetros fora dos limites esperados pelas normas (ex: área negativa, número de pessoas = 0 com muita carga de equipamentos).

**Solução**:
1. Verifique os campos com `*` (obrigatórios)
2. Confirme que a **área** é positiva e em m² (não cm² ou ft²)
3. Para HVAC: pé-direito deve estar entre 2,20 m e 6,00 m
4. Para Solar: temperatura fria deve ser menor que temperatura quente

---

### "O simulador solar está calculando valores muito altos ou muito baixos"
**Causa**: A localização não foi reconhecida ou o GHI (irradiação solar) não foi obtido da API Open-Meteo.

**Solução**:
1. Digite a localização no formato: `Cidade, UF` (ex: `São Paulo, SP`)
2. Evite abreviações e acentos incorretos
3. Se a cidade é pequena, use a cidade mais próxima da mesma região climática
4. Valores de GHI esperados: Curitiba ≈ 3,5 kWh/m²/dia | São Paulo ≈ 4,5 | Fortaleza ≈ 6,0

---

### "Formulário não aceita meu valor de área"
**Causa**: O campo espera um número com ponto como separador decimal (ex: `25.5`), não vírgula.

**Solução**: Use ponto (`.`) como separador decimal em todos os campos numéricos. Ex: `25.5` em vez de `25,5`.

---

## PDFs

### "O botão de download PDF não aparece"
**Causa**: O cálculo não foi concluído com sucesso — o botão de PDF só aparece após resultado válido.

**Solução**:
1. Verifique se o resultado do cálculo está visível na tela
2. Se o resultado sumiu, refaça o cálculo
3. Se o botão ainda não aparecer após resultado: recarregue a página e calcule novamente

---

### "O PDF baixado está em branco ou corrompido"
**Causa**: A geração do PDF falhou no servidor enquanto o arquivo estava sendo criado.

**Solução**:
1. Aguarde 5 segundos e tente baixar novamente
2. Verifique se seu navegador não está bloqueando downloads automáticos
3. Tente em outro navegador (Chrome ou Edge recomendados)

---

### "Meu nome ou CREA não aparecem no PDF"
**Causa**: As informações do profissional não foram preenchidas antes de gerar o documento.

**Solução**:
1. Após calcular, clique em **Configurar PDF** (aparece junto ao botão de download)
2. Informe: nome completo, número CREA, especialidade
3. Clique em **Gerar PDF** novamente

---

## Planos e Billing

### "Atingi o limite de simulações do plano Free"
**Causa**: O plano Free permite 5 simulações e 2 PDFs por mês.

**Solução**: Faça upgrade para o **Pro** (simulações ilimitadas) ou **Business** na página de [Planos](/pricing). O upgrade é imediato — suas simulações anteriores são preservadas.

---

### "Fui cobrado mas o upgrade não foi ativado"
**Causa**: Demora na confirmação do webhook do Stripe (rara — geralmente < 30 segundos).

**Solução**:
1. Aguarde 2 minutos e recarregue a página
2. Verifique seu e-mail — um recibo deve ter chegado
3. Se o plano ainda não foi atualizado após 10 minutos: use o widget 💬 com o número do pedido (está no e-mail do recibo)

---

## Performance

### "As simulações estão demorando mais de 30 segundos"
**Causa**: A API de geolocalização (Open-Meteo / Nominatim) pode estar lenta. Isso afeta principalmente o simulador Solar que busca GHI em tempo real.

**Solução**:
1. Tente novamente após 1–2 minutos
2. Para simulações urgentes: use uma localização aproximada de cidade grande próxima
3. O P95 de resposta em condições normais é < 100ms (testado com Locust)

---

## Contato e Suporte

Se nenhuma das soluções acima resolver seu problema:

1. **Widget de feedback** (💬 no canto inferior direito): descreva o problema com categoria **Bug**
2. **Inclua no feedback**:
   - Qual simulador estava usando
   - Quais valores inseriu
   - O que aconteceu vs. o que esperava
   - Navegador e sistema operacional

Respondemos bugs críticos em < 48 horas durante o beta.
