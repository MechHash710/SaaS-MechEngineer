# Matriz de Cobertura de Formulários (Form Coverage Matrix)

O QA Tester garante a completude dos fluxos verificando se os estados explícitos de "Formulário" e "Botão" estão atendidos em todos os specs End-to-End da plataforma térmica.

Se o teste E2E não testar essas 5 áreas para TODA rota de simulador/auth, O Módulo ganha bandeira vermelha na Auditoria (MODO 1).

## Matriz dos 5 Estados de Formulário

### Estado 1 — Estado Inicial (Mount & Render)
* [ ] Componentes renderizados perfeitamente na viewport.
* [ ] Todos os labels de inputs têm unidades de medida (Ex: kWh, m²).
* [ ] Focus state começa no lugar correto ou não interfere tab-index nativo.
* [ ] Botão de envio primário renderiza habilitado inicialmente.

### Estado 2 — Preenchimento Válido (O "Happy Path")
* [ ] Preenchimento liso de inputs complexos numéricos sem pulos.
* [ ] Ao enviar com todos os dados preenchidos corretamente, o Request vinga.
* [ ] O cálculo do backend reage sem falhas, entregando os retornos com o "Status: 200".

### Estado 3 — Estado Inválido (Validações UX)
* [ ] Impede o Request de sair se campos primários/obrigatórios estão vazios.
* [ ] Impede e avisa se valores passados são negativos em inputs de áreas ou volumes.
* [ ] Informa claramente (PT-BR) abaixo do componente ofensivo.

### Estado 4 — Estado Analítico/Loading (Prevenção de Abort)
* [ ] O Dispatch do Action ativa Spinner/Loading na UI.
* [ ] Botão fica "Disabled" (Trava double-submit que polui banco de projetos ou requisições LLM lentas).
* [ ] Qualquer overlay opcional mostra texto "Processando Memória de Cálculo..." em vez de tela branca.

### Estado 5 — Resolução e Next Steps (Result UI e Download)
* [ ] Dados de saída formatados perfeitamente após Loading false (Cards atualizados na UI e visíveis ao assert do Playwright).
* [ ] Resposta com Unidades no layout do resultado.
* [ ] Presença forte de um CTA reativo (Ex: Botão de "Baixar PDF").

## Matriz dos Botões Primários

Os scripts Spec gerados **sempre** testarão o botão em paralelo ao Form, contendo no mínimo os locators para 4 facetas do Flow de Botões:

1. `Default` -> Botão Clicável ao carregar com rótulo descritivo forte (não "Avançar", sim "Calcular Carga Energética").
2. `Hover` -> Tab-focus order.
3. `Loading` -> Estado Desabilitado pós-Click (Padrão rigoroso do React/Button custom).
4. `Success/Error` -> Toast reage ou Texto altera transição fluída.
