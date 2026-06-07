# CréditoFácil

Aplicação web em Angular para simulação e contratação de crédito pessoal, com fluxo guiado em múltiplas etapas.

## Funcionalidades

- **Simulação** — cálculo de parcela, taxa, CET e comprometimento de renda
- **Análise de crédito** — avaliação automática com score, fatores e decisão de aprovação
- **Cadastro** — coleta de dados pessoais com validação e máscaras (CPF, telefone, CEP)
- **Formalização** — captura biométrica facial e assinatura digital do contrato

O fluxo é sequencial: cada etapa só fica disponível após a conclusão da anterior.

```
Simulação → Análise → Cadastro → Formalização → Protocolo
                ↘ (recusado) → Nova simulação
```

## Stack

- Angular 21 (standalone components)
- TypeScript 5.9
- RxJS 7.8
- Reactive Forms
- Angular Signals

## Pré-requisitos

- Node.js 20+
- npm 10+

## Instalação e execução

```bash
npm install
npm start
```

A aplicação estará disponível em [http://localhost:4200](http://localhost:4200).

```bash
npm run build   # build de produção
npm test        # testes unitários
```

## Como testar o fluxo

1. Acesse **Simulação** e informe valor, parcelas e renda mensal
2. Clique em **Simular** e avance para **Análise de Crédito**
3. Inicie a análise e aguarde o resultado (aprovação ou recusa)
4. Se aprovado, preencha o **Cadastro** com dados válidos
5. Na **Formalização**, capture a biometria, aceite os termos e assine o contrato

> A biometria utiliza a câmera do dispositivo via `getUserMedia`. Caso não esteja disponível, a aplicação entra em modo de simulação.

## Arquitetura

A aplicação segue separação de responsabilidades em camadas:

| Camada | Responsabilidade |
|--------|------------------|
| `models/` | Contratos e tipos do domínio |
| `services/credit.service.ts` | Regras de negócio (simulação, análise, formalização) |
| `services/credit-flow.service.ts` | Estado do fluxo entre etapas |
| `pages/` | Telas do wizard |
| `components/stepper/` | Indicador de progresso e navegação |

### Serviços

**`CreditService`** encapsula a lógica de negócio:

- Cálculo de parcelas pela Tabela Price
- Regras de aprovação (score mínimo 550, comprometimento de renda até 35%)
- Geração de protocolo na formalização

As operações de análise e formalização retornam `Observable` com delay simulado, preparando a troca por chamadas HTTP reais.

**`CreditFlowService`** gerencia o estado da sessão com Angular Signals e controla o acesso às etapas via `canAccessStep()`.

### Rotas

As páginas são carregadas sob demanda com `loadComponent`:

| Rota | Página |
|------|--------|
| `/simulacao` | Simulação de crédito |
| `/analise` | Análise de crédito |
| `/cadastro` | Cadastro do cliente |
| `/formalizacao` | Biometria e contrato |

## Estrutura do projeto

```
src/app/
├── app.ts / app.html / app.css
├── app.routes.ts
├── app.config.ts
├── models/
│   └── credit.models.ts
├── services/
│   ├── credit.service.ts
│   └── credit-flow.service.ts
├── components/
│   └── stepper/
└── pages/
    ├── simulation/
    ├── analysis/
    ├── registration/
    └── formalization/
```

Cada componente possui arquivos separados (`.ts`, `.html`, `.css`).

## Decisões técnicas

- **Standalone components** — sem `NgModule`, alinhado ao padrão atual do Angular
- **Signals + RxJS** — signals para estado síncrono do fluxo; RxJS para operações assíncronas
- **Reactive Forms** — validações e máscaras nos formulários de simulação e cadastro
- **Lazy loading** — redução do bundle inicial com carregamento por rota
- **Mock de API** — regras de negócio isoladas no service, facilitando integração futura com backend

## Escopo e limitações

- Dados não são persistidos (estado em memória durante a sessão)
- Análise de crédito e formalização utilizam respostas simuladas
- Validação de CPF por formato, sem consulta a serviços externos
- Biometria simula validação facial; não há integração com provedor de identidade

## Licença

Projeto desenvolvido como desafio técnico. Uso livre para avaliação.
