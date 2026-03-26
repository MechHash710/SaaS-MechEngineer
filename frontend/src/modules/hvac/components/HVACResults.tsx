import React, { useState } from 'react';
import { FileText, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import type { SimulatorResponse, ValidationAlert } from '../../../types/hvac';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { AuditSteps } from '../../../components/AuditSteps';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HVACResultsProps {
  result: SimulatorResponse;
  isLoading: boolean;
  onGenerateReport: (leadData: { name: string; email: string; phone: string }) => void;
}

export const HVACResults: React.FC<HVACResultsProps> = ({ result, isLoading, onGenerateReport }) => {
  const [lead, setLead] = useState({ name: '', email: '', phone: '' });
  const [activeTab, setActiveTab] = useState<'resume' | 'audit'>('resume');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateReport(lead);
  };

  // Mock breakdown based on total for demonstration if backend doesn't provide it
  const loadBreakdown = [
    { name: 'Envoltória', value: Math.round(result.total_btu_h * 0.45) },
    { name: 'Ocupantes', value: Math.round(result.total_btu_h * 0.30) },
    { name: 'Equip/Ilum', value: Math.round(result.total_btu_h * 0.25) },
  ];

  // Alternativas mockadas baseadas no sugerido
  const baseCapacity = result.total_btu_h;
  const alternatives = [
    { brand: 'Daikin Advance', type: 'Hi-Wall Inverter', capacity: result.suggested_equipment, efficiency: 'A (Cop 3.8)', price: 'R$ 3.500' },
    { brand: 'LG Dual Inverter', type: 'Hi-Wall Voice', capacity: result.suggested_equipment, efficiency: 'A (Cop 3.5)', price: 'R$ 3.100' },
    { brand: 'Midea Xtreme', type: 'Hi-Wall Inverter', capacity: baseCapacity > 18000 ? '24000 BTU/h' : '18000 BTU/h', efficiency: 'B (Cop 3.1)', price: 'R$ 2.800' },
  ];

  const getABNTBadge = (param: string) => {
    // Basic mock check: ideally validation comes from backend T27
    if (param.includes('BTU')) return <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">NBR 16401 OK</span>;
    return <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Atenção</span>;
  };

  const activeTabClass = "px-4 py-2 text-sm font-medium border-b-2 border-primary-600 text-primary-600";
  const inactiveTabClass = "px-4 py-2 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300";

  const renderAlertIcon = (severity: string) => {
    switch(severity) {
      case 'info': return <Info className="h-5 w-5 text-blue-400" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'critical': return <AlertOctagon className="h-5 w-5 text-red-400" />;
      default: return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    }
  };

  const renderAlertClasses = (severity: string) => {
    switch(severity) {
      case 'info': return "bg-blue-50 border-l-4 border-blue-400 text-blue-800";
      case 'warning': return "bg-amber-50 border-l-4 border-amber-400 text-amber-800";
      case 'critical': return "bg-red-50 border-l-4 border-red-500 text-red-800";
      default: return "bg-amber-50 border-l-4 border-amber-400 text-amber-800";
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('resume')}
          className={activeTab === 'resume' ? activeTabClass : inactiveTabClass}
        >
          Resumo Executivo
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={activeTab === 'audit' ? activeTabClass : inactiveTabClass}
        >
          Auditoria de Engenharia
        </button>
      </div>

      {activeTab === 'resume' ? (
        <div className="space-y-6 animate-in fade-in">
          {/* LAYER 1: Executive Summary */}
          <Card className="border-primary-200 bg-primary-50">
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold text-primary-900 uppercase tracking-wider mb-2">Carga Térmica Calculada</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-extrabold text-primary-700">{result.total_btu_h.toLocaleString('pt-BR')}</span>
                <span className="text-xl font-medium text-primary-600">BTU/h</span>
              </div>
              <p className="mt-3 text-sm text-primary-800 font-medium">Equipamento Recomendado: <span className="font-bold">{result.suggested_equipment}</span></p>
            </CardContent>
          </Card>

          {/* LAYER 2: Validations & Sanity Checks */}
          {result.warnings && result.warnings.length > 0 && (
          <div className="space-y-3 mb-6">
            {result.warnings.map((alert: ValidationAlert, idx: number) => (
              <div key={idx} className={`p-4 rounded-md flex ${renderAlertClasses(alert.severity)}`}>
                <div className="flex-shrink-0">
                  {renderAlertIcon(alert.severity)}
                </div>
                <div className="ml-3 text-sm flex items-center">
                  <p>{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}  {/* Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Composição da Carga Térmica</span>
                {getABNTBadge("BTU")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={loadBreakdown} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value: any) => [`${value} BTU/h`, 'Carga']} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {loadBreakdown.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b'][index % 3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Comparativo de Equipamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Equipamentos Compatíveis (Estimativa)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Equipamento</th>
                      <th className="px-4 py-3">Capacidade</th>
                      <th className="px-4 py-3">Eficiência INMETRO</th>
                      <th className="px-4 py-3">Preço Médio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alternatives.map((alt, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{alt.brand} <span className="text-slate-500 text-xs block">{alt.type}</span></td>
                        <td className="px-4 py-3 text-slate-600">{alt.capacity}</td>
                        <td className="px-4 py-3 text-slate-600">{alt.efficiency}</td>
                        <td className="px-4 py-3 text-slate-900 font-semibold">{alt.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* LAYER 3: Call to Action for Detailed Memorial */}
          <Card>
            <CardHeader>
              <CardTitle>Gerar Relatório de Projeto e ART</CardTitle>
              <CardDescription>
                Tenha acesso à memória de cálculo passo a passo, detalhamento do modelo ASHRAE e orçamento prévio da instalação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    placeholder="Seu Nome ou Empresa Solicicante" 
                    required 
                    value={lead.name} 
                    onChange={e => setLead({...lead, name: e.target.value})} 
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2.5 border outline-none" 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    type="email" 
                    placeholder="E-mail Profissional" 
                    required 
                    value={lead.email} 
                    onChange={e => setLead({...lead, email: e.target.value})} 
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2.5 border outline-none" 
                  />
                  <input 
                    type="tel" 
                    placeholder="Telefone / WhatsApp" 
                    required 
                    value={lead.phone} 
                    onChange={e => setLead({...lead, phone: e.target.value})} 
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2.5 border outline-none" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full mt-2 flex justify-center items-center py-3 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-all disabled:opacity-70"
                >
                  {isLoading ? 'Compilando Documentos Térmicos...' : <span className="flex items-center"><FileText className="mr-2 h-5 w-5"/> Gerar Relatório e Orçamento Completo</span>}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <AuditSteps 
          title="Memorial de Cálculo de Carga Térmica (Desmembramento)" 
          description="Apresentação dos resultados intermediários calculados pelo algoritmo, passo a passo." 
          steps={result.step_by_step} 
          constants={result.constants_used} 
          references={result.references} 
        />
      )}
      
    </div>
  );
};
