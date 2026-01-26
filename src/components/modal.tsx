// src/components/ui/Modal.tsx
import { useEffect, useId, useRef } from "react";

type ModalSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

type ModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  size?: ModalSize;

  /** Accesibilidad */
  ariaLabel?: string;

  /** Acciones */
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onClose: () => void;

  /** Contenido */
  children: React.ReactNode;

  /** Estado */
  loading?: boolean;
  disableConfirm?: boolean;

  /** Opcional: mostrar footer con botones */
  showFooter?: boolean;
};

export default function Modal({
  open,
  title,
  description,
  size = "md",
  ariaLabel,
  confirmText = "Guardar",
  cancelText = "Cancelar",
  onConfirm,
  onClose,
  children,
  loading = false,
  disableConfirm = false,
  showFooter = true,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    // Bloquear scroll del body mientras está abierto
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Enfocar el panel para accesibilidad
    setTimeout(() => panelRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const label = ariaLabel ?? title ?? "Modal";

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onMouseDown={onClose}
      />

      {/* Contenedor */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {/* Panel */}
        <div
          ref={panelRef}
          tabIndex={-1}
          onMouseDown={(e) => e.stopPropagation()} // evita cerrar al click dentro
          className={[
            "w-full",
            sizeClasses[size],
            "bg-white rounded-2xl shadow-2xl border border-gray-200",
            "focus:outline-none",
          ].join(" ")}
        >
          {/* Header */}
          {(title || description) && (
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {title && (
                    <h2
                      id={titleId}
                      className="text-lg sm:text-xl font-semibold text-[#184E8B]"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id={descId} className="mt-1 text-sm text-gray-600">
                      {description}
                    </p>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="shrink-0 rounded-lg p-2 hover:bg-gray-100 transition-colors"
                  aria-label="Cerrar"
                  type="button"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-5 max-h-[70vh] overflow-auto">
            {children}
          </div>

          {/* Footer */}
          {showFooter && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                {cancelText}
              </button>

              {onConfirm && (
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading || disableConfirm}
                  className={[
                    "px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors",
                    "bg-[#184E8B] hover:opacity-90",
                    (loading || disableConfirm) ? "opacity-60 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {loading ? "Guardando..." : confirmText}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
