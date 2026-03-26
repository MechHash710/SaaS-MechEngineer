import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, DataTable, Button } from './ui';
import { getSimulationHistory } from '../lib/history';
import type { SimulationHistoryItem } from '../lib/history';

interface DashboardProps {
  onNewSimulation: (type: 'hvac' | 'solar') => void;
}

export function Dashboard({ onNewSimulation }: DashboardProps) {
  const [history, setHistory] = useState<SimulationHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getSimulationHistory());
  }, []);

  const columns = [
    { key: 'type', header: 'Módulo' },
    { 
      key: 'date', 
      header: 'Data',
      render: (row: SimulationHistoryItem) => new Date(row.date).toLocaleString('pt-BR')
    },
    { key: 'summary', header: 'Resumo' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bem-vindo, Engenheiro</h2>
          <p className="text-slate-500">Aqui está o resumo das suas simulações recentes.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => onNewSimulation('hvac')} variant="primary">Nova Carga Térmica</Button>
          <Button onClick={() => onNewSimulation('solar')} variant="secondary">Novo Projeto Solar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-medium uppercase tracking-wider">Total de Simulações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{history.length}</div>
            <p className="text-xs text-slate-400 mt-1">Neste dispositivo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500 font-medium uppercase tracking-wider">Última Simulação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-slate-800 line-clamp-1">
              {history.length > 0 ? history[0].type : "Nenhuma"}
            </div>
            <p className="text-sm text-slate-500 mt-1 line-clamp-1">
              {history.length > 0 ? history[0].summary : "Realize um cálculo para começar"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary-200 bg-primary-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary-700 font-medium uppercase tracking-wider">Plano Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary-900">Plano Free</div>
            <div className="mt-2 text-sm text-primary-700">
              <span className="font-semibold">{Math.min(history.length, 5)}/5</span> simulações usadas
            </div>
            <div className="w-full bg-primary-200 h-2 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-primary-600 h-full rounded-full" 
                style={{ width: `${Math.min((history.length / 5) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={history.slice(0, 5)} 
            columns={columns} 
            emptyMessage="Você ainda não realizou nenhuma simulação."
          />
        </CardContent>
      </Card>
    </div>
  );
}
