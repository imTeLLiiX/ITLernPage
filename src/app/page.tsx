'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Willkommen bei LernPage
        </h1>
        <p className="text-xl text-center mb-8">
          Deine Plattform für IT-Fachinformatiker Ausbildung
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Kurse</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Entdecke unsere vielfältigen Kurse für deine Ausbildung
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Lernmodule</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Strukturierte Lerneinheiten für optimalen Lernerfolg
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Praxis</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Praktische Übungen und Projekte für echte Erfahrung
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 