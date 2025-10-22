import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "খতিয়ান হিসাব",
  description: "জমির মালিকানা ও বন্টন হিসাব",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
