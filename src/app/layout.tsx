/* "use-client" */
import type { Metadata } from "next";
import { ChakraProvider } from "@chakra-ui/react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <ChakraProvider> */}{children}{/* </ChakraProvider> */}
      </body>
    </html>
  );
}
