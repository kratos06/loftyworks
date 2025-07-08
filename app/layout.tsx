import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider, Navigation } from "../components";
import ErrorBoundary from "../components/ErrorBoundary";

export const metadata: Metadata = {
  title: "LoftyWorks",
  description: "Property Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
