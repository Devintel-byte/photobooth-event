import { Outfit } from "next/font/google";
import "./globals.css";

import { COMPANY_INFO } from "../_mock/company"
import { EdgeStoreProvider } from "@/lib/edgestore";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: `${COMPANY_INFO.name} - AI Photo Booth`,
  description: `AI Photo Booth developed by ${COMPANY_INFO.name}`,
};

export default function RootLayout({ children } : { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
    <head>
      <link rel="icon" href="/favicon.ico" />
    </head>
      <body className={outfit.className}>
        <EdgeStoreProvider>
        {children}
        </EdgeStoreProvider>
        </body>
    </html>
  );
}
