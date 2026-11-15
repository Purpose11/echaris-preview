import { useEffect } from "react";

import { Button } from "@/design-system/components/core/Button.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";

interface AdminConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  tone?: "danger" | "dark" | "default";
  onConfirm: () => void;
  onClose: () => void;
}

export function AdminConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  tone = "default",
  onConfirm,
  onClose,
}: AdminConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(26,26,26,0.52)] p-4 backdrop-blur-[2px] sm:items-center"
      role="presentation"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        className="w-full max-w-[440px] overflow-hidden rounded-[14px] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[0_24px_64px_rgba(26,26,26,0.22)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b border-[var(--border-subtle)] px-6 pt-6 pb-5">
          <button
            type="button"
            aria-label="Close"
            disabled={loading}
            onClick={onClose}
            className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-md border border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--neutral-50)] disabled:opacity-50"
          >
            <Icon name="x" size={16} />
          </button>
          <h2
            id="admin-confirm-title"
            className="m-0 pr-10 text-lg font-bold tracking-[-0.02em] text-[var(--text-heading)]"
          >
            {title}
          </h2>
          <p className="mt-2 mb-0 text-sm leading-relaxed text-[var(--text-muted)]">
            {description}
          </p>
        </div>
        <div className="flex flex-col-reverse gap-3 px-6 py-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-md px-4 text-sm font-semibold shadow-none"
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
            style={
              tone === "danger"
                ? {
                    background: "var(--danger-600, #b42318)",
                    border: "1px solid var(--danger-600, #b42318)",
                    color: "#ffffff",
                    boxShadow: "none",
                  }
                : tone === "dark"
                  ? {
                      background: "#171717",
                      border: "1px solid #171717",
                      color: "#ffffff",
                      boxShadow: "none",
                    }
                  : undefined
            }
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
