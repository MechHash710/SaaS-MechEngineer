import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import type { SolarHeatingOutput } from '../../../types/solar';
import type { ValidationAlert } from '../../../types/hvac';
import { ShieldCheck, Droplets, Sun, BatteryFull, FileText, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { AuditSteps } from '../../../components/AuditSteps';
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Cell } from 'recharts';

interface SolarResultsProps {
  result: SolarHeatingOutput;
  isLoading: boolean;
  onGenerateReport: (leadInfo: { name: string; email: string; phone: string }) => void;
}

export const SolarResults: React.FC<SolarResultsProps> = ({ result, isLoading, onGenerateReport }) => {
  const [activeTab, setActiveTab] = useState<'resume' | 'audit'>('resume');
  const [lead, setLead] = useState({ name: '', email: '', phone: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateReport(lead);
  };

  const solarFrac = result.fracao_solar; // 0-1 decimal value
  const pieData = [
    { name: 'Energia Solar', value: Math.round(solarFrac * 100) },
    { name: 'Apoio Complementar', value: Math.max(0, Math.round((1 - solarFrac) * 100)) },
  ];
  const PIE_COLORS = ['#10b981', '#f43f5e'];

  // Projeção 10 anos linear com infração irrisória visual
  const projectionData = Array.from({ length: 10 }).map((_, i) => ({
    year: `Ano ${i + 1}`,
    savings: Math.round(result.economia_anual_brl * (i + 1) * (1 + (i * 0.05))) // inflação energética 5% ao ano
  }));

  const activeTabClass = "px-4 py-2 text-sm font-medium border-b-2 border-emerald-600 text-emerald-600";
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
      {/* Custom Tabs Navigation */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button 
            onClick={() => setActiveTab('resume')}
            className={activeTab === 'resume' ? activeTabClass : inactiveTabClass}
          >
            Resumo do Dimensionamento
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={activeTab === 'audit' ? activeTabClass : inactiveTabClass}
          >
            Revisão Técnica
          </button>
        </nav>
      </div>

      <div className="mt-4">
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
        )}

        {activeTab === 'resume' ? (
        <div className="space-y-6 animate-in fade-in">
          {/* LAYER 1: Resultados Chave */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card className="border-primary-200 bg-primary-50">
               <CardContent className="pt-6">
                 <h3 className="text-sm font-semibold text-primary-900 uppercase tracking-wider mb-2 flex items-center">
                    <Droplets className="h-4 w-4 mr-2"/> Volume Boiler
                 </h3>
                 <div className="flex items-baseline space-x-2">
                   <span className="text-4xl font-extrabold text-primary-700">{result.volume_boiler_l.toLocaleString('pt-BR')}</span>
                   <span className="text-lg font-medium text-primary-600">Litros</span>
                 </div>
               </CardContent>
             </Card>

             <Card className="border-amber-200 bg-amber-50">
               <CardContent className="pt-6">
                 <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wider mb-2 flex items-center">
                    <Sun className="h-4 w-4 mr-2"/> Área Sola
                 </h3>
                 <div className="flex items-baseline space-x-2">
                   <span className="text-4xl font-extrabold text-amber-700">{result.area_coletores_m2.toLocaleString('pt-BR')}</span>
                   <span className="text-lg font-medium text-amber-600">m²</span>
                 </div>
               </CardContent>
             </Card>

             <Card className="border-emerald-200 bg-emerald-50">
               <CardContent className="pt-6">
                 <h3 className="text-sm font-semibold text-emerald-900 uppercase tracking-wider mb-2 flex items-center">
                    <BatteryFull className="h-4 w-4 mr-2"/> Economia/Ano
                 </h3>
                 <div className="flex items-baseline space-x-2">
                   <span className="text-4xl font-extrabold text-emerald-700">R$ {result.economia_anual_brl.toLocaleString('pt-BR')}</span>
                 </div>
               </CardContent>
             </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recomendação Técnica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-4 rounded border border-slate-100 flex items-start">
                 <ShieldCheck className="h-6 w-6 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
                 <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Configuração Sugerida</h4>
                    <p className="text-sm text-slate-700">{result.recomendacao_sistema}</p>
                 </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-sm">
                  <span>Matriz Energética AQS</span>
                  {solarFrac >= 0.5 ? (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">NBR 15569 OK</span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">Abaixo Norma (50%)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {pieData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip formatter={(value: any) => [`${value}%`, 'Participação']} />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex justify-center gap-4 text-xs mt-2">
                    <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-1"/>Solar</span>
                    <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-rose-500 mr-1"/>Apoio</span>
                 </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Retorno Acumulado (10 anos)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} tickFormatter={(val) => `R$${val/1000}k`} />
                      <ChartTooltip formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Acumulado']} />
                      <Line type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={3} dot={{r: 4}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* LAYER 3: Call to Action for ART */}
          <Card>
            <CardHeader>
              <CardTitle>Gerar Relatório Solar e ART</CardTitle>
              <CardDescription>
                Exporte o memorial termodinâmico completo (Carga kWh, áreas de telhado, eficiências) e memorial descritivo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    placeholder="Seu Nome ou Empresa Solicitante" 
                    required 
                    value={lead.name} 
                    onChange={e => setLead({...lead, name: e.target.value})} 
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2.5 border outline-none" 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input 
                    type="email" 
                    placeholder="E-mail" 
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
                  {isLoading ? 'Compilando Documentos Térmicos...' : <span className="flex items-center"><FileText className="mr-2 h-5 w-5"/> Exportar Relatório Auditável</span>}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <AuditSteps 
          title="Memorial Matemático AQS (NBR 15569)" 
          description="Auditoria do cálculo de Fração Solar e demanda de água quente sanitária." 
          steps={result.step_by_step} 
          constants={result.constants_used} 
          references={result.references} 
        />
      )}
      </div>
    </div>
  );
};
