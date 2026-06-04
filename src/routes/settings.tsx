import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { CheckCircle2, XCircle, Upload, RotateCcw, Trash2 } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { MerchantAvatar } from "@/components/MerchantAvatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useSettings, setSettings, resetSettings, FAILURE_REASONS, FailureReason } from "@/lib/payment-store";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Test Settings — PPay" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const s = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSettings({ merchantImage: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <PhoneShell title="Test Settings" back="/" variant="brand">
      <div className="px-5 py-5 space-y-5">
        {/* Outcome */}
        <Section title="Payment Outcome" subtitle="Choose what happens after the PIN screen">
          <div className="grid grid-cols-2 gap-3">
            <OutcomeCard
              active={s.outcome === "success"}
              onClick={() => setSettings({ outcome: "success" })}
              icon={<CheckCircle2 className="size-5" />}
              label="Successful"
              tone="success"
            />
            <OutcomeCard
              active={s.outcome === "failure"}
              onClick={() => setSettings({ outcome: "failure" })}
              icon={<XCircle className="size-5" />}
              label="Failed"
              tone="fail"
            />
          </div>
        </Section>

        {/* Failure reasons */}
        {s.outcome === "failure" && (
          <Section title="Failure Reason" subtitle="Toggle which reason to show on the result screen">
            <div className="space-y-2">
              {FAILURE_REASONS.map((r) => (
                <ReasonRow
                  key={r.id}
                  id={r.id}
                  label={r.label}
                  detail={r.detail}
                  active={s.failureReason === r.id}
                  onChange={(v) => v && setSettings({ failureReason: r.id })}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Merchant */}
        <Section title="Merchant / Payee" subtitle="Edit how the payee appears in the flow">
          <div className="flex items-center gap-4">
            <MerchantAvatar name={s.merchantName} image={s.merchantImage} size={64} />
            <div className="flex-1 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                className="gap-2"
              >
                <Upload className="size-4" /> Upload image
              </Button>
              {s.merchantImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSettings({ merchantImage: "" })}
                  className="gap-2 text-destructive"
                >
                  <Trash2 className="size-4" /> Remove image
                </Button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleUpload(e.target.files?.[0])}
              />
            </div>
          </div>

          <Field label="Merchant name" value={s.merchantName} onChange={(v) => setSettings({ merchantName: v })} />
          <Field label="UPI ID" value={s.merchantUpi} onChange={(v) => setSettings({ merchantUpi: v })} mono />
        </Section>

        {/* User */}
        <Section title="Payer Account">
          <Field label="Your name" value={s.userName} onChange={(v) => setSettings({ userName: v })} />
          <Field label="Bank" value={s.userBank} onChange={(v) => setSettings({ userBank: v })} />
          <Field label="Account (masked)" value={s.userAccountMasked} onChange={(v) => setSettings({ userAccountMasked: v })} mono />
        </Section>

        {/* Timing */}
        <Section title="Processing Delay" subtitle={`${(s.processingDelayMs / 1000).toFixed(1)}s before result`}>
          <Slider
            value={[s.processingDelayMs]}
            min={300}
            max={5000}
            step={100}
            onValueChange={([v]) => setSettings({ processingDelayMs: v })}
          />
        </Section>

        <Button
          variant="outline"
          onClick={resetSettings}
          className="w-full gap-2"
        >
          <RotateCcw className="size-4" /> Reset to defaults
        </Button>
      </div>
    </PhoneShell>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div>
        <h2 className="font-semibold text-sm">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function OutcomeCard({
  active, onClick, icon, label, tone,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; tone: "success" | "fail" }) {
  const activeBg = tone === "success" ? "success-gradient" : "fail-gradient";
  return (
    <button
      onClick={onClick}
      className={`rounded-xl p-4 flex flex-col items-center gap-1 border-2 transition ${
        active ? `${activeBg} text-white border-transparent shadow-md` : "border-border bg-card text-muted-foreground hover:border-brand/40"
      }`}
    >
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function ReasonRow({
  id, label, detail, active, onChange,
}: { id: FailureReason; label: string; detail: string; active: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
      active ? "border-brand bg-brand-soft" : "border-border bg-card hover:bg-muted/50"
    }`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
      </div>
      <Switch checked={active} onCheckedChange={onChange} aria-label={`Use ${label}`} id={id} />
    </label>
  );
}

function Field({ label, value, onChange, mono }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full text-sm bg-muted/60 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-ring ${mono ? "font-mono" : ""}`}
      />
    </label>
  );
}
