import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  useActivateAdmin,
  useAdminDetail,
  useAdminMe,
  useDeactivateAdmin,
  useDeleteAdmin,
} from "@/api/admin/hooks";
import { AdminConfirmModal } from "@/components/admin/AdminConfirmModal";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { AdminCustomerDetailSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { normalizeError } from "@/utils/normalizeError";

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="m-0 text-[11px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
        {label}
      </p>
      <p className="mt-2 mb-0 text-sm font-medium text-[var(--text-heading)]">
        {value || "—"}
      </p>
    </div>
  );
}

function formatGender(gender?: string | null) {
  if (!gender) return "—";
  return gender
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const blackButtonStyle = {
  background: "#171717",
  border: "1px solid #171717",
  color: "#ffffff",
  boxShadow: "none",
} as const;

export default function AdminDetail() {
  const navigate = useNavigate();
  const { adminId = "" } = useParams();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const meQuery = useAdminMe();
  const adminQuery = useAdminDetail(adminId);
  const activateMutation = useActivateAdmin();
  const deactivateMutation = useDeactivateAdmin();
  const deleteMutation = useDeleteAdmin();

  const admin = adminQuery.data;
  const me = meQuery.data;
  const isSelf =
    Boolean(admin && me) &&
    (admin?.adminId === me?.adminId || admin?.userId === me?.userId);
  const canManage = Boolean(admin) && !admin?.superAdmin && !isSelf;
  const busy =
    activateMutation.isPending ||
    deactivateMutation.isPending ||
    deleteMutation.isPending;

  if (adminQuery.isLoading) {
    return <AdminCustomerDetailSkeleton />;
  }

  if (adminQuery.isError || !admin) {
    return (
      <div className="flex w-full flex-col gap-8 md:gap-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <Link
            to="/admin/admins"
            className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
          >
            Admins
          </Link>
          <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-[var(--text-muted)]">Admin</span>
        </nav>
        <section className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-20 text-center">
          <p className="m-0 max-w-[420px] text-sm text-[var(--text-danger,#b42318)]">
            {adminQuery.isError
              ? normalizeError(adminQuery.error)
              : "Administrator not found."}
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md px-4 text-sm font-semibold shadow-none"
            onClick={() => void adminQuery.refetch()}
          >
            Try again
          </Button>
        </section>
      </div>
    );
  }

  const displayName =
    [admin.firstName, admin.lastName].filter(Boolean).join(" ").trim() ||
    admin.emailAddress;

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          to="/admin/admins"
          className="font-semibold text-[var(--text-brand)] no-underline hover:underline"
        >
          Admins
        </Link>
        <Icon name="chevron-right" size={14} style={{ color: "var(--text-muted)" }} />
        <span className="truncate font-medium text-[var(--text-heading)]">
          {displayName}
        </span>
      </nav>

      <AdminPageHeader
        title={displayName}
        description={admin.emailAddress}
        actions={
          canManage ? (
            <>
              {admin.active ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-md px-4 text-sm font-semibold shadow-none"
                  loading={deactivateMutation.isPending}
                  disabled={busy}
                  onClick={() => deactivateMutation.mutate(admin.adminId)}
                >
                  Deactivate
                </Button>
              ) : (
                <Button
                  type="button"
                  className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
                  loading={activateMutation.isPending}
                  disabled={busy}
                  onClick={() => activateMutation.mutate(admin.adminId)}
                >
                  Activate
                </Button>
              )}
              <Button
                type="button"
                className="h-11 rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0"
                style={blackButtonStyle}
                disabled={busy}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            </>
          ) : null
        }
      />

      {!canManage ? (
        <p className="m-0 text-sm text-[var(--text-muted)]">
          {isSelf
            ? "You can’t activate, deactivate, or delete your own account here."
            : "Super admin accounts can’t be activated, deactivated, or deleted from this page."}
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:grid-cols-2 sm:p-6 md:grid-cols-3 md:p-8">
        <Field label="Email address" value={admin.emailAddress} />
        <Field label="Phone number" value={admin.phoneNumber} />
        <Field label="Gender" value={formatGender(admin.gender)} />
        <Field label="Age" value={admin.age || "—"} />
        <Field label="Role" value={admin.superAdmin ? "Super admin" : "Admin"} />
        <Field
          label="Status"
          value={<AdminStatusPill status={admin.active ? "ACTIVE" : "INACTIVE"} />}
        />
        <Field
          label="Verified"
          value={admin.userVerified ? "Verified" : "Not verified"}
        />
      </section>

      <AdminConfirmModal
        open={deleteOpen}
        title="Delete administrator?"
        description={`This soft-deletes ${displayName} and their linked user account. This can’t be undone from the admin portal.`}
        confirmLabel="Delete admin"
        loading={deleteMutation.isPending}
        tone="danger"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteMutation.mutate(admin.adminId, {
            onSuccess: () => {
              setDeleteOpen(false);
              navigate("/admin/admins", { replace: true });
            },
          });
        }}
      />
    </div>
  );
}
