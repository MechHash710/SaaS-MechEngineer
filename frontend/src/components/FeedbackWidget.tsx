import React, { useState } from 'react';
import { api } from '../lib/api';

type Category = 'bug' | 'sugestao' | 'elogio';

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'bug', label: 'Bug / Problema', emoji: '🐛' },
  { value: 'sugestao', label: 'Sugestão', emoji: '💡' },
  { value: 'elogio', label: 'Elogio', emoji: '⭐' },
];

const FeedbackWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState<Category>('sugestao');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) { setError('Selecione uma avaliação de 1 a 5 estrelas.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/feedback/submit', {
        rating,
        category,
        message: message.trim() || null,
        page: window.location.pathname + window.location.search,
      });
      setSent(true);
    } catch {
      setError('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (sent) {
      setSent(false);
      setRating(0);
      setHoverRating(0);
      setCategory('sugestao');
      setMessage('');
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        id="feedback-widget-btn"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-full shadow-lg transition-all duration-200 text-sm font-medium"
        title="Enviar Feedback"
      >
        <span>💬</span>
        <span>Feedback</span>
      </button>

      {/* Feedback Modal */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-blue-600 text-white">
            <h3 className="font-semibold text-sm">Enviar Feedback</h3>
            <button
              id="feedback-close-btn"
              onClick={handleClose}
              className="text-white/80 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>

          {sent ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-semibold text-gray-800">Obrigado pelo feedback!</p>
              <p className="text-sm text-gray-500 mt-1">Sua opinião é muito importante para nós.</p>
              <button
                onClick={handleClose}
                className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Fechar
              </button>
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {/* Star Rating */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Avaliação geral</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      id={`star-${star}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      {star <= (hoverRating || rating) ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Tipo</p>
                <div className="flex gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      id={`category-${c.value}`}
                      onClick={() => setCategory(c.value)}
                      className={`flex-1 text-xs px-2 py-1.5 rounded-lg border transition-colors ${
                        category === c.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Mensagem (opcional)</p>
                <textarea
                  id="feedback-message"
                  rows={3}
                  placeholder="Descreva sua experiência..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                id="feedback-submit-btn"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Feedback'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
