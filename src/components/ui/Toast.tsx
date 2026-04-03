import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, variant?: ToastVariant, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info', duration: number = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const toast: Toast = { id, message, variant, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  const content = (
    <div className="fixed bottom-4 right-4 space-y-3 z-50 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );

  return createPortal(content, document.body);
};

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const variantConfig: Record<ToastVariant, { bg: string; text: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    icon: <Check className="w-5 h-5 text-green-600" />,
  },
  error: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    icon: <Info className="w-5 h-5 text-blue-600" />,
  },
};

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const config = variantConfig[toast.variant];

  return (
    <div
      className={`${config.bg} ${config.text} rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-300 font-[family-name:var(--font-plus-jakarta-sans)]`}
      role="status"
      aria-live="polite"
    >
      {config.icon}
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
        aria-label="Close toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
