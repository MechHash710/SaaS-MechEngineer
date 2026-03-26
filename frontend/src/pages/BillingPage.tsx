import React, { useEffect, useState } from 'react';
import { CreditCard, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export const BillingPage: React.FC = () => {
  const { user } = useAuth();
  const [subData, setSubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await api.get('/billing/subscription');
        setSubData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSub();
  }, [user]);

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos ao final do ciclo.')) return;
    
    try {
      setCanceling(true);
      await api.post('/billing/cancel');
      alert('Assinatura cancelada com sucesso.');
      // Refresh user or logout to reset state
      window.location.reload();
    } catch(err) {
       console.error(err);
       alert('Erro ao cancelar assinatura');
    } finally {
       setCanceling(false);
    }
  };

  const handlePortal = async () => {
    try {
      setLoadingPortal(true);
      const res = await api.get('/billing/portal');
      if (res.data.portal_url) {
        window.location.href = res.data.portal_url;
      }
    } catch(err) {
       console.error(err);
       alert('Erro ao acessar o portal do Stripe.');
    } finally {
       setLoadingPortal(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando dados da assinatura...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Faturamento e Plano</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
               <CardTitle className="text-lg flex items-center"><CreditCard className="w-5 h-5 mr-2 text-slate-500"/> Seu Plano Atual</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <span className="text-sm font-semibold text-primary-600 uppercase tracking-widest">{subData?.plan || user?.plan || 'free'}</span>
                        <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Plano {subData?.plan?.toUpperCase() || 'FREE'}</h2>
                        <p className="text-sm text-slate-500 mt-2">
                           {subData?.is_active 
                             ? `Sua assinatura está ativa e renovará em ${new Date(subData?.expires_at).toLocaleDateString()}.` 
                             : 'Você está no plano gratuito com recursos limitados.'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    {(!subData?.is_active || subData?.plan === 'free') ? (
                       <Button onClick={() => window.location.href = '/?mode=pricing'} className="font-bold">Fazer Upgrade</Button>
                    ) : (
                       <div className="flex gap-4">
                         <Button variant="primary" onClick={handlePortal} loading={loadingPortal} className="font-bold">Gerenciar Assinatura (Portal)</Button>
                         <Button variant="danger" onClick={handleCancel} loading={canceling} className="bg-red-50 text-red-600 hover:bg-red-100 font-bold border-none shadow-none">Cancelar Assinatura</Button>
                       </div>
                    )}
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="bg-slate-50 border-b border-slate-100">
               <CardTitle className="text-lg flex items-center"><Clock className="w-5 h-5 mr-2 text-slate-500"/> Ciclo de Cobrança</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                {subData?.is_active ? (
                    <div className="text-center">
                        <Calendar className="w-10 h-10 text-primary-200 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-900">Próxima renovação</p>
                        <p className="text-slate-500 mb-4">{new Date(subData?.expires_at).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-400">Cobrança automática via Stripe</p>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Nenhum ciclo ativo.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

      {/* Histórico Mockado */}
      <h2 className="text-xl font-bold text-slate-900 mb-4 mt-12">Histórico de Faturas</h2>
      <Card>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                    <tr>
                        <th className="px-6 py-4 font-semibold">Data</th>
                        <th className="px-6 py-4 font-semibold">Descrição</th>
                        <th className="px-6 py-4 font-semibold">Valor</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Recibo</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {subData?.is_active ? (
                        <tr className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium">{new Date().toLocaleDateString()}</td>
                            <td className="px-6 py-4">Assinatura EngenhariaPro {subData?.plan}</td>
                            <td className="px-6 py-4 font-mono font-medium">R$ {subData?.plan === 'pro' ? '97,00' : '297,00'}</td>
                            <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Pago</span></td>
                            <td className="px-6 py-4 text-right"><a href="#" className="text-primary-600 hover:text-primary-900 font-medium">Download PDF</a></td>
                        </tr>
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhuma fatura encontrada.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};
