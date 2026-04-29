import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-jakarta"
});

export const metadata: Metadata = {
  title: "Nuvyu | AI Coach",
  description: "Your personalized behavioral transformation OS.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0", // Mobile native feel
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
