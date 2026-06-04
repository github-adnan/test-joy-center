import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, X, Share2, Home, RotateCw } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { MerchantAvatar } from "@/components/MerchantAvatar";
import { useSettings, getDraft, FAILURE_REASONS } from "@/lib/payment-store";

export const Route = createFileRoute("/result")({
  head: () => ({ meta: [{ title: "Payment Result — PPay" }] }),
  component: ResultPage,
});

function ResultPage() {
  const settings = useSettings();
  const draft = typeof window !== "undefined" ? getDraft() : { amount: 0, merchantName: "", merchantUpi: "", merchantImage: "", note: "" } as any;
  const success = settings.outcome === "success";
  const reason = FAILURE_REASONS.find((r) => r.id === settings.failureReason)!;
  const txnId = "T" + Math.floor(Math.random() * 1e12).toString();
  const time = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <PhoneShell variant="transparent">
      <div className={`${success ? "success-gradient" : "fail-gradient"} text-white px-6 pt-12 pb-16 rounded-b-3xl text-center`}>
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 14 }}
          className="size-20 rounded-full bg-white/25 mx-auto grid place-items-center"
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 260 }}
            className="size-14 rounded-full bg-white grid place-items-center"
          >
            {success ? (
              <Check className="size-8 text-success" strokeWidth={3} />
            ) : (
              <X className="size-8 text-destructive" strokeWidth={3} />
            )}
          </motion.div>
        </motion.div>
        <p className="mt-4 text-lg font-semibold">{success ? "Payment Successful" : "Payment Failed"}</p>
        <p className="text-3xl font-bold mt-1">₹{Number(draft.amount || 0).toLocaleString("en-IN")}</p>
        <p className="text-xs text-white/85 mt-1">{time}</p>
        {!success && (
          <p className="mt-3 text-sm bg-white/15 inline-block px-3 py-1.5 rounded-full">
            {reason.detail}
          </p>
        )}
      </div>

      <motion.div
        initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="mx-5 -mt-8 bg-card rounded-2xl shadow-lg border border-border p-5"
      >
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <MerchantAvatar name={draft.merchantName || settings.merchantName} image={draft.merchantImage || settings.merchantImage} size={48} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Paid to</p>
            <p className="font-semibold truncate">{draft.merchantName || settings.merchantName}</p>
            <p className="text-xs text-muted-foreground truncate">{draft.merchantUpi || settings.merchantUpi}</p>
          </div>
        </div>
        <Row label="From" value={`${settings.userBank} ${settings.userAccountMasked}`} />
        {draft.note && <Row label="Note" value={draft.note} />}
        <Row label="Transaction ID" value={txnId} mono />
        <Row label="Status" value={success ? "Completed" : reason.label} statusColor={success ? "text-success" : "text-destructive"} />
      </motion.div>

      <div className="px-5 mt-6 grid grid-cols-3 gap-3">
        <ActionTile icon={Share2} label="Share" />
        <Link to="/pay" className="contents">
          <ActionTile icon={RotateCw} label={success ? "Pay Again" : "Retry"} />
        </Link>
        <Link to="/" className="contents">
          <ActionTile icon={Home} label="Home" />
        </Link>
      </div>

      <Link
        to="/settings"
        className="mx-5 mt-6 mb-10 block text-center text-xs text-muted-foreground"
      >
        Adjust outcome in Settings →
      </Link>
    </PhoneShell>
  );
}

function Row({ label, value, mono, statusColor }: { label: string; value: string; mono?: boolean; statusColor?: string }) {
  return (
    <div className="flex justify-between gap-3 text-sm py-2.5 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium text-right ${mono ? "font-mono text-xs" : ""} ${statusColor ?? ""}`}>{value}</span>
    </div>
  );
}

function ActionTile({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-card border border-border active:scale-95 transition w-full">
      <Icon className="size-5 text-brand" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
