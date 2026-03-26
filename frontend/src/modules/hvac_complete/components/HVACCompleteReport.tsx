import React from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Download, CheckCircle } from 'lucide-react';
import type { HVACCompleteOutput } from '../../../types/hvacComplete';
import { api } from '../../../lib/api';

interface Props {
  result: HVACCompleteOutput;
  leadInfo: { name: string; email: string };
}

export const HVACCompleteReport: React.FC<Props> = ({ result }) => {
  const handleDownloadPDF = async () => {
    try {
      const response = await api.post('/documents/laudo/hvac_completo', {
        engineer_crea: "CREA-SP 999999",
        project_details: {
          "Carga Térmica": `${result.carga_termica_btu_h} BTU/h`,
          "Vazão de Ventilação": `${result.vazao_ar_m3h} m³/h`,
          "Equipamento Estimado": result.equipamento_recomendado,
          "Duto TAE": `Ø ${result.duto_diametro_mm} mm`,
          "Rede Frigorífica": `${result.tubulacao_liquida} / ${result.tubulacao_succao}`,
        },
        findings: [
          "Cálculos térmicos efetuados baseados em NBR 16401-1.",
          "Cálculos de taxa de renovação de ar baseados em ASHRAE 62.1.",
          "Tubulações estimadas."
        ],
        conclusion: `O sistema requer uma vazão externa de ${result.vazao_ar_m3h} m³/h e equipamento de ${result.equipamento_recomendado}.`
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laudo_hvac_integrado_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
       console.error(error);
       alert("Erro ao baixar o Laudo PDF. A API /documents está rodando?");
    }
  };

  return (
    <div className="space-y-6">
       <Card className="text-center py-10 bg-gradient-to-br from-slate-50 to-primary-50/20 border-primary-100">
         <CardContent>
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Engenharia AVAC Concluída!</h2>
            <p className="text-slate-600 max-w-lg mx-auto mb-8">
              Os dados de carga térmica, ventilação e dimensionamento físico foram processados e salvos no projeto vinculado.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={handleDownloadPDF} className="font-bold">
                 <Download className="w-4 h-4 mr-2" /> Baixar Laudo Consolidado (PDF)
              </Button>
            </div>
         </CardContent>
       </Card>
    </div>
  );
};
