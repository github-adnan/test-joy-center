import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Delete, Lock } from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { getDraft, useSettings } from "@/lib/payment-store";

export const Route = createFileRoute("/pin")({
  head: () => ({ meta: [{ title: "Enter UPI PIN — PPay" }] }),
  component: PinPage,
});

function PinPage() {
  const nav = useNavigate();
  const settings = useSettings();
  const draft = typeof window !== "undefined" ? getDraft() : { amount: 0, merchantName: "", merchantUpi: "" } as any;
  const [pin, setPin] = useState("");
  const LEN = 4;

  const press = (d: string) => {
    if (pin.length >= LEN) return;
    const next = pin + d;
    setPin(next);
    if (next.length === LEN) {
      setTimeout(() => nav({ to: "/processing" }), 220);
    }
  };
  const back = () => setPin((p) => p.slice(0, -1));

  return (
    <PhoneShell variant="plain">
      <div className="flex flex-col h-screen bg-card">
        <div className="px-5 pt-5 pb-4 flex items-center gap-2 border-b border-border">
          <Lock className="size-4 text-brand" />
          <span className="text-sm font-semibold">{settings.userBank}</span>
          <span className="ml-auto text-xs text-muted-foreground">{settings.userAccountMasked}</span>
        </div>

        <div className="px-5 py-4 text-center">
          <p className="text-xs text-muted-foreground">Paying</p>
          <p className="font-semibold mt-0.5">{draft.merchantName || settings.merchantName}</p>
          <p className="text-2xl font-bold mt-1">₹{draft.amount?.toLocaleString("en-IN") || 0}</p>
        </div>

        <div className="px-5 mt-2">
          <p className="text-center text-sm font-medium">Enter 4-digit UPI PIN</p>
          <div className="flex justify-center gap-3 mt-4">
            {Array.from({ length: LEN }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ scale: pin.length === i + 1 ? 1.15 : 1 }}
                className={`size-12 rounded-xl border-2 grid place-items-center text-xl font-bold ${
                  pin.length > i ? "border-brand bg-brand-soft" : "border-border"
                }`}
              >
                {pin[i] ? "•" : ""}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-auto bg-muted/40 px-2 py-4 grid grid-cols-3 gap-1">
          {["1","2","3","4","5","6","7","8","9","",  "0", "del"].map((k, idx) => {
            if (k === "") return <div key={idx} />;
            if (k === "del") {
              return (
                <button
                  key={idx}
                  onClick={back}
                  className="h-14 rounded-xl grid place-items-center active:bg-card transition"
                >
                  <Delete className="size-5" />
                </button>
              );
            }
            return (
              <button
                key={idx}
                onClick={() => press(k)}
                className="h-14 rounded-xl text-2xl font-semibold active:bg-card transition"
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>
    </PhoneShell>
  );
}
