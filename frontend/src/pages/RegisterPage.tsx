import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wind } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const [errorParam, setErrorParam] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setErrorParam(null);
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
      window.location.href = '/?mode=onboarding';
    } catch (err: any) {
      setErrorParam(err.response?.data?.detail || "Erro ao registrar. Tente outro e-mail.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Wind className="mx-auto h-12 w-12 text-primary-600" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Crie sua conta</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Ou{' '}
          <a href="/?mode=login" className="font-medium text-primary-600 hover:text-primary-500">
            faça login se já possui conta
          </a>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {errorParam && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                 {errorParam}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nome Completo</label>
              <div className="mt-1">
                <input
                  id="name"
                  {...register('name')}
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-mail</label>
              <div className="mt-1">
                <input
                  id="email"
                  {...register('email')}
                  type="email"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Senha</label>
              <div className="mt-1">
                <input
                  id="password"
                  {...register('password')}
                  type="password"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">Confirmar Senha</label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  type="password"
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div>
              <Button type="submit" loading={isSubmitting} className="w-full flex justify-center py-2.5 bg-primary-600 text-white">
                Criar Conta
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
