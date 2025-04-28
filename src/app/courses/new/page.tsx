'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CourseForm } from '@/components/CourseForm';

export default function NewCoursePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create course');
      }

      router.push('/courses');
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/courses');
  };

  if (!session?.user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Sie müssen angemeldet sein, um einen Kurs zu erstellen.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Neuen Kurs erstellen</h1>
        <CourseForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
} 