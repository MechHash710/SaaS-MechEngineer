import React from 'react';
import { Wind, ShieldCheck, FileText, ChevronRight, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Wind className="h-8 w-8 text-primary-600" />
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">Engenharia<span className="text-primary-600">Pro</span></span>
          </div>
          <div className="flex gap-4 items-center">
            <a href="/?mode=login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Entrar</a>
            <Button onClick={() => window.location.href='/?mode=register'} className="text-sm font-semibold rounded-full shadow-sm">Criar conta</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
           <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-indigo-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 mt-12 mx-auto max-w-4xl text-balance">
            A plataforma defintiva para <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Projetos de Climatização e Aquecimento</span>
          </h1>
          <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto text-balance">
            Do cálculo térmico ASHRAE/NBR à emissão do Laudo Técnico para ART em poucos minutos. Aumente a velocidade da sua consultoria de engenharia.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button onClick={() => window.location.href='/?mode=register'} size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white">
              Começar grátis agora <ChevronRight className="w-5 h-5"/>
            </Button>
            <Button onClick={() => window.location.href='/?mode=login'} variant="secondary" size="lg" className="rounded-full bg-white shadow-sm hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold">
              Agendar Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features - 3 Cards */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-primary-600 font-bold tracking-wide uppercase">Tudo em um só lugar</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Nossos Simuladores Especializados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: 'Carga Térmica AVAC', icon: Wind, desc: 'Motor termodinâmico completo padrão ASHRAE e NBR 16401. Cálculos de condução, radiação e ganhos internos precisos.' },
              { title: 'Aquecimento Solar AQS', icon: ShieldCheck, desc: 'Dimensionamento avançado paramétrico NBR 15569. Dados de irradiação geolocalizados para Fração Solar exata.' },
              { title: 'Pipelines de ART e Laudos', icon: FileText, desc: 'Geração integrada de Memoriais de Cálculo, Laudos de Engenharia e Especificações de Equipamentos Prontos para CREA.' },
            ].map((f, i) => (
              <div key={i} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                  <f.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-slate-900 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-base text-primary-400 font-bold tracking-wide uppercase">Planos de Assinatura</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl text-balance">
              Preços transparentes, de engenheiro para engenheiro.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Basic', price: 'Grátis', desc: 'Perfeito para estudantes e iniciantes.', cta: 'Criar conta grátis', features: ['Até 3 projetos simultâneos', 'Simulador AVAC Básico', 'Relatórios com Marca D\'água'] },
              { name: 'Pro', price: 'R$ 149', span: '/mês', desc: 'Para profissionais e consultorias experientes.', cta: 'Assine o Pro', pop: true, features: ['Acesso a todos os Simuladores', 'Laudos Ilimitados NBR/CREA', 'Personalização de PDF (Logo)', 'Suporte Prioritário'] },
              { name: 'Enterprise', price: 'Custom', desc: 'Licenças para times e grandes escritórios de projeto.', cta: 'Falar com vendas', features: ['Tudo do Pro', 'Workspaces de Equipes', 'APIs de Integração', 'Treinamento Dedicado'] },
            ].map((p, i) => (
              <div key={i} className={`rounded-3xl p-8 ${p.pop ? 'bg-primary-600 text-white shadow-2xl scale-105 border border-primary-500' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                <h3 className={`text-2xl font-bold ${p.pop ? 'text-white' : 'text-slate-100'}`}>{p.name}</h3>
                <p className="mt-4 text-sm min-h-12">{p.desc}</p>
                <div className="my-8">
                  <span className={`text-4xl font-extrabold ${p.pop ? 'text-white' : 'text-slate-100'}`}>{p.price}</span>
                  {p.span && <span className="text-sm">{p.span}</span>}
                </div>
                <Button onClick={() => window.location.href='/?mode=register'} className={`w-full mb-8 font-bold ${p.pop ? 'bg-white text-primary-900 hover:bg-slate-100' : 'bg-slate-700 hover:bg-slate-600 text-white'} rounded-full py-3`}>{p.cta}</Button>
                <div className="space-y-4">
                  {p.features.map((f, k) => (
                    <div key={k} className="flex items-center gap-3">
                      <Check className={`w-5 h-5 ${p.pop ? 'text-primary-200' : 'text-primary-500'}`} />
                      <span className="text-sm font-medium">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-12">Quem usa e confia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl relative">
                <p className="text-slate-700 text-lg leading-relaxed italic border-l-4 border-primary-500 pl-4 py-2">
                  "O Simulador AVAC reduziu meu tempo de dimensionamento de 3 horas para 15 minutos. A integração com os laudos já formatados para a ART é fantástica."
                </p>
                <div className="mt-6 flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">CF</div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">Carlos Freitas</div>
                    <div className="text-sm text-slate-500">Engenheiro Mecânico Sênior</div>
                  </div>
                </div>
             </div>
             <div className="p-8 bg-slate-50 border border-slate-100 rounded-3xl relative">
                <p className="text-slate-700 text-lg leading-relaxed italic border-l-4 border-indigo-500 pl-4 py-2">
                  "Eu não fecho mais propostas de aquecimento solar sem usar a plataforma. O relatório financeiro gerado impressiona os clientes arquitetos."
                </p>
                <div className="mt-6 flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">MT</div>
                  <div className="text-left">
                    <div className="font-bold text-slate-900">Mariana Torquato</div>
                    <div className="text-sm text-slate-500">Projetista Energética</div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-primary-50 mb-0 border-t border-primary-100 text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Pronto para elevar seu nível?</h2>
        <Button onClick={() => window.location.href='/?mode=register'} size="lg" className="rounded-full shadow-lg text-lg font-bold bg-primary-600 hover:bg-primary-700 text-white px-8 py-4">
          Experimente agora
        </Button>
      </section>

    </div>
  );
};
