import React, { useState } from 'react';
import { Wind, LayoutDashboard, FolderOpen } from 'lucide-react';

import { api } from './lib/api';
import { addSimulationToHistory } from './lib/history';
import { Dashboard } from './components/Dashboard';
import type { 
  SimulatorResponse, 
  BudgetResponse, 
  ArtData 
} from './types/hvac';
import type { HvacFormValues } from './schemas/hvacSchema';
import type { SolarFormValues } from './schemas/solarSchema';
import type { SolarHeatingOutput } from './types/solar';

import { HVACForm } from './modules/hvac/components/HVACForm';
import { HVACResults } from './modules/hvac/components/HVACResults';
import { HVACReport } from './modules/hvac/components/HVACReport';

import { SolarForm } from './modules/solar/components/SolarForm';
import { SolarResults } from './modules/solar/components/SolarResults';
import { SolarReport } from './modules/solar/components/SolarReport';

import { VentilationForm } from './modules/ventilation/components/VentilationForm';
import { VentilationResults } from './modules/ventilation/components/VentilationResults';
import { VentilationReport } from './modules/ventilation/components/VentilationReport';
import type { VentilationFormValues } from './schemas/ventilationSchema';
import type { VentilationOutput } from './types/ventilation';

import { EnergyEfficiencyForm } from './modules/energy_efficiency/components/EnergyEfficiencyForm';
import { EnergyEfficiencyResults } from './modules/energy_efficiency/components/EnergyEfficiencyResults';
import { EnergyEfficiencyReport } from './modules/energy_efficiency/components/EnergyEfficiencyReport';
import type { EnergyEfficiencyFormValues } from './schemas/energyEfficiencySchema';
import type { EnergyEfficiencyOutput } from './types/energyEfficiency';

import { HVACCompleteForm } from './modules/hvac_complete/components/HVACCompleteForm';
import { HVACCompleteResults } from './modules/hvac_complete/components/HVACCompleteResults';
import { HVACCompleteReport } from './modules/hvac_complete/components/HVACCompleteReport';
import type { HVACCompleteFormValues } from './schemas/hvacCompleteSchema';
import type { HVACCompleteOutput } from './types/hvacComplete';

import { ProjectsPage } from './pages/ProjectsPage';
import { LandingPage } from './pages/LandingPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { PricingPage } from './pages/PricingPage';
import { BillingPage } from './pages/BillingPage';
import { BillingSuccessPage } from './pages/BillingSuccessPage';
import { AdminPage } from './pages/AdminPage';
import HelpPage from './pages/HelpPage';
import BetaInvitePage from './pages/BetaInvitePage';
import FeedbackWidget from './components/FeedbackWidget';
import { addSimulationToProject, type Project } from './lib/projects';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const [activeModule, setActiveModule] = useState<'dashboard' | 'projects' | 'hvac' | 'solar' | 'ventilation' | 'efficiency' | 'hvac_complete'>('dashboard');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  
  // States
  const [data, setData] = useState<HvacFormValues>({
    area_m2: 20,
    pe_direito: 2.70,
    num_peoples: 2,
    num_equipment: 1,
    watts_per_equipment: 150,
    sun_exposure: 'manhas',
    localizacao: '',
  });
  
  const [result, setResult] = useState<SimulatorResponse | null>(null);
  const [budget, setBudget] = useState<BudgetResponse | null>(null);
  const [artData, setArtData] = useState<ArtData | null>(null);
  const [leadInfo, setLeadInfo] = useState({ name: '', email: '', phone: '' });

  const [solarData, setSolarData] = useState<SolarFormValues | null>(null);
  const [solarResult, setSolarResult] = useState<SolarHeatingOutput | null>(null);

  const [ventData, setVentData] = useState<VentilationFormValues | null>(null);
  const [ventResult, setVentResult] = useState<VentilationOutput | null>(null);

  const [efficiencyData, setEfficiencyData] = useState<EnergyEfficiencyFormValues | null>(null);
  const [efficiencyResult, setEfficiencyResult] = useState<EnergyEfficiencyOutput | null>(null);

  const [hvacCompleteData, setHvacCompleteData] = useState<HVACCompleteFormValues | null>(null);
  const [hvacCompleteResult, setHvacCompleteResult] = useState<HVACCompleteOutput | null>(null);

  const projectId = React.useMemo(() => activeProject ? activeProject.id : 'PRJ-' + Math.floor(Math.random() * 10000), [activeProject]);

  React.useEffect(() => {
    // Intentionally left here for future usage to re-render available projects
  }, [activeModule]);

  // Handlers
  const handleCalculate = async (formData: HvacFormValues) => {
    const response = await api.post<SimulatorResponse>('/simulation/calculate_hvac', formData);
    return response.data;
  };

  const handleGenerateReport = async (lead: { name: string; email: string; phone: string }) => {
    setLoading(true);
    setLeadInfo(lead);
    
    try {
      if (result) {
         const budgetRes = await api.get<BudgetResponse>(`/budgeting/generate/${projectId}?equipment_btu=${result.total_btu_h}`);
         setBudget(budgetRes.data);
      }

      const artRes = await api.post<{data: ArtData}>('/documents/generate_art_data', {
        project_id: projectId,
        engineer_crea: "CREA-SP 123456", // Default mock
        equipment_btu: result?.total_btu_h || 0,
        localizacao: data.localizacao || "Não informada",
        step_by_step: result?.step_by_step
      });
      setArtData(artRes.data.data);

      setStep(3);
      if (activeProject) {
         addSimulationToProject(activeProject.id, { result, artData, budget, lead });
      }
    } catch (error) {
       console.error("Erro ao gerar relatórios: ", error);
       alert("Erro ao compilar os documentos térmicos.");
    } finally {
       setLoading(false);
    }
  };

  const handleCalculateSolar = async (formData: SolarFormValues) => {
    setLoading(true);
    try {
      const response = await api.post<SolarHeatingOutput>('/simulation/calculate_solar', formData);
      setSolarData(formData);
      setSolarResult(response.data);
      addSimulationToHistory({
        type: 'Solar',
        summary: `${response.data.num_coletores}x Placas - Boiler ${response.data.volume_boiler_l}L`
      });
      setTimeout(() => {
        setStep(2);
        setLoading(false);
      }, 800);
    } catch (error) {
       console.error(error);
       alert("Falha de conexão com o Motor Solar.");
       setLoading(false);
    }
  };

  const handleGenerateSolarReport = async (lead: { name: string; email: string; phone: string }) => {
    setLoading(true);
    setLeadInfo(lead);
    // Para simplificar a MVP, não chamamos endpoints de ART e Budget específicos ainda para o Solar, 
    // mas preparamos o Stepper para o Report Final.
    setTimeout(() => {
       setStep(3);
       setLoading(false);
       if (activeProject) {
          addSimulationToProject(activeProject.id, { result: solarResult, leadInfo: lead });
       }
    }, 1000);
  };

  const handleCalculateVentilation = async (formData: VentilationFormValues) => {
    setLoading(true);
    try {
      const response = await api.post<VentilationOutput>('/simulation/calculate_ventilation', formData);
      setVentData(formData);
      setVentResult(response.data);
      addSimulationToHistory({
        type: 'Ventilação',
        summary: `${response.data.vazao_ar_externo_m3h.toLocaleString()} m³/h - Ø ${response.data.diametro_duto_principal_mm}mm`
      });
      setTimeout(() => {
        setStep(2);
        setLoading(false);
      }, 800);
    } catch (error) {
       console.error(error);
       alert("Falha de conexão com o Motor de Ventilação.");
       setLoading(false);
    }
  };

  const handleCalculateEfficiency = async (formData: EnergyEfficiencyFormValues) => {
    setLoading(true);
    try {
      const response = await api.post<EnergyEfficiencyOutput>('/simulation/calculate_efficiency', formData);
      setEfficiencyData(formData);
      setEfficiencyResult(response.data);
      addSimulationToHistory({
        type: 'Eficiência Energética',
        summary: `ENCE Estimado: ${response.data.score_eficiencia} (${response.data.indicador_kwh_m2_ano} kWh/m².ano)`
      });
      setTimeout(() => {
        setStep(2);
        setLoading(false);
      }, 800);
    } catch (error) {
       console.error(error);
       alert("Falha de conexão com o Motor de Eficiência Energética.");
       setLoading(false);
    }
  };

  const handleCalculateHvacComplete = async (formData: HVACCompleteFormValues) => {
    setLoading(true);
    try {
      const response = await api.post<HVACCompleteOutput>('/simulation/calculate_hvac_complete', formData);
      setHvacCompleteData(formData);
      setHvacCompleteResult(response.data);
      addSimulationToHistory({
        type: 'HVAC',
        summary: `Completo: ${response.data.carga_termica_btu_h.toLocaleString()} BTU/h - Vent: ${response.data.vazao_ar_m3h} m³/h`
      });
      setTimeout(() => {
        setStep(2);
        setLoading(false);
      }, 800);
    } catch (error) {
       console.error(error);
       alert("Falha de conexão com o Motor HVAC Completo.");
       setLoading(false);
    }
  };

  const restartSimulation = () => {
    setStep(1);
    setResult(null);
    setBudget(null);
    setArtData(null);
    setSolarResult(null);
    setVentResult(null);
    setEfficiencyResult(null);
    setHvacCompleteResult(null);
  };

  const switchModule = (mod: 'dashboard' | 'projects' | 'hvac' | 'solar' | 'ventilation' | 'efficiency' | 'hvac_complete') => {
    setActiveModule(mod);
    restartSimulation();
  };

  const handleOpenProject = (proj: Project) => {
    setActiveProject(proj);
    switchModule(proj.type as 'hvac' | 'solar');
  };

  // Routing based on query params for simple stub
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  
  // Exibir tela de loading enquanto verifica sessão
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-engineering-slate text-engineering-electric font-technical">Carregando...</div>;

  if (mode === 'login') return <LoginPage />;
  if (mode === 'register') return <RegisterPage />;
  if (mode === 'forgot-password') return <ForgotPasswordPage />;
  if (mode === 'onboarding') return <OnboardingPage />;
  if (mode === 'pricing') return <PricingPage />;
  if (mode === 'billing_success') return <BillingSuccessPage />;

  // Se o usuário não está logado e acessou a raiz
  if (!user && !mode) return <LandingPage />;

  if (mode === 'help') return <HelpPage />;
  if (mode === 'beta') return <BetaInvitePage />;

  if (mode === 'billing') {
    return (
      <ProtectedRoute>
         <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
           <div className="absolute top-4 right-4 print:hidden flex items-center gap-4 text-sm font-medium">
             <a href="/" className="text-primary-600 hover:text-primary-800 font-bold">Voltar ao App</a>
             <button onClick={logout} className="text-slate-500 hover:text-slate-800 transition-colors">Sair</button>
           </div>
           <BillingPage />
         </div>
      </ProtectedRoute>
    );
  }

  if (mode === 'admin') {
    return (
      <ProtectedRoute>
         <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
           <div className="absolute top-4 right-4 print:hidden flex items-center gap-4 text-sm font-medium">
             <a href="/" className="text-primary-600 hover:text-primary-800 font-bold">Voltar ao App</a>
             <button onClick={logout} className="text-slate-500 hover:text-slate-800 transition-colors">Sair</button>
           </div>
           <AdminPage />
         </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-engineering-slate flex flex-col pt-6 pb-24 px-4 sm:px-6 lg:px-8 font-technical">
        {/* User Header */}
        <div className="absolute top-4 right-4 print:hidden flex items-center gap-4 text-sm font-medium">
          {user && (
            <a href="/?mode=billing" className="hidden sm:inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-xs font-bold hover:bg-primary-200">
               Plano {user.plan?.toUpperCase() || 'FREE'}
            </a>
          )}
          {user?.role === 'admin' && (
            <a href="/?mode=admin" className="hidden sm:inline-flex items-center px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold hover:bg-red-200">
               Admin
            </a>
          )}
          <span className="text-slate-600">Olá, {user?.name || 'Engenheiro'}</span>
          <button onClick={logout} className="text-primary-600 hover:text-primary-800 transition-colors">Sair</button>
        </div>
        
        {/* Module Switcher Tab (Top Nav) */}
      <div className="max-w-4xl w-full mx-auto mb-8 print:hidden">
         <div className="flex justify-center bg-slate-200/40 p-1 rounded-lg shadow-sm border border-slate-200/60 w-fit mx-auto overflow-x-auto">
            <button 
              onClick={() => switchModule('dashboard')}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeModule === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button 
              onClick={() => switchModule('projects')}
              className={`px-4 py-2.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${activeModule === 'projects' ? 'bg-white text-engineering-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <FolderOpen className="w-4 h-4" />
              Projetos
            </button>
            <button 
              onClick={() => switchModule('hvac')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeModule === 'hvac' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Carga Térmica AVAC
            </button>
            <button 
              onClick={() => switchModule('solar')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeModule === 'solar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Aquecimento Solar AQS
            </button>
            <button 
              onClick={() => switchModule('ventilation')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeModule === 'ventilation' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
               Ventilação
            </button>
            <button 
              onClick={() => switchModule('efficiency')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeModule === 'efficiency' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
               Eficiência (INI-C)
            </button>
            <button 
              onClick={() => switchModule('hvac_complete')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeModule === 'hvac_complete' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
               HVAC Completo
            </button>
         </div>
      </div>

      <div className="max-w-4xl w-full mx-auto">
        
        {/* Header - Hidden on Print */}
        <div className="text-center mb-10 print:hidden font-technical">
          {activeModule !== 'projects' && <Wind className={`mx-auto h-12 w-12 mb-3 ${activeModule === 'solar' ? 'hidden' : 'text-engineering-electric'}`} />}
          <h2 className="text-3xl font-extrabold text-engineering-navy tracking-tight uppercase">
            {activeModule === 'hvac' ? 'Simulador de Carga Térmica AVAC' : 
             activeModule === 'solar' ? 'Simulador de Aquecimento Solar AQS' : 
             activeModule === 'ventilation' ? 'Dimensionamento de Ventilação' : 
             activeModule === 'efficiency' ? 'Análise de Eficiência Energética' : 
             activeModule === 'hvac_complete' ? 'Projeto HVAC Integrado' : 
             activeModule === 'projects' ? 'Área de Workspace' : ''}
          </h2>
          {activeModule !== 'projects' && (
            <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">
              Dimensionamento rigoroso (NBR/ASHRAE), validações matemáticas automáticas e exportação de memorial técnico.
            </p>
          )}
        </div>

        {/* Main Application Container */}
        {activeModule === 'dashboard' ? (
          <Dashboard onNewSimulation={switchModule} />
        ) : activeModule === 'projects' ? (
          <ProjectsPage onOpenProject={handleOpenProject} />
        ) : (
          <div className="bg-white shadow-lg shadow-slate-200/30 rounded-lg overflow-hidden border border-slate-200 print:shadow-none print:border-none print:bg-transparent">
            
            {/* Contexto do Projeto Ativo no topo */}
            {activeProject && (
               <div className="bg-slate-800 text-white px-6 py-3 flex justify-between items-center text-sm print:hidden">
                 <span className="font-semibold flex items-center gap-2"><FolderOpen className="w-4 h-4"/> Projeto Vinculado: {activeProject.name}</span>
                 <button onClick={() => setActiveProject(null)} className="text-slate-300 hover:text-white underline text-xs">Desvincular</button>
               </div>
            )}
            
            {/* Stepper Navigation */}
            <div className="flex border-b border-slate-100 bg-slate-50 print:hidden overflow-x-auto whitespace-nowrap">
              <div className={`flex-1 px-4 text-center py-4 text-sm font-semibold transition-colors ${step >= 1 ? 'text-primary-700 border-b-2 border-primary-600 bg-white' : 'text-slate-400'}`}>1. Parâmetros do Modelo</div>
              <div className={`flex-1 px-4 text-center py-4 text-sm font-semibold transition-colors ${step >= 2 ? 'text-primary-700 border-b-2 border-primary-600 bg-white' : 'text-slate-400'}`}>2. Validação Termodinâmica</div>
              <div className={`flex-1 px-4 text-center py-4 text-sm font-semibold transition-colors ${step === 3 ? 'text-primary-700 border-b-2 border-primary-600 bg-white' : 'text-slate-400'}`}>3. Memorial e ART</div>
            </div>

          <div className="p-8 md:p-10 print:p-0">
            {/* ─── MÓDULO HVAC ─── */}
            {activeModule === 'hvac' && (
              <>
                {step === 1 && (
                  <HVACForm 
                    initialData={data}
                    isLoading={loading}
                    onSubmitStart={() => setLoading(true)}
                    onSubmitError={() => {
                      setLoading(false);
                      alert("Falha de conexão com o Motor de Cálculo. Verifique se a API backend está respondendo.");
                    }}
                    onCalculate={handleCalculate}
                    onSubmitSuccess={(formData, responseData) => {
                      setData(formData);
                      setResult(responseData);
                      addSimulationToHistory({
                        type: 'HVAC',
                        summary: `${responseData.total_btu_h.toLocaleString()} BTU/h - ${data.localizacao}`
                      });
                      setTimeout(() => {
                        setStep(2);
                        setLoading(false);
                      }, 800);
                    }}
                  />
                )}

                {step === 2 && result && (
                  <HVACResults 
                    result={result}
                    isLoading={loading}
                    onGenerateReport={handleGenerateReport}
                  />
                )}

                {step === 3 && result && artData && budget && (
                  <HVACReport 
                    data={data}
                    result={result}
                    budget={budget}
                    artData={artData}
                    leadName={leadInfo.name}
                    leadEmail={leadInfo.email}
                    onRestart={restartSimulation}
                  />
                )}
              </>
            )}

            {/* ─── MÓDULO SOLAR AQS ─── */}
            {activeModule === 'solar' && (
               <>
                 {step === 1 && (
                   <SolarForm 
                     onSubmit={handleCalculateSolar}
                     isLoading={loading}
                   />
                 )}
                 
                 {step === 2 && solarResult && (
                   <SolarResults 
                     result={solarResult}
                     isLoading={loading}
                     onGenerateReport={handleGenerateSolarReport}
                   />
                 )}

                 {step === 3 && solarResult && solarData && (
                   <SolarReport 
                     result={solarResult}
                     leadInfo={leadInfo}
                     localizacao={solarData.localizacao}
                   />
                 )}
               </>
            )}

            {/* ─── MÓDULO VENTILAÇÃO ─── */}
            {activeModule === 'ventilation' && (
                <>
                  {step === 1 && (
                     <VentilationForm 
                       onSubmit={handleCalculateVentilation}
                       isLoading={loading}
                       initialData={ventData}
                     />
                  )}
                  {step === 2 && ventResult && (
                     <VentilationResults 
                       result={ventResult}
                       isLoading={loading}
                       onGenerateReport={(lead) => {
                          setLeadInfo(lead);
                          setStep(3);
                       }}
                     />
                  )}
                  {step === 3 && ventResult && (
                     <VentilationReport 
                       result={ventResult}
                       leadInfo={leadInfo}
                     />
                  )}
                </>
            )}

            {/* ─── MÓDULO EFICIENCIA ─── */}
            {activeModule === 'efficiency' && (
                <>
                  {step === 1 && (
                     <EnergyEfficiencyForm 
                       onSubmit={handleCalculateEfficiency}
                       isLoading={loading}
                       initialData={efficiencyData}
                     />
                  )}
                  {step === 2 && efficiencyResult && (
                     <EnergyEfficiencyResults 
                       result={efficiencyResult}
                       isLoading={loading}
                       onGenerateReport={(lead) => {
                          setLeadInfo(lead);
                          setStep(3);
                       }}
                     />
                  )}
                  {step === 3 && efficiencyResult && (
                     <EnergyEfficiencyReport 
                       result={efficiencyResult}
                       leadInfo={leadInfo}
                     />
                  )}
                </>
            )}

            {/* ─── MÓDULO HVAC COMPLETO ─── */}
            {activeModule === 'hvac_complete' && (
                <>
                  {step === 1 && (
                     <HVACCompleteForm 
                       onSubmit={handleCalculateHvacComplete}
                       isLoading={loading}
                       initialData={hvacCompleteData}
                     />
                  )}
                  {step === 2 && hvacCompleteResult && (
                     <HVACCompleteResults 
                       result={hvacCompleteResult}
                       isLoading={loading}
                       onGenerateReport={(lead) => {
                          setLeadInfo(lead);
                          setStep(3);
                       }}
                     />
                  )}
                  {step === 3 && hvacCompleteResult && (
                     <HVACCompleteReport 
                       result={hvacCompleteResult}
                       leadInfo={leadInfo}
                     />
                  )}
                </>
            )}
           
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-400 print:hidden">
          Powered by Multi-Agent Engineering Core &copy; 2026
        </div>
      </div>
     </div>

     {/* In-app feedback widget (floating, visible to authenticated users) */}
     <FeedbackWidget />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
