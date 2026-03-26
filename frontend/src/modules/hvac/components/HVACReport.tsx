import React, { useState } from 'react';
import { CheckCircle2, Download, Calculator, Wrench, ShieldCheck } from 'lucide-react';
import type { SimulatorResponse, BudgetResponse, ArtData } from '../../../types/hvac';
import type { HvacFormValues } from '../../../schemas/hvacSchema';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { api } from '../../../lib/api';

interface HVACReportProps {
  data: HvacFormValues;
  result: SimulatorResponse;
  budget: BudgetResponse;
  artData: ArtData;
  leadName: string;
  leadEmail: string;
  onRestart: () => void;
}

export const HVACReport: React.FC<HVACReportProps> = ({ 
  data, 
  result, 
  budget, 
  artData, 
  leadName, 
  leadEmail,
  onRestart 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingSpec, setIsDownloadingSpec] = useState(false);
  const [isDownloadingLaudo, setIsDownloadingLaudo] = useState(false);
  const [isDownloadingTotal, setIsDownloadingTotal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const downloadMemorial = async () => {
    try {
      setIsDownloading(true);
      const payload = {
        project_id: budget.project_id,
        engineer_crea: artData.crea_responsavel,
        equipment_btu: result.total_btu_h,
        localizacao: result.step_by_step['Localidade']?.toString() || "Não informada",
        step_by_step: result.step_by_step,
        constants_used: result.constants_used,
        references: result.references,
      };
      
      const response = await api.post('/documents/memorial/hvac', payload, {
        responseType: 'blob' // Important for file download
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `memorial_hvac_${budget.project_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("Failed to download memorial PDF", e);
      alert("Erro ao baixar PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadLaudo = async () => {
    try {
      setIsDownloadingLaudo(true);
      const payload = {
        project_id: `HVAC-${Math.floor(Math.random() * 10000)}`,
        engineer_crea: "CREA-SP TESTE",
        equipment_btu: result.total_btu_h,
        localizacao: result.step_by_step['Localidade']?.toString() || "Não informada",
        cliente_nome: leadName, // Changed from leadData.name to leadName
        step_by_step: result.step_by_step,
        constants_used: result.constants_used,
        references: result.references,
      };
      
      const response = await api.post('/documents/laudo/hvac', payload, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `laudo_tecnico_hvac_${payload.project_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading laudo:', error);
      alert("Erro ao baixar PDF de Laudo Técnico");
    } finally {
      setIsDownloadingLaudo(false);
    }
  };

  const downloadRelatorioCompleto = async () => {
    try {
      setIsDownloadingTotal(true);
      const payload = {
        project_id: budget.project_id,
        project_name: leadName || "Projeto Local",
        engineer_name: "Responsável Técnico",
        engineer_crea: artData.crea_responsavel,
        location: data.localizacao || "Não informada",
        module_title: "Carga Térmica AVAC",
        inputs: {
          "Área (m²)": data.area_m2,
          "Pé-direito (m)": data.pe_direito,
          "Ocupação": data.num_peoples,
          "Equipamentos": `${data.num_equipment} units`,
          "Exposição Solar": data.sun_exposure
        },
        steps: Object.entries(result.step_by_step).map(([key, info]) => {
            const isObj = typeof info === 'object' && info !== null;
            return {
              description: key,
              formula: isObj ? (info as any).formula || '—' : '—',
              result: isObj ? (info as any).value : info,
              unit: "BTU/h",
              norm_reference: isObj ? (info as any).norm_reference || "NBR 16401" : "NBR 16401"
            };
        }),
        result_summary: {
           formatted_total: result.total_btu_h.toLocaleString('pt-BR') + ' BTU/h',
           btu_h: result.total_btu_h
        },
        recommended_equipment: result.suggested_equipment
      };
      
      const response = await api.post('/documents/relatorio_completo', payload, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_completo_${budget.project_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("Failed to download relat.", e);
      alert("Erro ao baixar Relatório Completo");
    } finally {
      setIsDownloadingTotal(false);
    }
  };

  const downloadSpecification = async () => {
    try {
      setIsDownloadingSpec(true);
      const payload = {
        project_id: budget.project_id,
        equipment_spec: result.suggested_equipment,
        application: data.localizacao || "Climatização Geral",
        items: budget.items,
        total_cost: budget.total_cost
      };
      
      const response = await api.post('/documents/especificacao', payload, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `especificacao_${budget.project_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("Failed to download specification PDF", e);
      alert("Erro ao baixar PDF de Especificação");
    } finally {
      setIsDownloadingSpec(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* UI Controls (Hidden on Print) */}
      <div className="text-center pb-8 border-b border-slate-200 mb-8 print:hidden">
        <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Engenharia Compilada com Sucesso!</h3>
        <p className="text-slate-600 mb-6 max-w-lg mx-auto">
          O memorial de cálculo NBR 16401-1, orçamento prévio e diretrizes da ART foram gerados para <strong>{leadEmail}</strong>.
        </p>
        
        <div className="flex justify-center items-center space-x-6">
          <button 
            onClick={handlePrint} 
            className="inline-flex items-center px-5 py-2.5 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
          >
            <Download className="mr-2 h-4 w-4" /> Exportar Relatório PDF
          </button>
          <button 
            onClick={onRestart} 
            className="text-primary-600 hover:text-primary-800 font-medium text-sm underline-offset-4 hover:underline"
          >
            Realizar nova simulação
          </button>
        </div>
      </div>

      {/* Printable Report Content */}
      <div className="pt-2 print:pt-0" id="report-content">
        
        {/* Header Documento */}
        <div className="mb-10">
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Memorial Descritivo e Termodinâmico</h1>
            <div className="flex items-center text-sm text-slate-500 mt-2 gap-4">
              <span><strong>OS:</strong> {budget.project_id}</span>
              <span>&bull;</span>
              <span><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</span>
              <span>&bull;</span>
              <span><strong>Projeto:</strong> {leadName}</span>
            </div>
        </div>

        {/* Módulo 1: Setup da Engenharia */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
              <Calculator className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-800 border-b-2 border-primary-200 pb-1 w-full">Parâmetros do Modelo (Inputs)</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-lg text-sm border border-slate-100 mb-6">
            <div><span className="block text-slate-500 text-xs uppercase mb-1">Área</span><span className="font-semibold text-slate-800">{data.area_m2} m²</span></div>
            <div><span className="block text-slate-500 text-xs uppercase mb-1">Pé-direito</span><span className="font-semibold text-slate-800">{data.pe_direito} m</span></div>
            <div><span className="block text-slate-500 text-xs uppercase mb-1">Ocupação</span><span className="font-semibold text-slate-800">{data.num_peoples} p.</span></div>
            <div><span className="block text-slate-500 text-xs uppercase mb-1">Equipamentos</span><span className="font-semibold text-slate-800">{data.num_equipment} ({data.watts_per_equipment}W)</span></div>
            <div><span className="block text-slate-500 text-xs uppercase mb-1">Fachada/Sol</span><span className="font-semibold text-slate-800 capitalize">{data.sun_exposure.replace('_', ' ')}</span></div>
          </div>
          
          <Card className="shadow-none border-slate-200 rounded-lg overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-semibold text-slate-800 text-sm">
              Memória de Cálculo (Desmembramento de Carga ASHRAE/NBR)
            </div>
            <ul className="divide-y divide-slate-100 bg-white">
              {Object.entries(result.step_by_step).map(([key, info]) => {
                const isObj = typeof info === 'object' && info !== null;
                const displayValue = isObj ? (info as any).value : info;
                const formula = isObj ? (info as any).formula : null;
                const displayStr = typeof displayValue === 'number'
                  ? displayValue.toLocaleString('pt-BR')
                  : String(displayValue ?? '—');
                return (
                  <li key={key} className="px-4 py-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">{key}</span>
                      <span className="text-slate-900 font-bold font-mono">{displayStr} <span className="text-xs font-normal text-slate-400">BTU/h</span></span>
                    </div>
                    {formula && formula !== 'N/A' && (
                      <div className="text-xs text-slate-400 font-mono mt-0.5 italic">↳ {formula}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>

          <div className="mt-6 p-6 bg-primary-50 border-l-4 border-primary-600 rounded-r-lg flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-primary-800 uppercase tracking-widest mb-1">Capacidade Total Exigida</h3>
                <div className="text-3xl font-extrabold text-primary-700">{result.total_btu_h.toLocaleString('pt-BR')} <span className="text-lg font-medium text-primary-600">BTU/h</span></div>
              </div>
              <div className="text-right">
                <span className="block text-xs text-primary-600 uppercase font-semibold mb-1">Sistema Sugerido</span>
                <span className="text-lg font-bold text-slate-900">{result.suggested_equipment}</span>
              </div>
          </div>
        </div>

        {/* Módulo 2: Orçamento Técnico */}
        <div className="mb-10 page-break-inside-avoid">
          <div className="flex items-center mb-4 mt-12">
              <Wrench className="h-6 w-6 text-slate-600 mr-2" />
              <h2 className="text-xl font-semibold text-slate-800 border-b-2 border-slate-200 pb-1 w-full">Listagem de Materiais e Homem-Hora</h2>
          </div>
          <div className="overflow-hidden shadow-sm ring-1 ring-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 outline-none">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Especificação / Serviço</th>
                  <th scope="col" className="px-3 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Qtd</th>
                  <th scope="col" className="px-3 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Unitário</th>
                  <th scope="col" className="px-3 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {budget.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-slate-800">{item.name}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-right text-slate-600">{item.quantity}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-right text-slate-600 font-mono">R$ {item.unit_price.toFixed(2)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-right font-semibold text-slate-800 font-mono">R$ {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                  <tr>
                    <th scope="row" colSpan={3} className="px-4 py-4 text-right text-sm font-bold text-slate-900">Total Previsto de Instalação:</th>
                    <td className="px-4 py-4 text-right text-lg font-bold text-primary-700 font-mono">R$ {budget.total_cost.toFixed(2)}</td>
                  </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 flex-wrap">
            <Button variant="primary" onClick={onRestart} className="flex-1 min-w-[200px]">
              Nova Simulação
            </Button>
            <Button variant="secondary" onClick={() => window.print()} className="flex-1 min-w-[200px]">
              Imprimir Esta Página
            </Button>
            <Button variant="ghost" onClick={downloadMemorial} loading={isDownloading} className="flex-1 min-w-[200px] border border-primary-600 text-primary-600 hover:bg-primary-50">
               <Download className="mr-2 h-4 w-4" /> Baixar Memorial PDF
            </Button>
            <Button variant="ghost" onClick={downloadSpecification} loading={isDownloadingSpec} className="flex-1 min-w-[200px] border border-emerald-600 text-emerald-600 hover:bg-emerald-50">
               <Download className="mr-2 h-4 w-4" /> Especificação Técnica
            </Button>
            <Button variant="ghost" onClick={downloadLaudo} loading={isDownloadingLaudo} className="flex-1 min-w-[200px] border border-blue-600 text-blue-600 hover:bg-blue-50">
               <Download className="mr-2 h-4 w-4" /> Laudo Técnico
            </Button>
            <Button variant="ghost" onClick={downloadRelatorioCompleto} loading={isDownloadingTotal} className="flex-1 min-w-[200px] border border-purple-600 text-purple-600 hover:bg-purple-50">
               <Download className="mr-2 h-4 w-4" /> Relatório Completo PDF
            </Button>
          </CardContent>
        </Card>

        {/* Módulo 3: Base para ART (CREA) */}
        <div className="mb-4 p-6 bg-slate-900 border border-slate-800 rounded-lg print:border print:border-slate-300 print:bg-white page-break-inside-avoid">
          <div className="flex items-center mb-4">
              <ShieldCheck className="h-6 w-6 text-blue-400 mr-2 print:text-slate-800" />
              <h2 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 w-full print:border-slate-300 print:text-slate-900">
                Diretrizes Normativas - Anotação de Responsabilidade Técnica (ART)
              </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm text-slate-300 print:text-slate-700">
            <div>
              <span className="block text-xs uppercase text-slate-500 mb-1">Atividade Técnica</span>
              <p className="font-medium text-white print:text-black">{artData.atividade}</p>
            </div>
            <div>
              <span className="block text-xs uppercase text-slate-500 mb-1">Tipo de Obra/Serviço</span>
              <p className="font-medium text-white print:text-black">{artData.tipo_obra}</p>
            </div>
            <div className="md:col-span-2">
              <span className="block text-xs uppercase text-slate-500 mb-1">Descrição Complementar Padrão</span>
              <p className="font-medium text-white print:text-black">{artData.descricao_complementar}</p>
            </div>
            <div className="md:col-span-2">
              <span className="block text-xs uppercase text-slate-500 mb-1">Normativas Aplicadas</span>
              <ul className="list-disc list-inside mt-1 font-medium text-white print:text-black">
                {artData.normas_aplicadas.map((norma, idx) => (
                  <li key={idx}>{norma}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 text-xs text-slate-500 border-t border-slate-800 pt-4 print:border-slate-200">
            Responsável Técnico Base: {artData.crea_responsavel}. Documento gerado automaticamente pela plataforma. Válido apenas mediante assinatura e recolhimento das taxas do conselho regional de engenharia e agronomia aplicável.
          </div>
        </div>

      </div>
    </div>
  );
};
