import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wind } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [errorParam, setErrorParam] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setErrorParam(null);
    try {
      await login(data);
      window.location.href = '/?mode=dashboard';
    } catch (err: any) {
      setErrorParam(err.response?.data?.detail || "E-mail ou senha incorretos.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Wind className="mx-auto h-12 w-12 text-primary-600" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Entrar na plataforma</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Ou{' '}
          <a href="/?mode=register" className="font-medium text-primary-600 hover:text-primary-500">
            crie sua conta gratuitamente
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <a href="/?mode=forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <div>
              <Button type="submit" loading={isSubmitting} className="w-full flex justify-center py-2.5 bg-primary-600 text-white">
                Entrar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
