import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import type { HVACCompleteFormValues } from '../../../schemas/hvacCompleteSchema';
import { hvacCompleteSchema } from '../../../schemas/hvacCompleteSchema';
import { InputWithUnit } from '../../../components/ui/InputWithUnit';

interface Props {
  onSubmit: (data: HVACCompleteFormValues) => void;
  isLoading: boolean;
  initialData?: HVACCompleteFormValues | null;
}

export const HVACCompleteForm: React.FC<Props> = ({ onSubmit, isLoading, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<HVACCompleteFormValues>({
    resolver: zodResolver(hvacCompleteSchema),
    defaultValues: initialData || {
      area_m2: 20,
      pe_direito: 2.7,
      num_peoples: 2,
      num_equipment: 1,
      watts_per_equipment: 150,
      sun_exposure: 'nenhuma',
      localizacao: '',
      environment_type: 'escritorio',
      distancia_tubulacao_m: 5,
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-primary-700">
            <Settings className="w-5 h-5 mr-2" />
            Dados do Ambiente (AC + Ventilação)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithUnit label="Área do Ambiente" id="area" unit="m²" type="number" step="0.1" {...register('area_m2', { valueAsNumber: true })} error={errors.area_m2?.message} />
            <InputWithUnit label="Pé-direito" id="pe_direito" unit="m" type="number" step="0.1" {...register('pe_direito', { valueAsNumber: true })} error={errors.pe_direito?.message} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithUnit label="Ocupação Média" id="pessoas" unit="pessoas" type="number" {...register('num_peoples', { valueAsNumber: true })} error={errors.num_peoples?.message} />
            <Select label="Tipo de Ambiente (Para Ventilação)" options={[
                { value: 'escritorio', label: 'Escritório' },
                { value: 'auditorio', label: 'Auditório' },
                { value: 'sala_aula', label: 'Sala de Aula' },
                { value: 'loja', label: 'Loja / Comércio' },
              ]} error={errors.environment_type?.message} {...register('environment_type')} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWithUnit label="Equipamentos Elétricos" id="equipamentos" unit="un" type="number" {...register('num_equipment', { valueAsNumber: true })} error={errors.num_equipment?.message} />
            <InputWithUnit label="Potência Média por Eq." id="watts" unit="W/un" type="number" {...register('watts_per_equipment', { valueAsNumber: true })} error={errors.watts_per_equipment?.message} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Exposição Solar (Maior Carga)" options={[
                { value: 'nenhuma', label: 'Nenhuma / Sombreamento' },
                { value: 'manhas', label: 'Manhãs (Leste/Norte)' },
                { value: 'tardes', label: 'Tardes (Oeste/Norte)' },
                { value: 'dia_todo', label: 'Dia Todo (Cobertura/Vidros)' },
              ]} error={errors.sun_exposure?.message} {...register('sun_exposure')} 
            />
            <InputWithUnit label="Localização (Opcional)" id="localizacao" unit="" type="text" placeholder="Ex: São Paulo, SP" {...register('localizacao')} error={errors.localizacao?.message} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <InputWithUnit label="Distância Linear da Tubulação Frigorífica" id="distancia" unit="m" type="number" step="0.1" {...register('distancia_tubulacao_m', { valueAsNumber: true })} error={errors.distancia_tubulacao_m?.message} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button loading={isLoading} type="submit" size="lg" className="w-full md:w-auto">
          Calcular Sistema Completo
        </Button>
      </div>
    </form>
  );
};
