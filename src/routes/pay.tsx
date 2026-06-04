import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PhoneShell } from "@/components/PhoneShell";
import { MerchantAvatar } from "@/components/MerchantAvatar";
import { Button } from "@/components/ui/button";
import { useSettings, setDraft, getDraft } from "@/lib/payment-store";

export const Route = createFileRoute("/pay")({
  head: () => ({ meta: [{ title: "Send Money — PPay" }] }),
  component: PayPage,
});

function PayPage() {
  const settings = useSettings();
  const nav = useNavigate();
  const existing = typeof window !== "undefined" ? getDraft() : { merchantName: "", merchantUpi: "", merchantImage: "" } as any;
  const [merchant, setMerchant] = useState(existing.merchantName || settings.merchantName);
  const [upi, setUpi] = useState(existing.merchantUpi || settings.merchantUpi);
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!existing.merchantName) {
      setMerchant(settings.merchantName);
      setUpi(settings.merchantUpi);
    }
  }, [settings.merchantName, settings.merchantUpi]);

  const image = existing.merchantImage || settings.merchantImage;

  const handleContinue = () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    setDraft({ amount: amt, note, merchantName: merchant, merchantUpi: upi, merchantImage: image });
    nav({ to: "/pin" });
  };

  const quick = [100, 500, 1000, 2000];

  return (
    <PhoneShell title="Payment" back="/" variant="brand" showSettings>
      <div className="flex flex-col items-center pt-8 pb-6 brand-gradient text-brand-foreground -mt-px">
        <MerchantAvatar name={merchant} image={image} size={72} className="ring-4 ring-white/25" />
        <p className="mt-3 font-semibold">{merchant}</p>
        <p className="text-xs text-white/80">{upi}</p>
      </div>

      <div className="px-5 -mt-4">
        <motion.div
          initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-5"
        >
          <label className="text-xs text-muted-foreground font-medium">Enter amount</label>
          <div className="mt-2 flex items-baseline gap-1 border-b border-border pb-3">
            <span className="text-3xl font-semibold text-foreground">₹</span>
            <input
              autoFocus
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              className="flex-1 bg-transparent outline-none text-4xl font-semibold tracking-tight placeholder:text-muted-foreground/40"
            />
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {quick.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className="px-3 py-1.5 rounded-full bg-brand-soft text-brand text-xs font-medium hover:bg-brand-soft/80"
              >
                + ₹{q}
              </button>
            ))}
          </div>

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            className="mt-5 w-full text-sm bg-muted/60 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
          />
        </motion.div>

        <div className="mt-4 bg-card border border-border rounded-2xl p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Debit from</span>
            <span className="font-medium">{settings.userBank} {settings.userAccountMasked}</span>
          </div>
        </div>

        <Button
          onClick={handleContinue}
          disabled={!Number(amount)}
          className="w-full mt-6 h-12 text-base rounded-2xl bg-brand hover:bg-brand/90 text-brand-foreground"
        >
          Proceed to Pay {amount ? `₹${amount}` : ""}
        </Button>
      </div>
    </PhoneShell>
  );
}
