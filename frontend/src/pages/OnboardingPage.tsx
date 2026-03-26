import React, { useState } from 'react';
import { Wind, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [specialty, setSpecialty] = useState<string | null>(null);

  const completeOnboarding = () => {
    window.location.href = '/?mode=dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        
        {/* Progress Bar */}
        <div className="mb-8">
            <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <span className={step >= 1 ? 'text-primary-600' : ''}>Bem-vindo</span>
                <span className={step >= 2 ? 'text-primary-600' : ''}>Especialidade</span>
                <span className={step >= 3 ? 'text-primary-600' : ''}>Tutorial</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full w-full">
                <div 
                   className="h-2 bg-primary-600 rounded-full transition-all duration-500"
                   style={{ width: `${(step / 3) * 100}%` }}
                ></div>
            </div>
        </div>

        <div className="bg-white py-10 px-8 flex flex-col items-center justify-center shadow-xl shadow-slate-200/50 sm:rounded-2xl border border-slate-200 text-center">
            
            {step === 1 && (
                <div className="animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                       <CheckCircle2 className="w-8 h-8 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Conta Criada!</h2>
                    <p className="text-lg text-slate-600 mb-8 max-w-sm mx-auto">
                        Bem-vindo(a) ao EngenhariaPro. A plataforma mais rápida para seus projetos e ARTs.
                    </p>
                    <Button onClick={() => setStep(2)} size="lg" className="w-full font-bold">Continuar <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
            )}

            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full">
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Qual sua área principal de atuação?</h2>
                    <p className="text-sm text-slate-600 mb-8">
                        Isso nos ajudará a configurar seu painel principal e recomendar as melhores ferramentas.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-4 mb-8">
                        <button 
                            onClick={() => setSpecialty('hvac')}
                            className={`p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${specialty === 'hvac' ? 'border-primary-600 bg-primary-50' : 'border-slate-200 hover:border-primary-300'}`}
                        >
                            <Wind className={`w-6 h-6 ${specialty === 'hvac' ? 'text-primary-600' : 'text-slate-400'}`} />
                            <div>
                                <h3 className={`font-bold ${specialty === 'hvac' ? 'text-primary-900' : 'text-slate-800'}`}>Climatização (AVAC)</h3>
                                <p className="text-xs text-slate-500 mt-1">Cálculos térmicos, ventilação e dimensionamento de VRF/Splits.</p>
                            </div>
                        </button>
                        
                        <button 
                            onClick={() => setSpecialty('solar')}
                            className={`p-4 rounded-xl border-2 text-left flex items-start gap-4 transition-all ${specialty === 'solar' ? 'border-primary-600 bg-primary-50' : 'border-slate-200 hover:border-primary-300'}`}
                        >
                            <ShieldCheck className={`w-6 h-6 ${specialty === 'solar' ? 'text-primary-600' : 'text-slate-400'}`} />
                            <div>
                                <h3 className={`font-bold ${specialty === 'solar' ? 'text-primary-900' : 'text-slate-800'}`}>Aquecimento Solar</h3>
                                <p className="text-xs text-slate-500 mt-1">Sistemas Térmicos de AQS, Simulação de Coletor NBR 15569.</p>
                            </div>
                        </button>
                    </div>

                    <Button onClick={() => setStep(3)} disabled={!specialty} size="lg" className="w-full font-bold">Próximo <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
            )}

            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500 w-full text-left">
                    <h2 className="text-2xl font-extrabold text-slate-900 mb-6 text-center">Como criar sua primeira simulação</h2>
                    
                    <div className="space-y-6 mb-8">
                       <div className="flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
                          <div>
                              <h4 className="font-bold text-slate-900 mb-1">Crie um Projeto</h4>
                              <p className="text-sm text-slate-600 text-balance">Organize seus clientes acessando a aba <b>Projetos</b>. Um Workspace organiza as simulações e históricos.</p>
                          </div>
                       </div>
                       <div className="flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
                          <div>
                              <h4 className="font-bold text-slate-900 mb-1">Abra um Simulador</h4>
                              <p className="text-sm text-slate-600 text-balance">Nossa IA termodinâmica validará suas entradas. O motor leva ~150ms para desdobrar a série numérica das normas ABNT aplicáveis.</p>
                          </div>
                       </div>
                       <div className="flex gap-4 items-start">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
                          <div>
                              <h4 className="font-bold text-slate-900 mb-1">Gere Memoriais e Laudos</h4>
                              <p className="text-sm text-slate-600 text-balance">No resultado, clique em "Relatório Completo" ou "Laudo Técnico" para gerar o PDF exigido na sua Anotação de Responsabilidade Técnica (ART).</p>
                          </div>
                       </div>
                    </div>

                    <Button onClick={completeOnboarding} size="lg" className="w-full font-bold bg-primary-600 hover:bg-primary-700 text-white">Ir para o meu Dashboard</Button>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
