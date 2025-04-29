import { useState, useEffect } from 'react';
import { Lesson } from '@prisma/client';
import Link from 'next/link';

interface LessonListProps {
  courseId: string;
  moduleId: string;
}

export default function LessonList({ courseId, moduleId }: LessonListProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLessons() {
      try {
        const response = await fetch(
          `/api/courses/${courseId}/modules/${moduleId}/lessons`
        );
        if (!response.ok) throw new Error('Fehler beim Laden der Lektionen');
        const data = await response.json();
        setLessons(data);
      } catch (error) {
        console.error('Fehler beim Laden der Lektionen:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, [courseId, moduleId]);

  if (loading) {
    return <div>Lade Lektionen...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Lektionen</h3>
      </div>
      <div className="divide-y">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
            className="block p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium">{lesson.title}</div>
            <div className="text-sm text-gray-500">
              {lesson.content.substring(0, 100)}...
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 