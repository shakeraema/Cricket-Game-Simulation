import  { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cricket Match Simulator",
  description: "Simulate exciting cricket matches and track scores in real-time.",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: "16px", borderBottom: "1px solid #ddd" }}>
          <h2>🏏 Cricket Simulation</h2>
        </header>

        <main style={{ maxWidth: "900px", margin: "0 auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
