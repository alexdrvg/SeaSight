import React from 'react';

interface PaginationProps {
  page: number; // 0-based
  totalPages: number;
  onChange: (page: number) => void;
}

const buildPages = (current: number, total: number): Array<number | '…'> => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const wanted = new Set(
    [1, 2, total - 1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total)
  );
  const sorted = Array.from(wanted).sort((a, b) => a - b);

  const out: Array<number | '…'> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
};

export const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  const current = page + 1;

  return (
    <nav className="seasight-pagination" aria-label="Paginación de especies">
      <button
        type="button"
        className="seasight-pagination__btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        aria-label="Página anterior"
      >
        ‹
      </button>

      {buildPages(current, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="seasight-pagination__gap" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`seasight-pagination__btn ${p === current ? 'seasight-pagination__btn--active' : ''}`}
            onClick={() => onChange(p - 1)}
            aria-current={p === current ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className="seasight-pagination__btn"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages - 1}
        aria-label="Página siguiente"
      >
        ›
      </button>
    </nav>
  );
};