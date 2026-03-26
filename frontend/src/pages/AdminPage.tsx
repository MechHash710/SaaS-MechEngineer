import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, Activity, FileText, Settings, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import type { ColumnDef } from '../components/ui/DataTable';
import { api } from '../lib/api';

interface AdminStats {
  total_users: number;
  mrr: number;
  sims_per_day: number;
  total_pdfs: number;
  graph_data: { date: string; simulations: number }[];
}

interface UserData {
  id: string;
  name: string;
  email: string;
  plan: string;
  created_at: string;
  simulations: number;
}

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStats, resUsers] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(resStats.data);
      setUsers(resUsers.data.data);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar dados do admin. Verifique suas permissões.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangePlan = async (userId: string, currentPlan: string) => {
    const newPlan = prompt(`Alterar plano do usuário.\nPlanos válidos: free, pro, enterprise\nPlano atual: ${currentPlan}`, currentPlan);
    if (!newPlan || newPlan === currentPlan) return;
    
    try {
       await api.patch(`/admin/users/${userId}/plan`, { plan: newPlan });
       fetchData();
    } catch(err) {
       console.error(err);
       alert('Falha ao alterar plano.');
    }
  };

  const columns: ColumnDef<UserData>[] = [
    { header: 'Nome', key: 'name' },
    { header: 'Email', key: 'email' },
    { 
       header: 'Plano', 
       key: 'plan',
       render: (row) => {
          const val = row.plan;
          return (
          <span 
             className={`px-2 py-1 flex items-center gap-2 rounded-full text-xs font-semibold w-fit cursor-pointer ${val === 'pro' ? 'bg-primary-100 text-primary-800' : val === 'enterprise' ? 'bg-fuchsia-100 text-fuchsia-800' : 'bg-slate-100 text-slate-800'}`}
             onClick={() => handleChangePlan(row.id, val)}
             title="Clique para alterar o plano"
          >
             {String(val).toUpperCase()} <Settings className="w-3 h-3"/>
          </span>
          );
       }
    },
    { header: 'Simulações', key: 'simulations' },
    { 
       header: 'Acesso', 
       key: 'created_at',
       render: (row) => new Date(String(row.created_at)).toLocaleDateString()
    }
  ];

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando painel administrativo...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-red-100 rounded-lg">
           <ShieldAlert className="w-6 h-6 text-red-600" />
        </div>
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Dashboard Administrativo</h1>
           <p className="text-slate-500 text-sm">Visão geral e gestão de usuários</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Usuários Ativos</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats?.total_users}</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">MRR (Mensal)</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">R$ {stats?.mrr.toLocaleString('pt-BR')}</h3>
              </div>
              <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Simulações / Dia</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats?.sims_per_day}</h3>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg"><Activity className="w-5 h-5 text-purple-600" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">PDFs Gerados</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats?.total_pdfs}</h3>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg"><FileText className="w-5 h-5 text-orange-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <Card className="h-full">
               <CardHeader>
                  <CardTitle>Gestão de Usuários</CardTitle>
               </CardHeader>
               <CardContent>
                  <DataTable columns={columns} data={users} />
               </CardContent>
            </Card>
         </div>

         <div>
            <Card className="h-full">
               <CardHeader>
                  <CardTitle>Simulações (Últimos 7 dias)</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="flex flex-col gap-3">
                     {stats?.graph_data.map((d) => (
                        <div key={d.date} className="flex items-center gap-4">
                           <span className="w-12 text-xs text-slate-500">{d.date}</span>
                           <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary-500" style={{ width: `${Math.min(100, (d.simulations / Math.max(...stats.graph_data.map(g=>g.simulations), 1))*100)}%` }} />
                           </div>
                           <span className="w-6 text-right text-xs font-bold text-slate-700">{d.simulations}</span>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
};
