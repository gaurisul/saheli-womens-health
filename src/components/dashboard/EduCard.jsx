import React from 'react';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EDUCATIONAL_ARTICLES } from '../../data/educationalArticles';

export default function EduCard() {
  const { setActiveEduArticle } = useApp();

  return (
    <div className="saheli-card">
      <div className="card-header-row">
        <div className="card-title">
          <BookOpen size={18} color="var(--color-berry)" />
          <span>Educational Clinical Resources</span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Evidence-based guides
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {EDUCATIONAL_ARTICLES.slice(0, 3).map((article) => (
          <div
            key={article.id}
            onClick={() => setActiveEduArticle(article)}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-card)',
              borderRadius: '12px',
              padding: '1.1rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-card)';
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span className="badge badge-berry" style={{ fontSize: '0.68rem' }}>
                  {article.category}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> {article.readingTime}
                </span>
              </div>
              <h4 style={{ fontSize: '0.98rem', color: 'var(--text-primary)', marginBottom: '0.4rem', lineHeight: 1.35 }}>
                {article.title}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                {article.summary}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-berry)', fontSize: '0.78rem', fontWeight: 600 }}>
              <span>Read Guide</span>
              <ArrowRight size={13} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
