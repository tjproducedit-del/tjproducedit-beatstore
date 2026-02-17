import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "VOIDBEATS | Premium Beats & Instrumentals",
  description:
    "Shop exclusive beats, instrumentals, and productions. Instant delivery with license.",
  keywords: ["beats", "instrumentals", "hip hop", "trap", "R&B", "producer"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen noise">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#131316",
              color: "#e5e5e5",
              border: "1px solid #232329",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#c8ff00", secondary: "#0a0a0b" },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
