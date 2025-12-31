import { Toaster } from 'sonner';
import './globals.css';

export const metadata = {
  title: 'TrainerDesk - Manage Your Training Business',
  description: 'All-in-one platform for fitness trainers to manage bookings, clients, and schedules.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
