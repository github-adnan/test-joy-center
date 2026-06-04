import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { PhoneShell } from "@/components/PhoneShell";
import { useSettings } from "@/lib/payment-store";

export const Route = createFileRoute("/processing")({
  head: () => ({ meta: [{ title: "Processing — PPay" }] }),
  component: ProcessingPage,
});

function ProcessingPage() {
  const nav = useNavigate();
  const settings = useSettings();
  useEffect(() => {
    const t = setTimeout(() => nav({ to: "/result" }), settings.processingDelayMs);
    return () => clearTimeout(t);
  }, [nav, settings.processingDelayMs]);

  return (
    <PhoneShell variant="transparent">
      <div className="flex-1 grid place-items-center px-6">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="size-20 rounded-full border-4 border-brand-soft border-t-brand mx-auto"
          />
          <p className="mt-6 font-semibold">Processing payment</p>
          <p className="text-sm text-muted-foreground mt-1">Please wait, do not close the app</p>
        </div>
      </div>
    </PhoneShell>
  );
}
