export default function DebugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
          {children}
        </main>
      </body>
    </html>
  );
}
