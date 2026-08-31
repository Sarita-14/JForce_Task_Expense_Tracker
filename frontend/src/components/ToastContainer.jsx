import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const ICONS = {
  success: CheckCircle2,
  error: TriangleAlert,
  info: Info
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || Info;

        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <Icon size={18} />
            <span>{toast.text}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
            <div className="toast-progress" />
          </div>
        );
      })}
    </div>
  );
}