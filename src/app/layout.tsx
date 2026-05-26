import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/layout/header";
import { AppFooter } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI 서비스 포털 | AX TF",
  description: "유통사 전사 AX TF가 운영하는 사내 AI 교육 및 협업 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${notoSansKR.variable} h-full`}
    >
      <body
        className="min-h-full flex flex-col"
        style={{
          background: "#F5F7FA",
          fontFamily:
            'var(--font-noto-sans-kr), var(--font-inter), system-ui, sans-serif',
          color: "#0F1E33",
        }}
      >
        <AppHeader />
        <div style={{ flex: 1 }}>{children}</div>
        <AppFooter />
        <Toaster />
      </body>
    </html>
  );
}
