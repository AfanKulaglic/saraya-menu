import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Saraya - Digital Menu",
  description: "Browse our menu, customize your order, and send it straight to the kitchen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-dark antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="max-w-md md:max-w-3xl lg:max-w-6xl xl:max-w-7xl mx-auto min-h-screen bg-white relative shadow-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
