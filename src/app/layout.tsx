import type { Metadata } from "next";
import { KeyboardShortcutsLayer } from "../hooks/useKeyboardShortcutsLayer";
import "./globals.css";

export const metadata: Metadata = {
  title: "খতিয়ান ক্যালকুলেটর",
  description: "একটি বাংলা খতিয়ান খুঁজে বের করার সহজ ক্যালকুলেটর",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("khatiyan-theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark;"}document.documentElement.classList.toggle("dark",t==="dark");document.documentElement.style.colorScheme=t;}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <KeyboardShortcutsLayer />
        {children}
      </body>
    </html>
  );
}
