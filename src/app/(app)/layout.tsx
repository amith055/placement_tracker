import "../globals.css";
import { Inter } from "next/font/google";

// ✅ Load Inter font properly (no Turbopack error)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Placement Tracker",
  description: "AI-based Interview Test Analytics and Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* ✅ Apply font safely */}
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
