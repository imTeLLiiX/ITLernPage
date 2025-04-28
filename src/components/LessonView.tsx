'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lesson, Progress } from '@prisma/client';

interface LessonWithProgress extends Lesson {
  progress?: Progress;
}

interface LessonViewProps {
  courseId: string;
  moduleId: string;
  lessonId: string;
}

export default function LessonView({ courseId, moduleId, lessonId }: LessonViewProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch lesson');
        }
        const data = await response.json();
        setLesson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, moduleId, lessonId]);

  const handleComplete = async () => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark lesson as complete');
      }

      const updatedLesson = await response.json();
      setLesson(updatedLesson);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark lesson as complete');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white shadow rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'Lesson not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{lesson.xp} XP</span>
              {lesson.progress?.completed && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              )}
            </div>
          </div>
          
          <div className="prose max-w-none mb-6">
            <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </div>
          
          {!lesson.progress?.completed && (
            <div className="flex justify-end">
              <button
                onClick={handleComplete}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Mark as Complete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 