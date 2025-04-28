'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Module {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
  xp: number;
  modules: Module[];
}

export default function CoursePage() {
  const { data: session } = useSession();
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.slug}`);
        if (!response.ok) {
          throw new Error('Kurs nicht gefunden');
        }
        const data = await response.json();
        setCourse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Fehler</h1>
          <p className="text-gray-600 dark:text-gray-400">{error || 'Kurs nicht gefunden'}</p>
          <Link
            href="/courses"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Zurück zur Kursübersicht
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {course.title}
          </h1>
          <div className="flex items-center space-x-4 mb-6">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {course.difficulty}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {course.xp} XP
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Module
          </h2>
          {course.modules.length > 0 ? (
            <div className="space-y-4">
              {course.modules
                .sort((a, b) => a.order - b.order)
                .map((module) => (
                  <div
                    key={module.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {module.title}
                    </h3>
                    <div className="prose dark:prose-invert max-w-none">
                      {module.content}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Noch keine Module verfügbar.
            </p>
          )}
        </div>

        {session?.user.role === 'TEACHER' && (
          <div className="mt-8 flex justify-end">
            <Link
              href={`/courses/${course.slug}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Kurs bearbeiten
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 