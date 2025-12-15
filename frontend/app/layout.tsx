import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Authentication with Json Web Token",
  description: "Developed with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
}
