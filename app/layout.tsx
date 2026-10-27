import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PitchToPicture — Turn your song into cinema",
  description:
    "Discover five movies that capture the emotional world of your song.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
