'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Course, User } from '@prisma/client';
import Link from 'next/link';

interface DashboardProps {}

interface CourseWithTeacher extends Course {
  teacher: User;
  enrollments: {
    id: string;
    status: string;
  }[];
}

export default function Dashboard({}: DashboardProps) {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<CourseWithTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Fehler beim Laden der Kurse');
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const teacherCourses = courses.filter(
    (course) => course.teacherId === session?.user?.id
  );
  const enrolledCourses = courses.filter((course) =>
    course.enrollments.some(
      (enrollment) =>
        enrollment.status === 'APPROVED' &&
        enrollment.userId === session?.user?.id
    )
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {session?.user?.role === 'TEACHER' && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Meine Kurse</h2>
            <Link
              href="/courses/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Neuer Kurs
            </Link>
          </div>

          {teacherCourses.length === 0 ? (
            <p className="text-gray-500">Sie haben noch keine Kurse erstellt.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>
                      {course.enrollments.length} von {course.maxParticipants}{' '}
                      Teilnehmern
                    </span>
                    <span>{course.price}€</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-6">Meine angemeldeten Kurse</h2>

        {enrolledCourses.length === 0 ? (
          <p className="text-gray-500">
            Sie sind noch für keine Kurse angemeldet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Dozent: {course.teacher.name}</span>
                  <span>{course.price}€</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 