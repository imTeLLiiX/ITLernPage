'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  difficulty: string;
  xp: number;
  startDate: string;
  endDate: string;
  price: number;
  maxParticipants: number;
  teacher: {
    id: string;
    name: string | null;
    email: string;
  };
  enrollments: {
    id: string;
    userId: string;
    courseId: string;
    status: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }[];
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/courses');
        if (!res.ok) throw new Error('Failed to fetch courses');
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kurse</h1>
        {session?.user && (
          <Link
            href="/courses/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Neuen Kurs erstellen
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
          >
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">
                <Link href={`/courses/${course.id}`} className="hover:text-blue-600">
                  {course.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {course.description.substring(0, 150)}
                {course.description.length > 150 ? '...' : ''}
              </p>
            </div>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {course.difficulty}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {course.xp} XP
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {course.enrollments.length} / {course.maxParticipants} Teilnehmer
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {course.price}€
                </div>
              </div>
            </div>
            <div className="px-4 py-4 sm:px-6 bg-gray-50">
              <div className="text-sm text-gray-500">
                Dozent: {course.teacher.name || course.teacher.email}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 