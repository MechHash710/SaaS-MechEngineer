import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div 
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div 
        className={cn(
          "relative flex flex-col w-full bg-white rounded-xl shadow-2xl animate-in zoom-in-95 fade-in duration-200",
          sizeClasses[size]
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {true && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            {title && (
              <h3 className="text-lg font-semibold text-slate-800">
                {title}
              </h3>
            )}
            <button
              onClick={onClose}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );

  // Use portal if possible to avoid z-index issues, otherwise fallback to direct render
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
