import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sun, Droplets, Home, Thermometer, Info } from 'lucide-react';
import { solarFormSchema } from '../../../schemas/solarSchema';
import type { SolarFormValues } from '../../../schemas/solarSchema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { InputWithUnit } from '../../../components/ui/InputWithUnit';

interface SolarFormProps {
  onSubmit: (data: SolarFormValues) => void;
  isLoading: boolean;
}

const defaultValues: SolarFormValues = {
  localizacao: '',
  num_peoples: 4,
  consumo_por_pessoa: 50,
  temp_fria: 20,
  temp_quente: 45,
  tipo_sistema: 'circulacao_natural',
  tipo_coletor: 'plano',
  orientacao_telhado: 'Norte',
  inclinacao_telhado: 22
};

export const SolarForm: React.FC<SolarFormProps> = ({ onSubmit, isLoading }) => {
  const { control, handleSubmit, formState: { errors } } = useForm<SolarFormValues>({
    resolver: zodResolver(solarFormSchema),
    defaultValues
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Seção 1: Localização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-primary-900">
            <Home className="mr-2 h-5 w-5 text-primary-500" />
            Localização da Obra
          </CardTitle>
          <CardDescription>Para captura de irradiação solar média via satélite (GHI).</CardDescription>
        </CardHeader>
        <CardContent>
           <Controller
            name="localizacao"
            control={control}
            render={({ field }) => (
              <InputWithUnit
                label="Cidade e Estado"
                id="localizacao"
                placeholder="Ex R: Recife, PE"
                {...field}
                error={errors.localizacao?.message}
                tooltip="Utilizado para buscar a irradiação solar horizontal local (GHI) da base climática."
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Seção 2: Consumo de Água */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-primary-900">
            <Droplets className="mr-2 h-5 w-5 text-primary-500" />
            Demanda Hídrica
          </CardTitle>
          <CardDescription>Perfil de consumo de água quente da edificação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="num_peoples"
              control={control}
              render={({ field }) => (
                <InputWithUnit
                  label="Moradores / Ocupantes"
                  id="num_peoples"
                  type="number"
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  error={errors.num_peoples?.message}
                  unit="pessoas"
                />
              )}
            />
            <Controller
              name="consumo_por_pessoa"
              control={control}
              render={({ field }) => (
                <InputWithUnit
                  label="Consumo Médio por Pessoa"
                  id="consumo_por_pessoa"
                  type="number"
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  error={errors.consumo_por_pessoa?.message}
                  unit="L/dia"
                  tooltip="Padrão residencial é 50 L por dia por ocupante."
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 3: Temperaturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-primary-900">
            <Thermometer className="mr-2 h-5 w-5 text-primary-500" />
            Gradiente Térmico
          </CardTitle>
          <CardDescription>Temperaturas nominais de operação do sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="temp_fria"
              control={control}
              render={({ field }) => (
                <InputWithUnit
                  label="Temp. Água da Rede"
                  id="temp_fria"
                  type="number"
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  error={errors.temp_fria?.message}
                  unit="°C"
                  tooltip="Temperatura média da água fria que entra no reservatório."
                />
              )}
            />
            <Controller
              name="temp_quente"
              control={control}
              render={({ field }) => (
                <InputWithUnit
                  label="Temp. de Uso Desejada"
                  id="temp_quente"
                  type="number"
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  error={errors.temp_quente?.message}
                  unit="°C"
                  tooltip="Temperatura típica para banho fica em torno de 40 a 45°C."
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 4: Configuração do Sistema Solar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-primary-900">
            <Sun className="mr-2 h-5 w-5 text-primary-500" />
            Tecnologia Solar
          </CardTitle>
          <CardDescription>Especificações dos coletores e posicionamento do telhado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Circulação</label>
                <Controller
                  name="tipo_sistema"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm bg-white"
                    >
                      <option value="circulacao_natural">Natural / Termossifão (Mais barato)</option>
                      <option value="forcada">Forçada c/ Bomba (Pumping System)</option>
                    </select>
                  )}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tecnologia do Coletor</label>
                <Controller
                  name="tipo_coletor"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm bg-white"
                    >
                      <option value="plano">Plano Aberto (Vidro/Cobre) ~ 50% efici.</option>
                      <option value="vacuo">Tubo a Vácuo ~ 65% efici.</option>
                    </select>
                  )}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Orientação do Telhado principal</label>
                <Controller
                  name="orientacao_telhado"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md shadow-sm bg-white"
                    >
                      <option value="Norte">Norte (Ideal no Hemisfério Sul)</option>
                      <option value="Nordeste">Nordeste</option>
                      <option value="Noroeste">Noroeste</option>
                      <option value="Leste">Leste (Sol da Manhã)</option>
                      <option value="Oeste">Oeste (Sol da Tarde)</option>
                      <option value="Sul">Sul (Pior orientação no Brasil)</option>
                    </select>
                  )}
                />
             </div>
             <Controller
              name="inclinacao_telhado"
              control={control}
              render={({ field }) => (
                <InputWithUnit
                  label="Inclinação do Telhado"
                  id="inclinacao_telhado"
                  type="number"
                  {...field}
                  onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                  error={errors.inclinacao_telhado?.message}
                  unit="° graus"
                  tooltip="O ideal é a Latitude local + 10°"
                />
              )}
            />
           </div>
        </CardContent>
      </Card>

      <div className="pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando Dimensionamento Termodinâmico...
            </span>
          ) : (
            'Calcular Sistema de Aquecimento Solar'
          )}
        </button>
        <p className="flex justify-center mt-3 text-xs text-slate-400 items-center">
          <Info className="h-3 w-3 mr-1" /> Cálculo baseado na diretriz da ABNT NBR 15569.
        </p>
      </div>

    </form>
  )
}
