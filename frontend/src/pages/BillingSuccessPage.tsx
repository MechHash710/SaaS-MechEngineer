import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

export const BillingSuccessPage: React.FC = () => {

  useEffect(() => {
    // Redireciona para o dashboard após sucesso
    const timer = setTimeout(() => {
      window.location.href = '/?mode=dashboard';
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Assinatura Ativa!</h2>
        <p className="text-slate-600 mb-8">
          Sua assinatura foi processada com sucesso. Você agora tem acesso aos benefícios adicionais do seu plano.
        </p>
        
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary-500 h-full animate-[progress_4s_ease-in-out_forwards]" />
        </div>
        <p className="text-sm text-slate-400 mt-4">Redirecionando para o dashboard...</p>
      </div>
    </div>
  );
};
