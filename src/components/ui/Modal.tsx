import React, { forwardRef, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeButton?: boolean;
  className?: string;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    { isOpen, onClose, title, children, footer, closeButton = true, className },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!isOpen) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      const handleClickOutside = (e: MouseEvent) => {
        if (modalRef.current && e.target === modalRef.current) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = 'unset';
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const content = (
      <div
        ref={modalRef}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        role="presentation"
      >
        <div
          ref={ref}
          className={`bg-white rounded-lg shadow-lg max-w-md w-full mx-4 font-[family-name:var(--font-plus-jakarta-sans)] ${className || ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {closeButton && (
              <button
                onClick={onClose}
                className="ml-auto p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-4">{children}</div>

          {/* Footer */}
          {footer && <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">{footer}</div>}
        </div>
      </div>
    );

    return createPortal(content, document.body);
  }
);

Modal.displayName = 'Modal';
