import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/context/SidebarContext";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import { UserProvider } from "@/context/UserContext";

import DMWidgetWrapper from "@/components/dm/DMWidgetWrapper";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BGG Community",
  description: "Black Girls Gather - Member Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakarta.variable} font-sans antialiased bg-stone-50 text-stone-800`}
      >
        <SidebarProvider>
          <UserProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopNav />
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </div>
            </div>
            <DMWidgetWrapper />
          </UserProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
