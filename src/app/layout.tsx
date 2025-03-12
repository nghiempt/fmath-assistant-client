import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';
import { Toaster } from "@/components/ui/toaster"

const font = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FMATH ASSISTANT",
  description: "",
  openGraph: {
    title: "FMATH ASSISTANT",
    description: "",
    url: "https://fmath.edu.vn",
    images: [
      {
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE81m_cSZVahfLCxpBiumFDl6We1qPbDJXlg&s",
        width: 1200,
        height: 630,
        alt: "FMATH ASSISTANT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FMATH ASSISTANT",
    description: "",
    images: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE81m_cSZVahfLCxpBiumFDl6We1qPbDJXlg&s"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className} suppressHydrationWarning={true}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
