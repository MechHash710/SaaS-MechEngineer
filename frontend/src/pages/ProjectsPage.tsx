import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FolderOpen, Plus, Copy, Trash, ArrowRight, FolderKanban } from 'lucide-react';
import { getProjects, saveProject, deleteProject, duplicateProject, type Project } from '../lib/projects';

interface ProjectsPageProps {
  onOpenProject: (proj: Project) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onOpenProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProj, setNewProj] = useState({ name: '', description: '', type: 'hvac' });

  const loadProjects = () => setProjects(getProjects());

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    saveProject(newProj);
    setIsModalOpen(false);
    setNewProj({ name: '', description: '', type: 'hvac' });
    loadProjects();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Atenção! Deseja realmente excluir este projeto e todas as suas simulações?")) {
      deleteProject(id);
      loadProjects();
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateProject(id);
    loadProjects();
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <FolderKanban className="text-primary-600 h-6 w-6" /> Gestão de Projetos
          </h2>
          <p className="text-sm text-slate-500 mt-1">Organize suas simulações em pastas de projetos para fácil acesso e versão.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Novo Projeto
        </Button>
      </div>

      {projects.length === 0 ? (
         <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
             <FolderOpen className="mx-auto h-12 w-12 text-slate-400 mb-3" />
             <h3 className="text-lg font-medium text-slate-900">Nenhum projeto encontrado</h3>
             <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Comece criando seu primeiro projeto para agregar todos os memoriais e cálculos térmicos em um só lugar.</p>
             <Button onClick={() => setIsModalOpen(true)} variant="secondary" className="mt-6">Criar Primeiro Projeto</Button>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(p => (
            <Card key={p.id} className="hover:border-primary-300 transition-colors group">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="flex justify-between items-start text-lg">
                  <span className="truncate pr-2">{p.name}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${p.type === 'hvac' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {p.type === 'hvac' ? 'AVAC' : 'SOLAR'}
                  </span>
                </CardTitle>
                <p className="text-xs text-slate-500 font-medium">ID: {p.id}</p>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">{p.description || "Sem descrição..."}</p>
                <div className="flex justify-between text-xs text-slate-400 font-medium bg-slate-50 px-3 py-2 rounded">
                  <span>Simulações: {p.simulations?.length || 0}</span>
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                   <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDuplicate(p.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Duplicar">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Excluir">
                        <Trash className="w-4 h-4" />
                      </button>
                   </div>
                   <Button variant="ghost" onClick={() => onOpenProject(p)} className="text-primary-600 hover:bg-primary-50 px-3 py-1 h-8">
                     Abrir <ArrowRight className="w-4 h-4 ml-1" />
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Novo Projeto</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Projeto</label>
                <input 
                  required autoFocus
                  value={newProj.name} onChange={e => setNewProj({...newProj, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Ex: Residência Alpha"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                <textarea 
                  value={newProj.description} onChange={e => setNewProj({...newProj, description: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  rows={3} placeholder="Notas ou endereço..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Engenharia Prime</label>
                <select 
                  value={newProj.type} onChange={e => setNewProj({...newProj, type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="hvac">Climatização (AVAC)</option>
                  <option value="solar">Aquecimento Solar</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-primary-600 text-white">Salvar Projeto</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
