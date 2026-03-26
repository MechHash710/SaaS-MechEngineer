import React from 'react';
import { FileText, Download, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { VentilationOutput } from '../../../types/ventilation';

interface VentilationReportProps {
  result: VentilationOutput;
  leadInfo: { name: string; email: string; phone: string };
  localizacao?: string;
}

export const VentilationReport: React.FC<VentilationReportProps> = ({ result }) => {

  const handleDownloadReport = async () => {
     // TODO: Ligar com backend de PDF (T21/T22)
     alert("Geração de Memorial em PDF de Ventilação a ser ligada com PDFService.");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-slate-800 text-white p-6 rounded-2xl shadow-xl shadow-slate-900/10 print:bg-transparent print:text-black print:shadow-none print:p-0">
        <div>
          <h2 className="text-2xl font-bold mb-2">Relatório de Ventilação</h2>
          <p className="text-slate-300 print:text-slate-600">
            Documentação técnica em conformidade com NBR 16401-3.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto print:hidden">
          <Button 
            onClick={handleDownloadReport}
            className="flex-1 md:flex-none border-slate-600 hover:bg-slate-700 bg-slate-800 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Memorial PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              Resumo Técnico
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm text-left">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <th className="py-3 px-4 bg-slate-50 text-slate-500 font-medium w-1/2">Vazão Total</th>
                  <td className="py-3 px-4 font-semibold text-slate-900">{result.vazao_ar_externo_m3h} m³/h</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-slate-50 text-slate-500 font-medium">Renovações/Hora</th>
                  <td className="py-3 px-4 font-semibold text-slate-900">{result.renovacoes_por_hora_ach} ACH</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-slate-50 text-slate-500 font-medium">Duto Circular</th>
                  <td className="py-3 px-4 font-semibold text-slate-900">Ø {result.diametro_duto_principal_mm} mm</td>
                </tr>
                <tr>
                  <th className="py-3 px-4 bg-slate-50 text-slate-500 font-medium">Velocidade do Ar</th>
                  <td className="py-3 px-4 font-semibold text-slate-900">{result.velocidade_duto_m_s} m/s</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
           <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                 <FileText className="w-5 h-5 text-slate-400" /> 
                 Referências
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-4">
              {result.references.map((ref, idx) => (
                 <div key={idx} className="text-sm bg-slate-100 text-slate-700 p-2 rounded">{ref}</div>
              ))}
           </CardContent>
        </Card>
      </div>

    </div>
  );
};
