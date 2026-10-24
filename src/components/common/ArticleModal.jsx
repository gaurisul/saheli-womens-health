import React from 'react';
import { X, Clock, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ArticleModal() {
  const { activeEduArticle, setActiveEduArticle } = useApp();

  if (!activeEduArticle) return null;

  return (
    <div className="modal-overlay" onClick={() => setActiveEduArticle(null)}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px' }}
      >
        <div style={{ padding: '1.5rem 1.75rem 1rem', borderBottom: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span className="badge badge-berry">{activeEduArticle.category}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={13} /> {activeEduArticle.readingTime}
              </span>
            </div>
            <h2 style={{ fontSize: '1.3rem' }}>{activeEduArticle.title}</h2>
          </div>
          <button 
            onClick={() => setActiveEduArticle(null)} 
            aria-label="Close article modal"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem 1.75rem', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          <div style={{ 
            whiteSpace: 'pre-line',
            backgroundColor: 'var(--bg-secondary)', 
            padding: '1.25rem', 
            borderRadius: '12px',
            border: '1px solid var(--border-card)',
            marginBottom: '1.25rem'
          }}>
            {activeEduArticle.content.trim()}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Tag size={13} /> Tags:
            </span>
            {(activeEduArticle.tags || []).map((t, idx) => (
              <span key={idx} className="badge badge-sage" style={{ fontSize: '0.72rem' }}>
                {t}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => setActiveEduArticle(null)}>
              Done Reading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
