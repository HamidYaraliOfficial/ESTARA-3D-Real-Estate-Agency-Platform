import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ESTARA",
  description: "A 3D real estate agency platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
