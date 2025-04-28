'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CourseForm } from '@/features/courses/components';
import { CourseProvider, useCourses } from '@/features/courses/CourseContext';

function CreateCoursePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { createCourse } = useCourses();

  if (session?.user?.role !== 'TEACHER') {
    router.push('/courses');
    return null;
  }

  const handleSubmit = async (data: any) => {
    try {
      await createCourse(data);
      router.push('/courses');
    } catch (error) {
      console.error('Fehler beim Erstellen des Kurses:', error);
      alert('Der Kurs konnte nicht erstellt werden.');
    }
  };

  const handleCancel = () => {
    router.push('/courses');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Neuen Kurs erstellen</h1>
      <CourseForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}

export default function CreateCoursePageWrapper() {
  return (
    <CourseProvider>
      <CreateCoursePage />
    </CourseProvider>
  );
} 