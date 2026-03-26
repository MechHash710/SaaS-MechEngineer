import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';

interface AuditStep {
  value: string | number;
  norm_reference?: string;
}

interface AuditStepsProps {
  title: string;
  description: string;
  steps: Record<string, AuditStep | string | number | any>;
  constants?: Record<string, string | number>;
  references?: string[];
}

export const AuditSteps: React.FC<AuditStepsProps> = ({ 
  title, 
  description, 
  steps, 
  constants, 
  references 
}) => {
  return (
    <div className="space-y-6 animate-in fade-in font-technical">
      <Card className="border-slate-200/60 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-engineering-navy">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="divide-y divide-slate-100 bg-white rounded-md border border-slate-200/60 overflow-hidden">
            {Object.entries(steps).map(([key, info], idx) => {
              const value = typeof info === 'object' && info !== null ? (info as any).value : info;
              const formula = typeof info === 'object' && info !== null ? (info as any).formula : null;
              const norm = typeof info === 'object' && info !== null ? (info as any).norm_reference : 'Geral';
              
              return (
                <li key={idx} className="px-4 py-4 flex flex-col space-y-2 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-slate-700 font-semibold">{key}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 font-mono uppercase tracking-tighter">{norm}</span>
                    </div>
                    <span className="text-engineering-electric font-bold font-mono text-right text-base">{value}</span>
                  </div>
                  
                  {formula && (
                    <div className="bg-slate-50 p-2 rounded border border-slate-100/50 font-mono text-xs text-slate-500 italic">
                      Equação: {formula}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {constants && Object.keys(constants).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Premissas e Coeficientes Fixados</CardTitle>
            <CardDescription>Parâmetros do modelo matemático utilizados durante a simulação termodinâmica.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(constants).map(([key, value], idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-100">
                    <span className="block text-xs uppercase text-slate-500 mb-1 font-semibold">{key}</span>
                    <span className="text-sm font-mono text-slate-900">{value}</span>
                </div>
              ))}
             </div>
          </CardContent>
        </Card>
      )}

      {references && references.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Embasamento Normativo</CardTitle>
            <CardDescription>Padrões ABNT / ASHRAE que fundamentam matematicamente este dimensionamento.</CardDescription>
          </CardHeader>
          <CardContent>
             <ul className="list-disc list-inside text-sm text-slate-700 space-y-2">
              {references.map((ref, idx) => (
                <li key={idx} className="leading-relaxed">{ref}</li>
              ))}
             </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
