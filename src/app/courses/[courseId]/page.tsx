'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Course } from '@prisma/client';
import ModuleList from '@/components/ModuleList';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

interface PageProps {
  params: {
    courseId: string;
  };
}

export default function CoursePage({ params }: PageProps) {
  const { courseId } = params;
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) throw new Error('Fehler beim Laden des Kurses');
        const data = await response.json();
        setCourse(data);
        setIsEnrolled(data.enrollments?.some((e: any) => e.userId === session?.user?.id) ?? false);
      } catch (error) {
        console.error('Fehler:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) fetchCourse();
  }, [courseId, session?.user?.id]);

  const handleEnroll = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Fehler bei der Einschreibung');
      }

      setIsEnrolled(true);
    } catch (error) {
      console.error('Fehler:', error);
    }
  };

  if (isLoading) {
    return <div>Laden...</div>;
  }

  if (!course) {
    return <div>Kurs nicht gefunden</div>;
  }

  const isTeacher = session?.user?.id === course.teacher?.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex gap-4 mb-4">
              <div>
                <span className="font-semibold">Schwierigkeit:</span>{' '}
                {course.difficulty}
              </div>
              <div>
                <span className="font-semibold">XP:</span> {course.xp}
              </div>
              <div>
                <span className="font-semibold">Preis:</span> {course.price}€
              </div>
            </div>
            <div className="mb-4">
              <span className="font-semibold">Kategorie:</span>{' '}
              {course.category?.name}
            </div>
            <div className="mb-4">
              <span className="font-semibold">Dozent:</span>{' '}
              {course.teacher?.name}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {isTeacher ? (
              <Button
                onClick={() => router.push(`/courses/${courseId}/edit`)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Kurs bearbeiten
              </Button>
            ) : !isEnrolled ? (
              <Button
                onClick={handleEnroll}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Einschreiben
              </Button>
            ) : (
              <Button disabled className="bg-gray-500 text-white">
                Eingeschrieben
              </Button>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-2xl font-bold mb-4">Module</h2>
          {isEnrolled || isTeacher ? (
            <ModuleList courseId={course.id} />
          ) : (
            <p className="text-gray-600">
              Schreiben Sie sich ein, um die Module zu sehen.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 