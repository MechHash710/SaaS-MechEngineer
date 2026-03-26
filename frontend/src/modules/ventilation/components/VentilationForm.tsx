import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wind, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { InputWithUnit } from '../../../components/ui/InputWithUnit';
import { ventilationSchema, type VentilationFormValues } from '../../../schemas/ventilationSchema';

interface VentilationFormProps {
  onSubmit: (data: VentilationFormValues) => Promise<void>;
  isLoading: boolean;
  initialData?: VentilationFormValues | null;
}

export const VentilationForm: React.FC<VentilationFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<VentilationFormValues>({
    resolver: zodResolver(ventilationSchema),
    defaultValues: initialData || {
      area_m2: 50,
      pe_direito: 2.7,
      num_peoples: 5,
      environment_type: 'escritorio'
    }
  });

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-xl flex items-center gap-2">
            <Wind className="w-5 h-5 text-primary-600" />
            Parâmetros do Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputWithUnit
                label="Área do Ambiente"
                unit="m²"
                type="number"
                step="0.1"
                {...register('area_m2', { valueAsNumber: true })}
                error={errors.area_m2?.message}
              />
              <InputWithUnit
                label="Pé-direito"
                unit="m"
                type="number"
                step="0.1"
                {...register('pe_direito', { valueAsNumber: true })}
                error={errors.pe_direito?.message}
              />
              <InputWithUnit
                label="Número de Ocupantes"
                unit="pessoas"
                type="number"
                {...register('num_peoples', { valueAsNumber: true })}
                error={errors.num_peoples?.message}
              />
              <Select
                label="Tipo de Ambiente"
                {...register('environment_type')}
                error={errors.environment_type?.message}
                options={[
                  { value: 'escritorio', label: 'Escritório Geral' },
                  { value: 'auditorio', label: 'Auditório / Cinema' },
                  { value: 'sala_aula', label: 'Sala de Aula' },
                  { value: 'loja', label: 'Loja de Varejo / Shopping' }
                ]}
              />
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-800 font-medium">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
              <p>Os cálculos de renovação de ar seguirão rigorosamente as taxas de ocupação e área da norma vigente NBR 16401-3.</p>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" size="lg" loading={isLoading} className="shadow-lg shadow-primary-500/20 px-8">
                 Calcular Ventilação
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
