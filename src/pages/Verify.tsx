import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useCreateOrUpdateAddress } from "@/api/addresses/hooks";
import { useCustomerKyc, useSubmitCustomerKyc } from "@/api/customer/hooks";
import type { CustomerKycData, KycDocument } from "@/api/customer/types";
import { useUploadPublicFile } from "@/api/utilities/hooks";
import logoOrange from "@/assets/echaris-logo-orange.png";
import { UserProtectedRoute } from "@/components/shared/UserProtectedRoute";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/design-system/components/core/Badge.jsx";
import { Button } from "@/design-system/components/core/Button.jsx";
import { Card } from "@/design-system/components/core/Card.jsx";
import { Icon } from "@/design-system/components/core/Icon.jsx";
import { Logo } from "@/design-system/components/core/Logo.jsx";
import { ProgressMeter } from "@/design-system/components/data/ProgressMeter.jsx";
import { FileUpload } from "@/design-system/components/forms/FileUpload.jsx";
import { FormField } from "@/design-system/components/forms/FormField.jsx";
import { Input } from "@/design-system/components/forms/Input.jsx";
import { Radio } from "@/design-system/components/forms/Radio.jsx";
import { Select } from "@/design-system/components/forms/Select.jsx";
import {
  getAccessToken,
  getLoggedInUser,
  isAuthenticated,
  setStoredDoneKyc,
} from "@/utils/authHelper";
import { canResubmitKyc, needsKyc } from "@/utils/kycGate";
import { normalizeError } from "@/utils/normalizeError";
import {
  identityDocumentFormSchema,
  type IdentityDocumentFormValues,
  type KycDocumentUiType,
  residentialAddressFormSchema,
  type ResidentialAddressFormValues,
  toDeliveryAddressPayload,
  toKycDocumentType,
} from "@/validations/customer/dto";

const DOCS: Array<{
  id: KycDocumentUiType;
  label: string;
  desc: string;
  icon: string;
  field: string;
  placeholder: string;
  hint: string;
}> = [
  {
    id: "nin",
    label: "National Identification Number (NIN)",
    desc: "11-digit number on your NIN slip or national ID card.",
    icon: "shield-check",
    field: "NIN",
    placeholder: "12345678901",
    hint: "Enter the 11 digits with no spaces.",
  },
  {
    id: "dl",
    label: "Driver's license",
    desc: "License number printed on the front of the card.",
    icon: "id-card",
    field: "License number",
    placeholder: "ABC000000AA00",
    hint: "Enter the number exactly as printed, without spaces.",
  },
  {
    id: "passport",
    label: "International passport",
    desc: "Passport number on the data page.",
    icon: "book-open",
    field: "Passport number",
    placeholder: "A01234567",
    hint: "Starts with a letter, followed by the digits.",
  },
];

const STATES = [
  "Abia",
  "Abuja (FCT)",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
].map((s) => ({ value: s, label: s }));

const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
].map((c) => ({ value: c, label: c }));

const PROGRESS = [
  "Details received",
  "Uploading front of document",
  "Uploading back of document",
  "Submitting identity check",
];

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

type View = "form" | "progress" | "success" | "failed";

function StatusCard({
  tone,
  icon,
  title,
  body,
  children,
}: {
  tone: "brand" | "success" | "danger";
  icon: string;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  const ring = {
    brand: ["var(--orange-50)", "var(--text-brand)"],
    success: ["var(--success-50)", "var(--text-success)"],
    danger: ["var(--danger-50)", "var(--text-danger)"],
  }[tone];

  return (
    <Card padding={28} className="kyc-card anim-in anim-in-2">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignItems: "flex-start",
          width: "100%",
          minWidth: 0,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: "var(--radius-pill)",
            background: ring[0],
            color: ring[1],
          }}
        >
          {icon === "spinner" ? (
            <span className="spin" />
          ) : (
            <Icon name={icon} size={26} />
          )}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h2
            style={{
              margin: 0,
              fontSize: "var(--fs-h3)",
              fontWeight: "var(--fw-bold)",
              letterSpacing: "var(--ls-display)",
              color: "var(--text-heading)",
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "var(--fs-body)",
              color: "var(--text-muted)",
              lineHeight: 1.55,
            }}
          >
            {body}
          </p>
        </div>
        {children}
      </div>
    </Card>
  );
}

function KV({
  label,
  children,
  mono,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="micro">{label}</div>
      <div
        style={{
          marginTop: 4,
          fontSize: "var(--fs-body-sm)",
          fontWeight: "var(--fw-semibold)",
          color: "var(--text-heading)",
          fontFamily: mono ? "var(--font-mono)" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function SectionHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <h2
        style={{
          margin: 0,
          fontSize: "var(--fs-h4)",
          fontWeight: "var(--fw-bold)",
          color: "var(--text-heading)",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          margin: 0,
          fontSize: "var(--fs-body-sm)",
          color: "var(--text-muted)",
          lineHeight: 1.5,
        }}
      >
        {sub}
      </p>
    </div>
  );
}

function latestDocument(data?: CustomerKycData | null): KycDocument | null {
  return data?.kycDocuments?.[0] ?? null;
}

function documentLabel(type?: string | null) {
  if (type === "NIN") return "National Identification Number";
  if (type === "DRIVERS_LICENSE") return "Driver's license";
  if (type === "INTERNATIONAL_PASSPORT") return "International passport";
  return "—";
}

function VerifyContent() {
  const navigate = useNavigate();
  const user = getLoggedInUser();
  const kycQuery = useCustomerKyc(isAuthenticated());
  const addressMutation = useCreateOrUpdateAddress();
  const uploadMutation = useUploadPublicFile();
  const submitKycMutation = useSubmitCustomerKyc();

  const [view, setView] = useState<View>("form");
  const [step, setStep] = useState<1 | 2>(1);
  const [stage, setStage] = useState(0);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontFileError, setFrontFileError] = useState<string | null>(null);
  const [backFileError, setBackFileError] = useState<string | null>(null);
  const [failure, setFailure] = useState<{ reason: string; body: string } | null>(null);
  const [submittedKyc, setSubmittedKyc] = useState<CustomerKycData | null>(null);

  const addressForm = useForm<ResidentialAddressFormValues>({
    resolver: zodResolver(residentialAddressFormSchema),
    defaultValues: {
      addressLine: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Nigeria",
    },
  });

  const identityForm = useForm<IdentityDocumentFormValues>({
    resolver: zodResolver(identityDocumentFormSchema),
    defaultValues: {
      documentUiType: undefined,
      documentNumber: "",
    },
  });

  const selectedDocId = identityForm.watch("documentUiType");
  const doc = DOCS.find((d) => d.id === selectedDocId);

  const existing = kycQuery.data?.data;
  const latest = useMemo(
    () => latestDocument(submittedKyc ?? existing),
    [existing, submittedKyc],
  );

  useEffect(() => {
    if (!kycQuery.isSuccess) return;
    const data = kycQuery.data?.data;
    if (!data) return;
    if (data.doneKyc) {
      setStoredDoneKyc(true);
    }
    if (!needsKyc(data) && !canResubmitKyc(data)) {
      navigate("/dashboard", { replace: true });
    }
  }, [kycQuery.isSuccess, kycQuery.data, navigate]);

  const onAddressContinue = addressForm.handleSubmit(async (values) => {
    if (!isAuthenticated() || !user?.id) {
      toast.error("Your session expired. Please log in again.");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const res = await addressMutation.mutateAsync(toDeliveryAddressPayload(values));
      if (res.success === false) {
        toast.error(res.message || "Could not save your address.");
        return;
      }
      setStep(2);
    } catch {
      /* mutation onError already toasts */
    }
  });

  const fileIssue = (file: File | null, side: "front" | "back") => {
    const missing =
      side === "front"
        ? "Upload a clear photo or scan of the front of your document."
        : "Upload a clear photo or scan of the back of your document.";
    if (!file) return missing;
    if (file.size > MAX_FILE_BYTES) {
      return "That file is too large. Maximum size is 5MB.";
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    const okType =
      ACCEPTED_TYPES.has(file.type) ||
      ext === "pdf" ||
      ext === "jpg" ||
      ext === "jpeg" ||
      ext === "png";
    if (!okType) return "Use PDF, JPG or PNG.";
    return null;
  };

  const uploadDocumentSide = async (file: File) => {
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const uploadRes = await uploadMutation.mutateAsync({
      file,
      category: isPdf ? "DOCUMENT" : "IMAGE",
      usageType: "DOCUMENT",
    });
    if (uploadRes.success === false || !uploadRes.data?.fileUrl) {
      throw new Error(uploadRes.message || "Could not upload your document.");
    }
    return uploadRes.data.fileUrl;
  };

  const submitIdentity = identityForm.handleSubmit(async (values) => {
    const frontIssue = fileIssue(frontFile, "front");
    const backIssue = fileIssue(backFile, "back");
    setFrontFileError(frontIssue);
    setBackFileError(backIssue);
    if (frontIssue || backIssue) return;

    if (!getAccessToken()) {
      toast.error("Your session expired. Please log in again.");
      navigate("/login", { replace: true });
      return;
    }

    setFailure(null);
    setView("progress");
    setStage(0);

    try {
      setStage(1);
      const frontViewUrl = await uploadDocumentSide(frontFile!);
      setStage(2);
      const backViewUrl = await uploadDocumentSide(backFile!);
      setStage(3);

      const kycRes = await submitKycMutation.mutateAsync({
        documentType: toKycDocumentType(values.documentUiType as KycDocumentUiType),
        documentNumber: values.documentNumber.replace(/\s/g, ""),
        frontViewUrl,
        backViewUrl,
      });

      if (kycRes.success === false || !kycRes.data) {
        throw new Error(kycRes.message || "Could not submit identity verification.");
      }

      setSubmittedKyc(kycRes.data);
      setView("success");
      toast.success(kycRes.message || "KYC document submitted successfully for review");
    } catch (error) {
      setFailure({
        reason: "Verification failed",
        body: normalizeError(error),
      });
      setView("failed");
    }
  });

  let body: ReactNode;

  if (view === "form") {
    body = (
      <>
        <div className="head anim-in anim-in-1">
          <h1 className="h1">Complete your identity verification</h1>
          <p className="sub">
            Verify your identity to unlock full platform access and enjoy a safer ECharis
            experience.
          </p>
        </div>
        <div className="wiz anim-in anim-in-2">
          {(
            [
              ["map-pin", "Residential address"],
              ["shield-check", "Identity document"],
            ] as const
          ).map(([ic, label], i) => (
            <div className="wiz-s" key={label} data-on={step >= i + 1 ? "1" : "0"}>
              <i></i>
              <div className="wiz-l">
                <Icon name={step > i + 1 ? "check" : ic} size={14} />
                {label}
              </div>
            </div>
          ))}
        </div>
        <Card padding={28} className="kyc-card anim-in anim-in-3">
          {step === 1 ? (
            <form
              onSubmit={onAddressContinue}
              style={{ display: "flex", flexDirection: "column", gap: 24 }}
            >
              <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <SectionHead
                  title="Residential address"
                  sub="Use the address on your utility bill or bank record. This is saved as your delivery address for identity verification, product delivery and logistics."
                />
                <FormField
                  label="Address line 1"
                  htmlFor="line1"
                  error={addressForm.formState.errors.addressLine?.message}
                >
                  <Input
                    id="line1"
                    autoComplete="address-line1"
                    iconLeft="map-pin"
                    placeholder="e.g. 14 Ajose Adeogun Street"
                    invalid={!!addressForm.formState.errors.addressLine}
                    {...addressForm.register("addressLine")}
                  />
                </FormField>
                <FormField label="Address line 2" htmlFor="line2" optional>
                  <Input
                    id="line2"
                    autoComplete="address-line2"
                    placeholder="e.g. Apartment 4B, Ocean View Court"
                    {...addressForm.register("addressLine2")}
                  />
                </FormField>
                <div className="grid2">
                  <FormField
                    label="City"
                    htmlFor="city"
                    error={addressForm.formState.errors.city?.message}
                  >
                    <Input
                      id="city"
                      autoComplete="address-level2"
                      placeholder="Enter your city"
                      invalid={!!addressForm.formState.errors.city}
                      {...addressForm.register("city")}
                    />
                  </FormField>
                  <FormField
                    label="State"
                    htmlFor="state"
                    error={addressForm.formState.errors.state?.message}
                  >
                    <Controller
                      control={addressForm.control}
                      name="state"
                      render={({ field }) => (
                        <Select
                          id="state"
                          placeholder="Select your state"
                          options={STATES}
                          invalid={!!addressForm.formState.errors.state}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </FormField>
                </div>
                <div className="grid2">
                  <FormField label="Postal / ZIP code" htmlFor="zip" optional>
                    <Input
                      id="zip"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      placeholder="e.g. 101241"
                      {...addressForm.register("postalCode")}
                    />
                  </FormField>
                  <FormField
                    label="Country"
                    htmlFor="country"
                    error={addressForm.formState.errors.country?.message}
                  >
                    <Controller
                      control={addressForm.control}
                      name="country"
                      render={({ field }) => (
                        <Select
                          id="country"
                          options={COUNTRIES}
                          invalid={!!addressForm.formState.errors.country}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </FormField>
                </div>
              </section>
              <Button
                type="submit"
                fullWidth
                size="lg"
                iconRight="arrow-right"
                loading={addressMutation.isPending}
              >
                Continue to identity document
              </Button>
            </form>
          ) : (
            <form
              onSubmit={submitIdentity}
              style={{ display: "flex", flexDirection: "column", gap: 24 }}
            >
              <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <SectionHead
                  title="Identity document"
                  sub="Choose one document. The details must match the name on your client account."
                />
                <FormField error={identityForm.formState.errors.documentUiType?.message}>
                  <div className="docs" role="radiogroup" aria-label="Identity document">
                    {DOCS.map((d) => (
                      <label
                        className="doc"
                        key={d.id}
                        data-on={selectedDocId === d.id ? "1" : "0"}
                        data-err={
                          identityForm.formState.errors.documentUiType ? "1" : "0"
                        }
                      >
                        <Radio
                          name="doc"
                          value={d.id}
                          checked={selectedDocId === d.id}
                          onChange={() => {
                            identityForm.setValue("documentUiType", d.id, {
                              shouldValidate: true,
                            });
                            identityForm.setValue("documentNumber", "");
                            identityForm.clearErrors("documentNumber");
                            setFrontFile(null);
                            setBackFile(null);
                            setFrontFileError(null);
                            setBackFileError(null);
                          }}
                          label={d.label}
                          description={d.desc}
                          style={{ flex: 1 }}
                        />
                        <Icon
                          name={d.icon}
                          size={20}
                          style={{
                            color:
                              selectedDocId === d.id
                                ? "var(--text-brand)"
                                : "var(--text-muted)",
                            flex: "none",
                            marginTop: 1,
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </FormField>

                {doc && (
                  <>
                    <FormField
                      label={doc.field}
                      htmlFor="num"
                      error={identityForm.formState.errors.documentNumber?.message}
                      hint={
                        !identityForm.formState.errors.documentNumber
                          ? doc.hint
                          : undefined
                      }
                    >
                      <Input
                        id="num"
                        inputMode={doc.id === "nin" ? "numeric" : "text"}
                        placeholder={doc.placeholder}
                        invalid={!!identityForm.formState.errors.documentNumber}
                        style={{ fontFamily: "var(--font-mono)" }}
                        {...identityForm.register("documentNumber")}
                      />
                    </FormField>
                    <FormField
                      label="Front of document"
                      error={frontFileError ?? undefined}
                    >
                      <FileUpload
                        label="Upload front view"
                        hint="Supported formats: PDF, JPG, PNG · Maximum size: 5MB"
                        accept=".pdf,.jpg,.jpeg,.png"
                        fileName={frontFile?.name}
                        invalid={!!frontFileError}
                        onFileChange={(file) => {
                          const next = file ?? null;
                          setFrontFile(next);
                          setFrontFileError(fileIssue(next, "front"));
                        }}
                      />
                    </FormField>
                    <FormField
                      label="Back of document"
                      error={backFileError ?? undefined}
                    >
                      <FileUpload
                        label="Upload back view"
                        hint="Supported formats: PDF, JPG, PNG · Maximum size: 5MB"
                        accept=".pdf,.jpg,.jpeg,.png"
                        fileName={backFile?.name}
                        invalid={!!backFileError}
                        onFileChange={(file) => {
                          const next = file ?? null;
                          setBackFile(next);
                          setBackFileError(fileIssue(next, "back"));
                        }}
                      />
                    </FormField>
                  </>
                )}
              </section>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  iconLeft="shield-check"
                  loading={uploadMutation.isPending || submitKycMutation.isPending}
                >
                  Verify identity
                </Button>
                <Button
                  type="button"
                  fullWidth
                  size="lg"
                  variant="ghost"
                  iconLeft="arrow-left"
                  onClick={() => setStep(1)}
                >
                  Back to address
                </Button>
              </div>
            </form>
          )}
        </Card>
      </>
    );
  } else if (view === "progress") {
    body = (
      <>
        <div className="head anim-in anim-in-1">
          <span className="micro">Verification in progress</span>
          <h1 className="h1">Verifying your identity</h1>
          <p className="sub">
            Keep this page open. The result appears here automatically and your account
            status updates without further action from you.
          </p>
        </div>
        <StatusCard
          tone="brand"
          icon="spinner"
          title="Verification in progress"
          body="We are verifying your identity. This may take a few moments."
        >
          <ProgressMeter
            value={(stage + 1) * 25}
            label="Processing status"
            valueLabel={`${(stage + 1) * 25}%`}
            style={{ width: "100%" }}
          />
          <div className="steps">
            {PROGRESS.map((s, i) => (
              <div
                className="step"
                key={s}
                data-on={i === stage ? "1" : "0"}
                data-done={i < stage ? "1" : "0"}
              >
                <span className="dot">
                  {i < stage ? <Icon name="check" size={12} /> : null}
                </span>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <div className="kv">
            <KV label="Document">{doc ? doc.label.replace(" (NIN)", "") : "—"}</KV>
            <KV label="Status">Submitting</KV>
          </div>
        </StatusCard>
      </>
    );
  } else if (view === "success") {
    const review = latest?.reviewStatus ?? "PENDING";
    body = (
      <>
        <div className="head anim-in anim-in-1">
          <span className="micro">Verification submitted</span>
          <h1 className="h1">Your identity check is in review</h1>
          <p className="sub">
            Your documents were submitted successfully. You can continue to your dashboard
            while review completes.
          </p>
        </div>
        <StatusCard
          tone="success"
          icon="circle-check"
          title="Identity submitted"
          body="Your identity document was submitted successfully for review."
        >
          <div className="kv">
            <KV label="Document">
              {documentLabel(latest?.documentType) ||
                (doc ? doc.label.replace(" (NIN)", "") : "—")}
            </KV>
            <KV label="Status">
              <Badge
                tone={review === "APPROVED" ? "success" : "warning"}
                icon={review === "APPROVED" ? "check" : "clock"}
              >
                {review === "APPROVED" ? "Verified" : "Pending review"}
              </Badge>
            </KV>
            <KV label="Submitted on">
              {latest?.submittedAt
                ? new Date(latest.submittedAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : new Date().toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
            </KV>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: "100%",
            }}
          >
            <Button
              fullWidth
              size="lg"
              iconRight="arrow-right"
              onClick={() => navigate("/dashboard", { replace: true })}
            >
              Continue to dashboard
            </Button>
          </div>
        </StatusCard>
      </>
    );
  } else {
    body = (
      <>
        <div className="head anim-in anim-in-1">
          <span className="micro">Verification unsuccessful</span>
          <h1 className="h1">We could not verify your identity</h1>
          <p className="sub">
            Nothing has changed on your account. Review your details and try again.
          </p>
        </div>
        <StatusCard
          tone="danger"
          icon="circle-alert"
          title="Verification failed"
          body={failure?.body || "Please review your details and try again."}
        >
          <div className="kv">
            <KV label="Reason">{failure?.reason || "—"}</KV>
            <KV label="Attempted">
              {new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </KV>
            <KV label="Document">{doc ? doc.label.replace(" (NIN)", "") : "—"}</KV>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: "100%",
            }}
          >
            <Button
              fullWidth
              size="lg"
              iconLeft="refresh-cw"
              onClick={() => {
                setView("form");
                setStep(2);
              }}
            >
              Retry verification
            </Button>
            <Button
              fullWidth
              size="lg"
              variant="secondary"
              onClick={() => {
                setStep(2);
                setView("form");
              }}
            >
              Edit my details
            </Button>
            <Button
              fullWidth
              size="lg"
              variant="ghost"
              iconLeft="life-buoy"
              onClick={() => navigate("/contact")}
            >
              Contact support
            </Button>
          </div>
        </StatusCard>
      </>
    );
  }

  if (kycQuery.isLoading) {
    return (
      <div className="page kyc">
        <header className="bar">
          <Logo height={24} src={logoOrange} />
        </header>
        <div className="wrap">
          <div
            className="kyc-card"
            aria-busy="true"
            aria-label="Loading verification status"
            style={{
              padding: 28,
              display: "flex",
              flexDirection: "column",
              gap: 20,
              width: "100%",
              minWidth: 0,
            }}
          >
            <Skeleton className="size-[52px] rounded-full" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Skeleton className="h-7 w-[min(100%,280px)]" />
              <Skeleton className="h-4 w-full max-w-[420px]" />
              <Skeleton className="h-4 w-[80%] max-w-[340px]" />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}
            >
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page kyc">
      <header className="bar">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <Logo height={24} src={logoOrange} />
        </a>
      </header>
      <div className="wrap">{body}</div>
    </div>
  );
}

export default function Verify() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: "/verify" }} />;
  }

  return (
    <UserProtectedRoute>
      <VerifyContent />
    </UserProtectedRoute>
  );
}
