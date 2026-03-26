import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { InputWithUnit } from '../../../components/ui/InputWithUnit';
import { energyEfficiencySchema, type EnergyEfficiencyFormValues } from '../../../schemas/energyEfficiencySchema';

interface EnergyEfficiencyFormProps {
  onSubmit: (data: EnergyEfficiencyFormValues) => Promise<void>;
  isLoading: boolean;
  initialData?: EnergyEfficiencyFormValues | null;
}

export const EnergyEfficiencyForm: React.FC<EnergyEfficiencyFormProps> = ({ onSubmit, isLoading, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<EnergyEfficiencyFormValues>({
    resolver: zodResolver(energyEfficiencySchema),
    defaultValues: initialData || {
      area_m2: 500,
      iluminacao_w_m2: 12,
      ar_condicionado_cop: 3.2,
      fator_vidro_percent: 30,
      horas_uso_dia: 10,
      dias_uso_ano: 250
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-xl flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Detalhes do Empreendimento
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputWithUnit
                label="Área Construída"
                unit="m²"
                type="number"
                {...register('area_m2', { valueAsNumber: true })}
                error={errors.area_m2?.message}
              />
              <InputWithUnit
                label="Fator de Vidro (Fachada)"
                unit="%"
                type="number"
                {...register('fator_vidro_percent', { valueAsNumber: true })}
                error={errors.fator_vidro_percent?.message}
              />
              
              <InputWithUnit
                label="Densidade de Iluminação"
                unit="W/m²"
                type="number"
                step="0.1"
                {...register('iluminacao_w_m2', { valueAsNumber: true })}
                error={errors.iluminacao_w_m2?.message}
              />
              <InputWithUnit
                label="COP do Ar Condicionado"
                unit="W/W"
                type="number"
                step="0.1"
                {...register('ar_condicionado_cop', { valueAsNumber: true })}
                error={errors.ar_condicionado_cop?.message}
              />
              
              <InputWithUnit
                label="Uso Diário"
                unit="h/dia"
                type="number"
                {...register('horas_uso_dia', { valueAsNumber: true })}
                error={errors.horas_uso_dia?.message}
              />
              <InputWithUnit
                label="Uso Anual"
                unit="dias/ano"
                type="number"
                {...register('dias_uso_ano', { valueAsNumber: true })}
                error={errors.dias_uso_ano?.message}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" size="lg" loading={isLoading} className="shadow-lg shadow-amber-500/20 px-8 bg-amber-500 hover:bg-amber-600">
                 Calcular Eficiência
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
