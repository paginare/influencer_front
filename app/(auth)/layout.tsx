import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-white p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
      <p className="mt-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Influencer Hub. Todos os direitos reservados.
      </p>
    </div>
  );
} 