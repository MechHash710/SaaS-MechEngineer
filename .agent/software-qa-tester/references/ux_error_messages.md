# UX Error Messages Guidelines (PT-BR)

Para manter a consistência da UX e facilitar as asserções de QA, o agente de testes utilizará estritamente as categorias e os textos em Português-BR recomendados pela plataforma.
Exibir código de erro genérico ao invés da mensagem clara falhará o teste.

## Dicionário de UX Erros Recomendados

### 1. Autenticação e Autorização
* `Login com falha de rede:` "Não foi possível conectar ao servidor. Verifique sua conexão."
* `Credencial Incorreta (Login):` "E-mail ou senha inválidos. Tente novamente."
* `E-mail não confirmado:` "Por favor, verifique seu e-mail antes de fazer login."
* `Sessão expirada:` "Sua sessão expirou por segurança. Faça o login novamente."

### 2. Formulários Genéricos e Campos Numéricos
* `Campo Obrigatório Vazio:` "Este campo é obrigatório."
* `Valor Inválido (RegEx/Format):` "Formato inválido. Use o padrão (Ex: (XX) XXXXX-XXXX)."
* `Valor Geométrico ou Físico Impossível:` "O valor não pode ser menor ou igual a zero."
* `Tamanho de Área Limite Extrapolado:` "A área informada ultrapassa o limite permitido para o projeto."

### 3. Cálculos e Simuladores
* `Carga Térmica Impossível:` "Os parâmetros informados geram um cálculo fisicamente inconsistente. Reveja os dados."
* `Simulação sem Unidade/Erro 422 da API:` "Não conseguimos processar esta simulação pois faltam dados críticos. Verifique todas as entradas."

### 4. Estado de Rede e Downloads (Timeouts)
* `Erro na Geração do PDF:` "Ocorreu um erro ao gerar o memorial. Tente visualizar o PDF novamente em alguns instantes."
* `Download demorando/Falha:` "O documento parou de ser gerado, tente recarregar."

## O que DEVE Ser Asserido nos Testes (Regra do QA)

Padrão exigido do QA:
- Verifique se a mensagem *aparece* explicitamente (Ex: `expect(page.getByText('Este campo é obrigatório.')).toBeVisible()`).
- Verifique se a mensagem descreve o *motivo*, não um *código técnico*.
- Verifique a acessibilidade da cor de erro (deve ter um ícone ou contraste na Label).
