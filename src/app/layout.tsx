import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SWRProvider } from "@/lib/swr";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BGG Community",
  description: "Black Girls Gather - Member Dashboard",
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#f9f3f3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${plusJakarta.variable} font-sans antialiased bg-stone-50 text-stone-800`}
        >
          <SWRProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </SWRProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
