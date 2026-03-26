import React, { useState } from 'react';
import { Wind } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending email (would be connected to backend)
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Wind className="mx-auto h-12 w-12 text-primary-600" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Recuperar senha</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Você receberá um link para redefinir sua senha.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          {isSubmitted ? (
             <div className="text-center">
                 <div className="bg-emerald-50 text-emerald-700 p-4 rounded-md mb-6">
                     Um link de recuperação foi enviado para <b>{email}</b>. Verifique sua caixa de spam se não encontrar.
                 </div>
                 <Button onClick={() => window.location.href = '/?mode=login'} variant="secondary" className="w-full">
                    Voltar para o Login
                 </Button>
             </div>
          ) : (
             <form className="space-y-6" onSubmit={onSubmit}>
               <div>
                 <label className="block text-sm font-medium text-slate-700">E-mail</label>
                 <div className="mt-1">
                   <input
                     required
                     type="email"
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                   />
                 </div>
               </div>

               <div>
                 <Button type="submit" className="w-full flex justify-center py-2.5 bg-primary-600 text-white">
                   Enviar Link
                 </Button>
               </div>
               
               <div className="text-center pt-2">
                 <a href="/?mode=login" className="font-medium text-sm text-slate-500 hover:text-slate-800">
                    Cancelar
                 </a>
               </div>
             </form>
          )}
        </div>
      </div>
    </div>
  );
};
