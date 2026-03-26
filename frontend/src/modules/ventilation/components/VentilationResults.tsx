import React from 'react';
import { Wind, Gauge, Maximize2, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { VentilationOutput } from '../../../types/ventilation';

interface VentilationResultsProps {
  result: VentilationOutput;
  isLoading: boolean;
  onGenerateReport?: (lead: any) => void;
}

export const VentilationResults: React.FC<VentilationResultsProps> = ({ result, isLoading, onGenerateReport }) => {

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white shadow-lg shadow-blue-500/20 transform hover:scale-105 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Vazão Ar Externo</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-extrabold tracking-tight">{result.vazao_ar_externo_m3h}</h3>
                  <span className="text-blue-200 font-semibold">m³/h</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl"><Wind className="w-6 h-6 text-white" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-none text-white shadow-lg shadow-emerald-500/20 transform hover:scale-105 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Renovações por Hora</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-extrabold tracking-tight">{result.renovacoes_por_hora_ach}</h3>
                  <span className="text-emerald-200 font-semibold">ACH</span>
                </div>
                {result.renovacoes_por_hora_ach < 1 && (
                   <div className="bg-red-500/80 mt-2 px-2 text-xs rounded-full py-0.5 border border-red-400">Alerta de baixa renovação</div>
                )}
              </div>
              <div className="p-3 bg-white/20 rounded-xl"><Gauge className="w-6 h-6 text-white" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 border-none text-white shadow-lg shadow-indigo-500/20 transform hover:scale-105 transition-transform duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Duto Recomendado</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-indigo-200 font-semibold">Ø</span>
                  <h3 className="text-4xl font-extrabold tracking-tight">{result.diametro_duto_principal_mm}</h3>
                  <span className="text-indigo-200 font-semibold">mm</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl"><Maximize2 className="w-6 h-6 text-white" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> 
                  Recomendação Técnica
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
                 Os documentos incluirão memorial normativo baseado na NBR 16401-3.
               </p>
            </CardContent>
         </Card>
      </div>
    </div>
  );
};
