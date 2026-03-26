import React, { useState } from 'react';
import { Download, AlertTriangle, Wind, Zap, ThermometerSnowflake, Ruler, Settings } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { HVACCompleteOutput } from '../../../types/hvacComplete';

interface Props {
  result: HVACCompleteOutput;
  isLoading: boolean;
  onGenerateReport: (leadInfo: { name: string; email: string; phone: string }) => void;
}

export const HVACCompleteResults: React.FC<Props> = ({ result, isLoading, onGenerateReport }) => {
  const [activeTab, setActiveTab] = useState<'termico' | 'ventilacao' | 'tubulacao' | 'equipamento'>('termico');

  // Helper to filter step_by_step
  const getStepsByPrefix = (prefix: string) => {
    return Object.entries(result.step_by_step).filter(([key]) => key.startsWith(prefix));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {result.warnings.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
           <div className="flex items-start">
             <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
             <div>
               <h3 className="text-sm font-medium text-amber-800">Avisos de Validação</h3>
               <div className="mt-2 text-sm text-amber-700">
                 <ul className="list-disc pl-5 space-y-1">
                   {result.warnings.map((w, i) => <li key={i}>{w.message}</li>)}
                 </ul>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* Unified Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <ThermometerSnowflake className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-blue-100 text-sm mt-4 font-medium">Carga Térmica Total</p>
            <h3 className="text-2xl font-bold mt-1">{result.carga_termica_btu_h.toLocaleString()} BTU/h</h3>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white border-none shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <Wind className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-teal-100 text-sm mt-4 font-medium">Vazão Ar Externo (O/A)</p>
            <h3 className="text-2xl font-bold mt-1">{result.vazao_ar_m3h.toLocaleString()} m³/h</h3>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start text-primary-600">
              <SettingsIcon />
            </div>
            <p className="text-slate-500 text-sm mt-4 font-medium">Máquina Estimada</p>
            <h3 className="text-lg font-bold text-slate-900 mt-1 leading-tight">{result.equipamento_recomendado}</h3>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start text-primary-600">
              <Zap className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-slate-500 text-sm mt-4 font-medium">Potência Elétrica (Frio)</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{result.potencia_eletrica_estimada_w.toLocaleString()} W</h3>
            <p className="text-xs text-slate-400 mt-1">{result.eficiencia_estimada}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 mb-6 overflow-x-auto print:hidden">
        <button 
           className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'termico' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           onClick={() => setActiveTab('termico')}
        >Carga Térmica</button>
        <button 
           className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'ventilacao' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           onClick={() => setActiveTab('ventilacao')}
        >Ventilação</button>
        <button 
           className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'tubulacao' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           onClick={() => setActiveTab('tubulacao')}
        >Redes (Dutos/Tubos)</button>
        <button 
           className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'equipamento' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
           onClick={() => setActiveTab('equipamento')}
        >Memorial de Cálculo</button>
      </div>

      {/* Tab Contents */}
      <Card>
        <CardContent className="pt-6">
          {activeTab === 'termico' && (
             <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Detalhamento Térmico</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                   {getStepsByPrefix('[Carga]').map(([k, v]) => (
                     <div key={k} className="flex justify-between border-b border-slate-100 py-2">
                       <span className="text-slate-600">{k.replace('[Carga] ', '')}</span>
                       <span className="font-semibold text-slate-900">{v}</span>
                     </div>
                   ))}
                </div>
             </div>
          )}
          {activeTab === 'ventilacao' && (
             <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Detalhamento de Qualidade do Ar (IAQ)</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                   {getStepsByPrefix('[Ventilação]').map(([k, v]) => (
                     <div key={k} className="flex justify-between border-b border-slate-100 py-2">
                       <span className="text-slate-600">{k.replace('[Ventilação] ', '')}</span>
                       <span className="font-semibold text-slate-900">{v}</span>
                     </div>
                   ))}
                </div>
             </div>
          )}
          {activeTab === 'tubulacao' && (
             <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Dimensionamento Físico de Redes</h3>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
                     <div className="bg-white p-3 rounded-full flex-shrink-0">
                       <Wind className="w-6 h-6 text-primary-500" />
                     </div>
                     <div>
                       <p className="text-sm font-semibold text-slate-900">Duto Principal (Tomada de Ar Externo)</p>
                       <p className="text-xs text-slate-500">Com base em vel. máx recomendada de 4.5 m/s e seção circular.</p>
                       <p className="text-lg font-bold text-primary-700 mt-1">Ø {result.duto_diametro_mm} mm</p>
                     </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg flex items-center gap-4">
                     <div className="bg-white p-3 rounded-full flex-shrink-0">
                       <Ruler className="w-6 h-6 text-indigo-500" />
                     </div>
                     <div>
                       <p className="text-sm font-semibold text-slate-900">Tubulação Frigorífica (Split/VRF Padrão)</p>
                       <p className="text-xs text-slate-500">Estimativa por capacidade; confirmar com manual do fabricante.</p>
                       <div className="flex gap-6 mt-1 text-sm font-semibold text-indigo-700">
                          <span>Líquido: {result.tubulacao_liquida}</span>
                          <span>Sucção: {result.tubulacao_succao}</span>
                          <span>Comp: {result.comprimento_tubulacao_m}m</span>
                       </div>
                     </div>
                  </div>
                </div>
             </div>
          )}
          {activeTab === 'equipamento' && (
             <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Premissas e Referências</h3>
                <div className="bg-slate-50 p-4 rounded-lg text-xs font-mono text-slate-700 overflow-x-auto">
                   <p className="font-bold mb-2">// Referências Normativas</p>
                   {result.references.map((r, i) => <p key={i}>- {r}</p>)}
                   <p className="font-bold mt-4 mb-2">// Constantes Adotadas</p>
                   {Object.entries(result.constants_used).map(([k,v]) => <p key={k}>const {k.replace(/ /g, '_')} = {v}</p>)}
                </div>
             </div>
          )}
        </CardContent>
      </Card>

      {/* Report Lead Capture Simulation */}
      <Card className="bg-slate-900 text-white mt-8 print:hidden">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Finalizar Projeto HVAC</h3>
            <p className="text-slate-400 text-sm max-w-md">O sistema calculou a carga, ventilação e infraestrutura. Gere o PDF consolidado com o logo do seu escritório.</p>
          </div>
          <Button onClick={() => onGenerateReport({name: 'Admin', email: 'admin@eng.pro', phone: ''})} loading={isLoading} size="lg" className="bg-primary-500 hover:bg-primary-600 text-white border-none shrink-0 shadow-lg shadow-primary-500/30">
            <Download className="w-5 h-5 mr-2" /> Gerar Relatório Executivo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const SettingsIcon = () => <Settings className="w-8 h-8 opacity-80" />;
