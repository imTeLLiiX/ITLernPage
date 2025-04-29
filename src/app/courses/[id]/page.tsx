'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Course } from '@/types/prisma';
import ModuleList from '@/components/ModuleList';

interface PageProps {
  params: {
    courseId: string;
  };
}

export default function CoursePage({ params }: PageProps) {
  const { courseId } = params;
  const { data: session } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error('Kurs konnte nicht geladen werden');
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
  }, [courseId]);

  const handleEnroll = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to enroll');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll');
    }
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  if (error) {
    return <div>Fehler: {error}</div>;
  }

  if (!course) {
    return <div>Kurs nicht gefunden</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">{course.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Kursdetails</h2>
            <ul className="space-y-2">
              <li>Schwierigkeit: {course.difficulty}</li>
              <li>XP: {course.xp}</li>
              <li>Preis: {course.price}€</li>
              <li>Start: {new Date(course.startDate).toLocaleDateString()}</li>
              <li>Ende: {new Date(course.endDate).toLocaleDateString()}</li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Dozent</h2>
            {course.teacher && (
              <div className="flex items-center space-x-4">
                {course.teacher.avatar && (
                  <img
                    src={course.teacher.avatar}
                    alt={course.teacher.name || 'Dozent'}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{course.teacher.name}</p>
                  <p className="text-gray-600 dark:text-gray-300">{course.teacher.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {session?.user.id === course.teacherId ? (
          <div className="mt-6">
            <button
              onClick={() => router.push(`/courses/${courseId}/edit`)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Kurs bearbeiten
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <button
              onClick={handleEnroll}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              Jetzt einschreiben
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900">Course Modules</h3>
        <div className="mt-4">
          <ModuleList courseId={course.id} />
        </div>
      </div>
    </div>
  );
} 