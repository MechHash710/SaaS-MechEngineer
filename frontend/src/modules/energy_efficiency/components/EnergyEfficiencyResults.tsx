import React from 'react';
import { Zap, Activity, Award, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { EnergyEfficiencyOutput } from '../../../types/energyEfficiency';

interface EnergyEfficiencyResultsProps {
  result: EnergyEfficiencyOutput;
  isLoading: boolean;
  onGenerateReport?: (lead: any) => void;
}

export const EnergyEfficiencyResults: React.FC<EnergyEfficiencyResultsProps> = ({ result, isLoading, onGenerateReport }) => {

  const scoreColors: Record<string, string> = {
    'A': 'bg-emerald-500 shadow-emerald-500/30',
    'B': 'bg-green-500 shadow-green-500/30',
    'C': 'bg-yellow-500 shadow-yellow-500/30',
    'D': 'bg-orange-500 shadow-orange-500/30',
    'E': 'bg-red-500 shadow-red-500/30'
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`border-none text-white shadow-lg transform hover:scale-105 transition-transform duration-300 ${scoreColors[result.score_eficiencia] || 'bg-slate-500'}`}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-medium mb-1">Classificação PBE Edifica</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-white/80 font-semibold">Nível</span>
                  <h3 className="text-5xl font-extrabold tracking-tight">{result.score_eficiencia}</h3>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl"><Award className="w-8 h-8 text-white" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-none text-white shadow-lg shadow-indigo-500/20 transform hover:scale-105 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Indicador Anual</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-extrabold tracking-tight">{result.indicador_kwh_m2_ano}</h3>
                </div>
                <span className="text-indigo-200 font-semibold text-sm">kWh/m².ano</span>
              </div>
              <div className="p-3 bg-white/20 rounded-xl"><Activity className="w-6 h-6 text-white" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-none text-white shadow-lg shadow-amber-500/20 transform hover:scale-105 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-1">Consumo Total Estimado</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-extrabold tracking-tight">{result.consumo_anual_kwh.toLocaleString('pt-BR')}</h3>
                </div>
                <span className="text-amber-200 font-semibold text-sm">kWh/ano</span>
              </div>
              <div className="p-3 bg-white/20 rounded-xl"><Zap className="w-6 h-6 text-white" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" /> 
                  Análise de Eficiência
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
               <p className="text-slate-700 leading-relaxed text-lg font-medium">{result.recomendacao}</p>
            </CardContent>
         </Card>

         <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  Próximos Passos
               </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
               <Button 
                onClick={() => onGenerateReport?.({name:'Cliente', email:'ex@ex.com', phone:'000'})} 
                loading={isLoading}
                fullWidth 
                size="lg"
                className="group flex justify-between items-center bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/10"
               >
                 Avançar para Documentos
                 <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </Button>
               <p className="text-xs text-center text-slate-500">
                 Gera o relatório de viabilidade de adequação PBE Edifica e Retrofit.
               </p>
            </CardContent>
         </Card>
      </div>
    </div>
  );
};
