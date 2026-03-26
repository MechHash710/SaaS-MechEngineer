import React, { useState } from 'react';

const ENGINEERING_TYPES = [
  'Mecânica', 'Civil', 'Elétrica', 'Ambiental', 'Química', 'Outra'
];

const BetaInvitePage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    engineering_type: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError('Nome e e-mail são obrigatórios.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/v1/feedback/beta_invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Erro ao registrar.');
      }
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Participe do Beta Fechado
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Seja um dos primeiros engenheiros a usar a plataforma. 
            Vagas limitadas para o grupo beta exclusivo.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: '🔓', text: 'Acesso antecipado' },
            { icon: '💸', text: '3 meses grátis Pro' },
            { icon: '🎯', text: 'Influencie o produto' },
          ].map((b) => (
            <div key={b.text} className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{b.icon}</div>
              <p className="text-xs text-gray-600 font-medium">{b.text}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {sent ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Você está na lista!</h2>
              <p className="text-gray-500 text-sm">
                Entraremos em contato no e-mail <strong>{form.email}</strong> quando as vagas do beta abrirem.
              </p>
              <a
                href="/"
                className="inline-block mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Voltar para a Plataforma
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    id="beta-name"
                    type="text"
                    required
                    placeholder="João Silva"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                  <input
                    id="beta-email"
                    type="email"
                    required
                    placeholder="joao@empresa.com"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa / Escritório</label>
                <input
                  id="beta-company"
                  type="text"
                  placeholder="Engenharia Silva & Associados"
                  value={form.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Área de Especialização</label>
                <select
                  id="beta-engineering-type"
                  value={form.engineering_type}
                  onChange={(e) => handleChange('engineering_type', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Selecione...</option>
                  {ENGINEERING_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem (opcional)</label>
                <textarea
                  id="beta-message"
                  rows={3}
                  placeholder="Conte-nos como você usa ferramentas de engenharia hoje..."
                  value={form.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                id="beta-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? 'Registrando...' : 'Quero Participar do Beta ✦'}
              </button>

              <p className="text-center text-xs text-gray-400">
                Sem compromisso. Cancelamento a qualquer momento.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BetaInvitePage;
