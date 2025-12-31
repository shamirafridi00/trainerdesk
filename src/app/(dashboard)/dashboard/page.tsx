import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome, {session.user.name}!</h1>
      <p className="text-gray-600">
        Your dashboard is under construction. This is iteration 1.3.
      </p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Session Info:</h2>
        <pre className="text-sm">{JSON.stringify(session, null, 2)}</pre>
      </div>
    </div>
  );
}
