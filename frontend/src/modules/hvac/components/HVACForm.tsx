import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator, MapPin } from 'lucide-react';
import { hvacFormSchema } from '../../../schemas/hvacSchema';
import type { HvacFormValues } from '../../../schemas/hvacSchema';
import { InputWithUnit } from '../../../components/ui/InputWithUnit';

interface HVACFormProps {
  initialData: HvacFormValues;
  onSubmitStart: () => void;
  onSubmitSuccess: (data: HvacFormValues, result: any) => void;
  onSubmitError: () => void;
  isLoading: boolean;
  onCalculate: (data: HvacFormValues) => Promise<any>;
}

export const HVACForm: React.FC<HVACFormProps> = ({ 
  initialData, 
  isLoading, 
  onSubmitStart, 
  onSubmitSuccess, 
  onSubmitError,
  onCalculate 
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<HvacFormValues>({
    resolver: zodResolver(hvacFormSchema),
    defaultValues: initialData,
    mode: 'onTouched', // Validar ao perder o foco para melhor UX B2B
  });

  const onSubmit = async (data: HvacFormValues) => {
    onSubmitStart();
    try {
      const result = await onCalculate(data);
      onSubmitSuccess(data, result);
    } catch {
      onSubmitError();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
        {/* Enveloper - Área e Volume */}
        <InputWithUnit
          label="Área do Ambiente"
          description="Espaço condicionado efetivo"
          unit="m²"
          type="number"
          step="0.1"
          {...register('area_m2', { valueAsNumber: true })}
          error={errors.area_m2?.message}
        />

        <InputWithUnit
          label="Pé-Direito"
          description="Altura livre do piso ao teto"
          unit="m"
          type="number"
          step="0.1"
          {...register('pe_direito', { valueAsNumber: true })}
          error={errors.pe_direito?.message}
        />

        {/* Cargas Internas */}
        <InputWithUnit
          label="Quantidade de Pessoas"
          description="Ocupação simultânea máxima esperada"
          unit="pessoas"
          type="number"
          {...register('num_peoples', { valueAsNumber: true })}
          error={errors.num_peoples?.message}
        />

        <InputWithUnit
          label="Qtde de Equipamentos"
          description="Computadores, TVs, monitores soltando calor"
          unit="und"
          type="number"
          {...register('num_equipment', { valueAsNumber: true })}
          error={errors.num_equipment?.message}
        />

        <InputWithUnit
          label="Potência M. por Equipamento"
          description="Estimativa térmica por máquina"
          unit="W"
          type="number"
          {...register('watts_per_equipment', { valueAsNumber: true })}
          error={errors.watts_per_equipment?.message}
        />

        {/* Cargas Externas / Solares */}
        <div className="flex flex-col gap-1 w-full">
          <label className="block text-sm font-medium text-slate-700">
            Exposição Solar
          </label>
          <p className="text-xs text-slate-500 mb-1">Impacto direto nas paredes/janelas</p>
          <select 
            {...register('sun_exposure')}
            className={`block w-full rounded-md shadow-sm sm:text-sm px-4 py-2.5 border outline-none transition-colors bg-white ${
              errors.sun_exposure ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-slate-300 focus:border-primary-500'
            }`}
          >
            <option value="nenhuma">Nenhuma (Sombra)</option>
            <option value="manhas">Sol da Manhã (Leste)</option>
            <option value="tardes">Sol da Tarde (Oeste)</option>
            <option value="dia_todo">Sol o Dia Todo (Cobertura/Multifacetado)</option>
          </select>
          {errors.sun_exposure && (
            <p className="mt-1 text-xs text-red-600 font-medium">{errors.sun_exposure.message}</p>
          )}
        </div>

        {/* API de Radiação Solar Reais */}
        <div className="sm:col-span-2 mt-2 pt-6 border-t border-slate-100">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
            <MapPin className="h-4 w-4 text-primary-500" />
            Localização do Imóvel
          </label>
          <p className="mt-1 text-xs text-slate-500 mb-3">
            Opcional. Se preenchido, o Motor de Cálculo ignora a tabela estática e busca a irradiação solar (GHI) historica real de mais de 30 anos via satélite (Open-Meteo ERA5) da cidade para extrema precisão.
          </p>
          <input
            type="text"
            placeholder="Ex: São Paulo, SP ou Fortaleza, Ceará"
            {...register('localizacao')}
            className={`block w-full rounded-md shadow-sm sm:text-sm px-4 py-3 border outline-none transition-colors ${
              errors.localizacao ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-primary-500'
            }`}
          />
        </div>
      </div>

      <div className="pt-6">
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Processando modelo matemático...' : <span className="flex items-center"><Calculator className="mr-2 h-5 w-5" /> Calcular Carga Térmica ABNT 16401</span>}
        </button>
      </div>
    </form>
  );
};
