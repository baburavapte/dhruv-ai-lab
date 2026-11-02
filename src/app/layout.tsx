import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dhruv Sukhadiya | AI Engineer — Portfolio",
  description:
    "AI Engineer specializing in Generative AI, Computer Vision, and Full Stack development. Explore projects, skills, and an immersive 3D experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cinzel.variable} ${inter.variable}`}>
      <body className="antialiased selection:bg-[#8c1d30] selection:text-[#eae4d9]">
        {children}
      </body>
    </html>
  );
}
