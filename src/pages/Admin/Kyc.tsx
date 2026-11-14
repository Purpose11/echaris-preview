import { type ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import {
  useAdminCustomerKyc,
  useAdminKycList,
  useApproveAdminKyc,
  useRejectAdminKyc,
} from "@/api/admin/hooks";
import type {
  AdminKycDocument,
  AdminKycSubmission,
  KycReviewStatus,
} from "@/api/admin/types";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/design-system/components/core/Button.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { Select } from "@/design-system/components/forms/Select.jsx";
import { normalizeError } from "@/utils/normalizeError";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export default function Kyc() {
  const [searchParams, setSearchParams] = useSearchParams();
  const customerIdParam = searchParams.get("customerId") || "";
  const [status, setStatus] = useState<KycReviewStatus>("PENDING");
  const [page, setPage] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerIdParam);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<AdminKycDocument | null>(null);

  const pageSize = 20;
  const listQuery = useAdminKycList(
    { page: page + 1, size: pageSize, status },
    !selectedCustomerId,
  );
  const detailQuery = useAdminCustomerKyc(
    selectedCustomerId,
    Boolean(selectedCustomerId),
  );
  const approveMutation = useApproveAdminKyc();
  const rejectMutation = useRejectAdminKyc();

  const rows = selectedCustomerId
    ? detailQuery.data?.data
      ? [detailQuery.data.data]
      : []
    : (listQuery.data?.data?.data ?? []);
  const totalPages = selectedCustomerId ? 1 : (listQuery.data?.data?.totalPage ?? 0);
  const isLoading = selectedCustomerId ? detailQuery.isLoading : listQuery.isLoading;
  const isError = selectedCustomerId ? detailQuery.isError : listQuery.isError;
  const error = selectedCustomerId ? detailQuery.error : listQuery.error;

  const columns = useMemo<ColumnDef<AdminKycSubmission>[]>(
    () => [
      {
        accessorKey: "customerId",
        header: "Customer",
        cell: ({ row }) => (
          <button
            type="button"
            className="border-0 bg-transparent p-0 text-left text-sm font-semibold text-[var(--text-heading)] underline-offset-4 hover:underline"
            onClick={() => {
              setSelectedCustomerId(row.original.customerId);
              setSearchParams({ customerId: row.original.customerId });
            }}
          >
            {row.original.customerId.slice(0, 8)}…
          </button>
        ),
      },
      {
        id: "docs",
        header: "Documents",
        cell: ({ row }) => row.original.kycDocuments?.length ?? 0,
      },
      {
        id: "done",
        header: "Done KYC",
        cell: ({ row }) => (
          <AdminStatusPill status={row.original.doneKyc ? "APPROVED" : "PENDING"} />
        ),
      },
      {
        id: "accepted",
        header: "Accepted",
        cell: ({ row }) => (
          <AdminStatusPill status={row.original.kycAccepted ? "APPROVED" : "PENDING"} />
        ),
      },
    ],
    [setSearchParams],
  );

  const documents =
    detailQuery.data?.data?.kycDocuments ??
    (selectedCustomerId
      ? []
      : rows.flatMap((r) =>
          (r.kycDocuments ?? []).map((d) => ({
            ...d,
            _customerId: r.customerId,
          })),
        ));

  const activeCustomerId =
    selectedCustomerId ||
    (documents[0] && "_customerId" in documents[0]
      ? String((documents[0] as { _customerId?: string })._customerId ?? "")
      : "");

  const onApprove = async (doc: AdminKycDocument) => {
    if (!activeCustomerId) return;
    try {
      await approveMutation.mutateAsync({
        customerId: activeCustomerId,
        documentType: String(doc.documentType),
        payload: { submissionVersion: doc.submissionVersion },
      });
    } catch {
      /* toast in hook */
    }
  };

  const onReject = async () => {
    if (!rejectTarget || !activeCustomerId) return;
    if (rejectReason.trim().length < 5) {
      toast.error("Enter a rejection reason (at least 5 characters).");
      return;
    }
    try {
      await rejectMutation.mutateAsync({
        customerId: activeCustomerId,
        documentType: String(rejectTarget.documentType),
        payload: {
          submissionVersion: rejectTarget.submissionVersion,
          rejectionReason: rejectReason.trim(),
        },
      });
      setRejectTarget(null);
      setRejectReason("");
    } catch {
      /* toast in hook */
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 md:gap-10">
      <AdminPageHeader
        title="KYC review"
        description="Review identity documents, approve verified submissions, or reject with a clear reason."
      />

      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full sm:max-w-[220px]">
          <FormField label="Status" htmlFor="kyc-status">
            <Select
              id="kyc-status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as KycReviewStatus);
                setPage(0);
                setSelectedCustomerId("");
                setSearchParams({});
              }}
              options={STATUS_OPTIONS}
            />
          </FormField>
        </div>
        {selectedCustomerId ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-md px-4 text-sm font-semibold shadow-none sm:w-auto"
            onClick={() => {
              setSelectedCustomerId("");
              setSearchParams({});
            }}
          >
            Back to list
          </Button>
        ) : null}
      </div>

      {isError ? (
        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] px-6 py-16 text-center">
          <p className="m-0 text-sm text-[var(--text-danger,#b42318)]">
            {normalizeError(error)}
          </p>
        </section>
      ) : selectedCustomerId ? (
        <section className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-lg font-bold text-[var(--text-heading)]">
                Documents
              </h2>
              <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">
                Customer{" "}
                <Link
                  to={`/admin/customers/${selectedCustomerId}`}
                  className="font-semibold text-[var(--text-brand)]"
                >
                  {selectedCustomerId.slice(0, 8)}…
                </Link>
              </p>
            </div>
          </div>

          {isLoading ? (
            <p className="m-0 text-sm text-[var(--text-muted)]">Loading…</p>
          ) : documents.length === 0 ? (
            <p className="m-0 text-sm text-[var(--text-muted)]">No documents.</p>
          ) : (
            <ul className="m-0 list-none space-y-5 p-0">
              {documents.map((doc) => (
                <li
                  key={`${doc.documentType}-${doc.submissionVersion}`}
                  className="rounded-lg border border-[var(--border-subtle)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="m-0 text-sm font-semibold text-[var(--text-heading)]">
                        {String(doc.documentType).replace(/_/g, " ")}
                      </p>
                      <p className="mt-1 mb-0 text-xs text-[var(--text-muted)]">
                        {doc.documentNumber} · version {doc.submissionVersion}
                      </p>
                    </div>
                    <AdminStatusPill status={String(doc.reviewStatus)} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a
                      href={doc.frontViewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-[var(--text-brand)]"
                    >
                      Front view
                    </a>
                    <a
                      href={doc.backViewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-[var(--text-brand)]"
                    >
                      Back view
                    </a>
                  </div>
                  {String(doc.reviewStatus).toUpperCase() === "PENDING" ? (
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Button
                        type="button"
                        className="h-10 w-full rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0 sm:w-auto"
                        loading={approveMutation.isPending}
                        onClick={() => void onApprove(doc)}
                      >
                        Approve
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 w-full rounded-md px-4 text-sm font-semibold shadow-none sm:w-auto"
                        onClick={() => {
                          setRejectTarget(doc);
                          setRejectReason("");
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : null}
                  {doc.rejectionReason ? (
                    <p className="mt-3 mb-0 text-sm text-[var(--text-danger,#b42318)]">
                      Reason: {doc.rejectionReason}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {rejectTarget ? (
            <div className="mt-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-page)] p-4">
              <FormField label="Rejection reason" htmlFor="reject-reason">
                <Input
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this document was rejected"
                />
              </FormField>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  className="h-10 w-full rounded-md border-0 px-4 text-sm font-semibold shadow-none ring-0 sm:w-auto"
                  loading={rejectMutation.isPending}
                  onClick={() => void onReject()}
                >
                  Confirm reject
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full rounded-md px-4 text-sm font-semibold shadow-none sm:w-auto"
                  onClick={() => setRejectTarget(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          emptyMessage="No KYC submissions for this status."
          manualPagination
          pageCount={Math.max(totalPages, 1)}
          pagination={{ pageIndex: page, pageSize }}
          onPaginationChange={(updater) => {
            const next =
              typeof updater === "function"
                ? updater({ pageIndex: page, pageSize })
                : updater;
            setPage(next.pageIndex);
          }}
          hidePaginationWhenSinglePage={false}
        />
      )}
    </div>
  );
}
