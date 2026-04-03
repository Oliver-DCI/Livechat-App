import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper"; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}