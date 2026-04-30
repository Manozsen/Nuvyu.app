import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta"
});

// Next.js 15 Metadata (SEO aur Titles ke liye)
export const metadata: Metadata = {
  title: "Nuvyu | AI Coach",
  description: "Your personalized behavioral transformation OS.",
};

// Next.js 15 Viewport (Mobile UI ko perfect rakhne ke liye)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.variable} font-sans bg-black text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
