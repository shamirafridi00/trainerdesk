import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            TrainerDesk
          </h1>
          <p className="text-gray-600">Manage your training business</p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">{children}</div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-8">
          &copy; 2025 TrainerDesk. All rights reserved.
        </p>
      </div>
    </div>
  );
}
