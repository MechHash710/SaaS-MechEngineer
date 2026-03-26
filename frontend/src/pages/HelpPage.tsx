import React, { useState } from 'react';

const FAQ_ITEMS = [
  {
    category: 'Conta & Acesso',
    questions: [
      {
        q: 'Esqueci minha senha. Como recupero?',
        a: 'Clique em "Esqueci minha senha" na tela de login. Um link de recuperação será enviado para seu e-mail cadastrado.'
      },
      {
        q: 'Posso usar a plataforma sem criar conta?',
        a: 'Não. A conta é necessária para controlar as quotas do plano e salvar o histórico de simulações.'
      }
    ]
  },
  {
    category: 'Planos e Billing',
    questions: [
      {
        q: 'O que acontece quando atinjo o limite do plano Free?',
        a: 'As simulações são bloqueadas e a API retorna HTTP 403. Você pode fazer upgrade em Configurações → Plano.'
      },
      {
        q: 'Posso cancelar o plano Pro a qualquer momento?',
        a: 'Sim. Acesse o Portal de Cobrança Stripe em Configurações → Gerenciar Assinatura e cancele. O plano Free é restaurado ao final do ciclo atual.'
      }
    ]
  },
  {
    category: 'Simuladores',
    questions: [
      {
        q: 'Os cálculos seguem normas ABNT?',
        a: 'Sim. O simulador HVAC segue a ABNT NBR 16401-1 e o Solar segue a ABNT NBR 15569. Cada passo cita a norma e o artigo correspondente.'
      },
      {
        q: 'Posso confiar nos resultados para emitir uma ART?',
        a: 'A plataforma é uma ferramenta de apoio. A responsabilidade técnica pela ART é sempre do engenheiro registrado no CREA. Revise todos os resultados antes de assinar.'
      },
      {
        q: 'O Simulador HVAC considera pontes térmicas?',
        a: 'Parcialmente. O fator de segurança de +10% no cálculo compensa cargas não modeladas, incluindo pontes térmicas, infiltração e envelhecimento do equipamento.'
      }
    ]
  },
  {
    category: 'Documentos / PDFs',
    questions: [
      {
        q: 'Posso editar os PDFs gerados?',
        a: 'Os PDFs são documentos fechados. Refaça a simulação com os valores corretos e gere um novo PDF se necessário.'
      },
      {
        q: 'O PDF inclui assinatura digital?',
        a: 'Não nesta versão. O campo de CREA está incluso, mas a assinatura digital deve ser adicionada via ferramenta externa (ex: Docusign, Adobe Sign).'
      }
    ]
  }
];

const SIMULATORS = [
  { name: 'Carga Térmica HVAC', guide: 'NBR 16401-1', description: 'Dimensionamento de ar-condicionado por carga térmica.' },
  { name: 'Aquecimento Solar', guide: 'NBR 15569', description: 'Dimensionamento de sistema solar para AQS.' },
  { name: 'Ventilação Mecânica', guide: 'ASHRAE 62.1', description: 'Cálculo de vazão de ar externo e dutos.' },
  { name: 'Eficiência Energética', guide: 'INI-C', description: 'Avaliação de consumo e classificação PBE Edifica.' },
  { name: 'HVAC Completo', guide: 'NBR 16401', description: 'Integra carga térmica + ventilação + seleção de equipamento.' }
];

const HelpPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleAccordion = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Central de Ajuda</h1>
          <p className="text-gray-500">
            Guias, FAQ e referências técnicas para a Plataforma de Simulação de Engenharia
          </p>
        </div>

        {/* Simulators Quick Reference */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🧮 Simuladores Disponíveis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SIMULATORS.map((sim) => (
              <div
                key={sim.name}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{sim.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{sim.description}</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-mono whitespace-nowrap ml-2 flex-shrink-0">
                    {sim.guide}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            ❓ Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((category) => (
              <div key={category.category}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {category.category}
                </h3>
                <div className="space-y-2">
                  {category.questions.map((item, qIndex) => {
                    const key = `${category.category}-${qIndex}`;
                    const isOpen = openIndex === key;
                    return (
                      <div
                        key={key}
                        className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                      >
                        <button
                          id={`faq-btn-${key}`}
                          className="w-full text-left flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition-colors"
                          onClick={() => toggleAccordion(key)}
                        >
                          <span className="font-medium text-gray-800">{item.q}</span>
                          <span className="text-gray-400 ml-2 flex-shrink-0">
                            {isOpen ? '▲' : '▼'}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* API Docs Link (dev only) */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📡 Documentação Técnica da API
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-gray-600 text-sm mb-4">
              Explore todos os endpoints da API com exemplos de request/response no Swagger UI.
            </p>
            <a
              id="swagger-docs-link"
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Abrir Swagger UI ↗
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpPage;
