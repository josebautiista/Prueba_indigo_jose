import React from "react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-100 hover:text-slate-400 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-4">{children}</div>

        {footer ? (
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Modal;
