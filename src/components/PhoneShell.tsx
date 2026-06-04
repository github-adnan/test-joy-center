import { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Settings } from "lucide-react";

interface PhoneShellProps {
  children: ReactNode;
  title?: string;
  back?: string;
  showSettings?: boolean;
  variant?: "brand" | "plain" | "transparent";
}

export function PhoneShell({ children, title, back, showSettings, variant = "plain" }: PhoneShellProps) {
  const headerBg =
    variant === "brand"
      ? "brand-gradient text-brand-foreground"
      : variant === "transparent"
      ? "bg-transparent text-foreground"
      : "bg-card text-foreground border-b border-border";

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-full max-w-md flex flex-col relative">
        {(title || back || showSettings) && (
          <header className={`${headerBg} px-4 pt-5 pb-4 flex items-center gap-3 sticky top-0 z-30`}>
            {back ? (
              <Link
                to={back}
                className="size-9 grid place-items-center rounded-full hover:bg-white/15 transition"
                aria-label="Back"
              >
                <ArrowLeft className="size-5" />
              </Link>
            ) : (
              <div className="size-9" />
            )}
            <h1 className="flex-1 font-semibold text-base truncate">{title}</h1>
            {showSettings && (
              <Link
                to="/settings"
                className="size-9 grid place-items-center rounded-full hover:bg-white/15 transition"
                aria-label="Settings"
              >
                <Settings className="size-5" />
              </Link>
            )}
          </header>
        )}
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </div>
  );
}
