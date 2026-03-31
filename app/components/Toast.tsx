"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Check, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

const icons: Record<ToastType, ReactNode> = {
  success: <Check size={16} strokeWidth={2.5} />,
  error: <X size={16} strokeWidth={2.5} />,
  info: <Info size={16} strokeWidth={2.5} />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++nextId;
    setToasts((current) => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toasts.length > 0 && (
        <div className="toast-container" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`toast-item toast-${t.type}`}
              onClick={() => dismiss(t.id)}
            >
              <span className="toast-icon">{icons[t.type]}</span>
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
