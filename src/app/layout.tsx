import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Volley Stats MVP",
  description: "Phase0 manual tagging for volleyball video stats"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-ink text-white flex items-center justify-center font-semibold">
                  VS
                </div>
                <div>
                  <p className="text-lg font-semibold">Volley Stats</p>
                  <p className="text-xs text-slate-500">Phase0: 手動/半自動スタッツ</p>
                </div>
              </div>
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/teams" className="hover:text-accent">Teams</Link>
                <Link href="/dashboard" className="hover:text-accent">Dashboard</Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
