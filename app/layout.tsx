import type { Metadata } from 'next';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/components/theme-provider';

import './globals.css';

import { Plus_Jakarta_Sans } from "next/font/google";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'FMath Assistant',
  description: 'Hệ thống Assistant hỗ trợ học toán thông qua các tài liệu và bài tập.',
  openGraph: {
    title: "FMath Assistant",
    description:
      "Hệ thống Assistant hỗ trợ học toán thông qua các tài liệu và bài tập.",
    url: "https://fmath.edu.vn",
    images: [
      {
        url: "https://www.thoughtco.com/thmb/cl3_jtVnwKDliY69F4e85eob18g=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-939529808-7e57fa6be182490c856eaafd95b95a57.jpg",
        width: 1200,
        height: 630,
        alt: "FMath Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FMath Assistant",
    description:
      "Hệ thống Assistant hỗ trợ học toán thông qua các tài liệu và bài tập.",
    images: [
      "https://www.thoughtco.com/thmb/cl3_jtVnwKDliY69F4e85eob18g=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-939529808-7e57fa6be182490c856eaafd95b95a57.jpg",
    ],
  },
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className={font.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
