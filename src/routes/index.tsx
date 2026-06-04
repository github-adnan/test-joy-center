import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Send, Wallet, Smartphone, Zap, CreditCard, Building2,
  Receipt, Tv, Plane, ShieldCheck, ChevronRight, Settings as SettingsIcon, Search, QrCode, Bell,
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { MerchantAvatar } from "@/components/MerchantAvatar";
import { useSettings, setDraft } from "@/lib/payment-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PPay — Payment Testing Sandbox" },
      { name: "description", content: "A mobile-first payment flow sandbox for testing success and failure scenarios." },
    ],
  }),
  component: Home,
});

const actions = [
  { icon: Smartphone, label: "Mobile" },
  { icon: Zap, label: "Electricity" },
  { icon: Tv, label: "DTH" },
  { icon: CreditCard, label: "Credit Card" },
  { icon: Receipt, label: "Rent" },
  { icon: Plane, label: "Travel" },
  { icon: Building2, label: "Loan" },
  { icon: ShieldCheck, label: "Insurance" },
];

const recents = [
  { name: "Cafe Mocha", upi: "cafemocha@ybl" },
  { name: "Ola Cabs", upi: "ola@paytm" },
  { name: "Mira Patel", upi: "mira@okhdfc" },
  { name: "Blinkit", upi: "blinkit@ybl" },
];

function Home() {
  const settings = useSettings();
  return (
    <PhoneShell variant="transparent">
      <div className="brand-gradient text-brand-foreground px-5 pt-6 pb-10 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-white/20 grid place-items-center font-semibold">
              {settings.userName.split(" ").map(n => n[0]).join("").slice(0,2)}
            </div>
            <div>
              <p className="text-xs text-white/75">Welcome back</p>
              <p className="font-semibold leading-tight">{settings.userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="size-10 rounded-full bg-white/15 grid place-items-center" aria-label="Notifications">
              <Bell className="size-5" />
            </button>
            <Link to="/settings" className="size-10 rounded-full bg-white/15 grid place-items-center" aria-label="Settings">
              <SettingsIcon className="size-5" />
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 bg-white/15 rounded-full px-4 py-2.5 backdrop-blur">
          <Search className="size-4 opacity-80" />
          <input
            placeholder="Pay by name, phone or UPI ID"
            className="bg-transparent outline-none flex-1 text-sm placeholder:text-white/70"
          />
          <QrCode className="size-5 opacity-90" />
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3">
          {[
            { icon: Send, label: "To Mobile", to: "/pay" as const },
            { icon: Wallet, label: "To Bank", to: "/pay" as const },
            { icon: QrCode, label: "Scan QR", to: "/pay" as const },
            { icon: CreditCard, label: "Self", to: "/pay" as const },
          ].map((a) => (
            <Link
              to={a.to}
              key={a.label}
              onClick={() => setDraft({ merchantName: "", merchantUpi: "", merchantImage: "" })}
              className="flex flex-col items-center gap-2"
            >
              <div className="size-14 rounded-2xl bg-white/15 grid place-items-center backdrop-blur active:scale-95 transition">
                <a.icon className="size-6" />
              </div>
              <span className="text-[11px] font-medium text-white/90 text-center leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <section className="px-5 -mt-4">
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-card rounded-2xl shadow-sm border border-border p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Recharge & Pay Bills</h2>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-4 gap-y-4">
            {actions.map((a) => (
              <button key={a.label} className="flex flex-col items-center gap-1.5 active:scale-95 transition">
                <div className="size-11 rounded-xl bg-brand-soft text-brand grid place-items-center">
                  <a.icon className="size-5" />
                </div>
                <span className="text-[10.5px] text-muted-foreground text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="px-5 mt-6 pb-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-sm">People & Businesses</h2>
          <span className="text-xs text-brand font-medium">See all</span>
        </div>
        <div className="space-y-1">
          {recents.map((r) => (
            <Link
              key={r.upi}
              to="/pay"
              onClick={() => setDraft({ merchantName: r.name, merchantUpi: r.upi, merchantImage: "" })}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition"
            >
              <MerchantAvatar name={r.name} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground truncate">{r.upi}</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <Link
          to="/settings"
          className="mt-6 block text-center text-xs text-muted-foreground"
        >
          Tap the gear icon to configure test outcomes
        </Link>
      </section>
    </PhoneShell>
  );
}
