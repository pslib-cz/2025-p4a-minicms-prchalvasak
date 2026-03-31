"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
};

type PendingConfirm = {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: () => Promise.resolve(false),
});

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setPending({ options, resolve });
    });
  }, []);

  const handleConfirm = () => {
    pending?.resolve(true);
    setPending(null);
  };

  const handleCancel = () => {
    pending?.resolve(false);
    setPending(null);
  };

  useEffect(() => {
    if (!pending) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {pending && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div
            className="modal-box confirm-dialog"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
          >
            <h3 id="confirm-title">{pending.options.title}</h3>
            <p id="confirm-message" className="confirm-message">
              {pending.options.message}
            </p>
            <div className="modal-actions">
              <button className="btn" onClick={handleCancel} autoFocus>
                {pending.options.cancelLabel ?? "Zrušit"}
              </button>
              <button
                className={`btn ${pending.options.variant === "danger" ? "btn-danger" : "btn-accent"}`}
                onClick={handleConfirm}
              >
                {pending.options.confirmLabel ?? "Potvrdit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
