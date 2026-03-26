import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { SolarHeatingOutput } from '../../../types/solar';
import { Printer, Calendar, MapPin, Building, Info, FileStack, Download } from 'lucide-react';
import { api } from '../../../lib/api';

interface SolarReportProps {
  result: SolarHeatingOutput;
  leadInfo: { name: string; email: string; phone: string };
  localizacao: string;
}

export const SolarReport: React.FC<SolarReportProps> = ({ result, leadInfo, localizacao }) => {
  const [isDownloadingMemorial, setIsDownloadingMemorial] = useState(false);
  const [isDownloadingLaudo, setIsDownloadingLaudo] = useState(false);
  const [isDownloadingTotal, setIsDownloadingTotal] = useState(false);
  const currentDate = new Date().toLocaleDateString('pt-BR');

  const downloadMemorial = async () => {
    try {
      setIsDownloadingMemorial(true);
      const payload = {
        project_id: `SOLAR-${Math.floor(Math.random() * 10000)}`,
        engineer_crea: "CREA-SP TESTE",
        equipment_btu: result.energia_necessaria_kwh_dia,
        localizacao: leadInfo.name + " Residencia", // Simulado
        step_by_step: result.step_by_step,
        constants_used: result.constants_used,
        references: result.references,
      };
      
      const response = await api.post('/documents/memorial/solar', payload, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `memorial_solar_${leadInfo.name.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("Failed to download memorial PDF", e);
      alert("Erro ao baixar PDF");
    } finally {
      setIsDownloadingMemorial(false);
    }
  };

  const downloadLaudo = async () => {
    try {
      setIsDownloadingLaudo(true);
      const payload = {
        project_id: `SOLAR-${Math.floor(Math.random() * 10000)}`,
        engineer_crea: "CREA-SP TESTE",
        equipment_btu: result.energia_necessaria_kwh_dia,
        localizacao: leadInfo.name + " Residencia",
        cliente_nome: leadInfo.name,
        step_by_step: result.step_by_step,
        constants_used: result.constants_used,
        references: result.references,
      };
      
      const response = await api.post('/documents/laudo/solar', payload, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `laudo_tecnico_solar_${payload.project_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading laudo:', error);
      alert("Erro ao baixar Laudo Técnico");
    } finally {
      setIsDownloadingLaudo(false);
    }
  };

  const downloadRelatorioCompleto = async () => {
    try {
      setIsDownloadingTotal(true);
      const payload = {
        project_id: `SOLAR-${Math.floor(Math.random() * 10000)}`,
        project_name: leadInfo.name || "Residência Padrão",
        engineer_name: "Responsável Técnico",
        engineer_crea: "CREA-SP TESTE",
        location: localizacao,
        module_title: "Aquecimento Solar AQS",
        inputs: {
          "Banhos/dia": "Sintetizado a partir do perfil do Cliente",
          "Temperatura Desejada": "Tipicamente 40°C a 45°C"
        },
        steps: Object.entries(result.step_by_step).map(entry => ({
            description: entry[0],
            formula: "Cálculo Solar",
            result: entry[1],
            unit: "-",
            norm_reference: "NBR 15569"
        })),
        result_summary: {
           formatted_total: result.energia_necessaria_kwh_dia.toLocaleString('pt-BR') + ' kWh/dia (Energia Inicial)',
           btu_h: "-"
        },
        recommended_equipment: result.recomendacao_sistema
      };
      
      const response = await api.post('/documents/relatorio_completo', payload, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_completo_solar.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("Failed to download", e);
      alert("Erro ao baixar Relatório Completo");
    } finally {
      setIsDownloadingTotal(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      
      {/* Action Bar (Not printed) */}
      <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button variant="secondary" onClick={() => window.print()} className="flex-1">
              <Printer className="mr-2 h-4 w-4" /> Imprimir Relatório Simplificado
            </Button>
            <Button variant="ghost" onClick={downloadMemorial} loading={isDownloadingMemorial} className="flex-1 border border-primary-600 text-primary-600 hover:bg-primary-50">
               <Download className="mr-2 h-4 w-4" /> {isDownloadingMemorial ? 'Baixando...' : 'Baixar Memorial PDF'}
            </Button>
            <Button variant="ghost" onClick={downloadLaudo} loading={isDownloadingLaudo} className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50">
               <Download className="mr-2 h-4 w-4" /> {isDownloadingLaudo ? 'Baixando...' : 'Baixar Laudo Técnico'}
            </Button>
            <Button variant="ghost" onClick={downloadRelatorioCompleto} loading={isDownloadingTotal} className="flex-1 min-w-[200px] border border-purple-600 text-purple-600 hover:bg-purple-50">
               <Download className="mr-2 h-4 w-4" /> {isDownloadingTotal ? 'Baixando...' : 'Relatório Completo PDF'}
            </Button>
          </CardContent>
        </Card>

      {/* Printable Area */}
      <div className="bg-white p-8 sm:p-12 shadow-sm border border-slate-200 rounded-lg print:shadow-none print:border-none print:p-0">
        
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Memorial de Cálculo de AQS</h1>
            <p className="text-slate-500 mt-1 font-medium text-lg">Aquecimento Solar de Água Quente Sanitária</p>
          </div>
          <div className="text-right text-sm text-slate-600 font-medium space-y-1">
            <p className="flex items-center justify-end"><Calendar className="h-4 w-4 mr-1.5"/> Data: {currentDate}</p>
            <p className="flex items-center justify-end"><MapPin className="h-4 w-4 mr-1.5"/> Local: {localizacao}</p>
          </div>
        </div>

        {/* Client Box */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-md mb-8">
           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center">
             <Building className="h-4 w-4 mr-2 text-slate-500" />
             Dados do Proprietário / Obra
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <div>
               <p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">Solicitante</p>
               <p className="text-sm font-medium text-slate-900">{leadInfo.name || 'Em Aberto'}</p>
             </div>
             <div>
               <p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">Contato (E-mail)</p>
               <p className="text-sm font-medium text-slate-900">{leadInfo.email || '-'}</p>
             </div>
             <div>
               <p className="text-xs text-slate-500 uppercase font-semibold mb-0.5">Telefone</p>
               <p className="text-sm font-medium text-slate-900">{leadInfo.phone || '-'}</p>
             </div>
           </div>
        </div>

        {/* Recommendation Box */}
        <div className="mb-8 p-6 bg-primary-50 border border-primary-200 rounded-lg">
           <h3 className="text-sm font-bold text-primary-900 uppercase tracking-wider mb-2">Conclusão do Dimensionamento</h3>
           <p className="text-lg text-primary-800 font-medium leading-relaxed">
             {result.recomendacao_sistema}
           </p>
           <div className="mt-4 flex space-x-6">
             <div>
               <span className="block text-xs text-primary-600 font-semibold uppercase">Potência Térmica Diária</span>
               <span className="text-xl font-bold text-primary-900">{result.energia_necessaria_kwh_dia.toLocaleString('pt-BR')} <span className="text-sm font-medium">kWh/dia</span></span>
             </div>
             <div>
               <span className="block text-xs text-primary-600 font-semibold uppercase">Retorno Financeiro Estimado</span>
               <span className="text-xl font-bold text-primary-900">R$ {result.economia_anual_brl.toLocaleString('pt-BR')} <span className="text-sm font-medium">/ano</span></span>
             </div>
           </div>
        </div>

        {/* Memory of Calculation */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex items-center">
            <FileStack className="h-4 w-4 mr-2" />
            Memória de Cálculo (Etapas Termodinâmicas)
          </h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 uppercase text-xs">
                <th className="py-2 px-3 font-semibold">Etapa / Variável</th>
                <th className="py-2 px-3 font-semibold text-center">Fórmula</th>
                <th className="py-2 px-3 font-semibold text-right">Resultado</th>
                <th className="py-2 px-3 font-semibold text-right hidden sm:table-cell">Norma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(result.step_by_step).map(([key, info], idx) => {
                const isObj = typeof info === 'object' && info !== null;
                const displayValue = isObj ? (info as any).value : String(info);
                const formula = isObj ? (info as any).formula : null;
                const norm = isObj ? (info as any).norm_reference : null;
                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-slate-700">{key}</td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-500 text-center">{formula || '—'}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right">{displayValue}</td>
                    <td className="py-2.5 px-3 text-xs text-slate-400 text-right hidden sm:table-cell">{norm || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* References */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Normas Adotadas (ART)
          </h3>
          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed">
             {result.references.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          <p className="mt-4 text-[10px] text-slate-400 font-mono text-justify border-t border-slate-100 pt-3">
             Declaração: Este relatório foi gerado automaticamente pelo Simulador de Engenharia SaaS B2B. Os valores apresentados 
             são estimativas baseadas na norma ABNT NBR 15569 e nas considerações atmosféricas médias anuais obtidas via satélite.
             A responsabilidade pela emissão de Anotação de Responsabilidade Técnica (ART) recai exclusivamente sobre o Engenheiro Mecânico credenciado no CREA.
          </p>
        </div>

      </div>
    </div>
  );
};
