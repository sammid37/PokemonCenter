import React from 'react';

interface ConfirmModalProps {
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'error' | 'warning' | 'info';
}

export default function ConfirmModal({
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isSubmitting = false,
  onConfirm,
  onCancel,
  variant = 'error',
}: ConfirmModalProps) {
  // Define a cor do botão de confirmação com base na variante escolhida
  const confirmButtonClass = {
    error: 'btn-error',
    warning: 'btn-warning',
    info: 'btn-info',
  }[variant];

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="py-4 text-base-content/80">{message}</div>
        
        <div className="modal-action">
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-sm"
            disabled={isSubmitting}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`btn ${confirmButtonClass} btn-sm`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onCancel} />
    </dialog>
  );
}