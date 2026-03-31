'use client';

import type { PropsWithChildren } from 'react';

type DetailOverlayShellProps = PropsWithChildren<{
  ariaLabel: string;
  onClose: () => void;
  cardClassName: string;
}>;

export function DetailOverlayShell({ ariaLabel, onClose, cardClassName, children }: DetailOverlayShellProps) {
  return (
    <article
      className="note-detail"
      aria-live="polite"
      onClick={onClose}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <div
        className={cardClassName}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </article>
  );
}
