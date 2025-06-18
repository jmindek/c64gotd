import './globals.css';

export const metadata = {
  title: 'C64 Game of the Day',
  description: 'Play a different Commodore 64 game every day!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white min-h-screen">
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
