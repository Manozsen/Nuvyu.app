import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Google Fonts setup
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  variable: "--font-jakarta" 
});

export const metadata: Metadata = {
  title: "Nuvyu | Your AI Coach",
  description: "Behavioral transformation powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased bg-[#000] text-white font-jakarta`}
      >
        {children}
      </body>
    </html>
  );
}
