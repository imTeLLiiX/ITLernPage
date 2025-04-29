import { useState, useEffect } from 'react';
import { Quiz } from '@prisma/client';
import Link from 'next/link';

interface QuizListProps {
  courseId: string;
  moduleId: string;
}

export default function QuizList({ courseId, moduleId }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const response = await fetch(
          `/api/courses/${courseId}/modules/${moduleId}/quizzes`
        );
        if (!response.ok) throw new Error('Fehler beim Laden der Quizze');
        const data = await response.json();
        setQuizzes(data);
      } catch (error) {
        console.error('Fehler beim Laden der Quizze:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, [courseId, moduleId]);

  if (loading) {
    return <div>Lade Quizze...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Quizze</h3>
      </div>
      <div className="divide-y">
        {quizzes.map((quiz) => (
          <Link
            key={quiz.id}
            href={`/courses/${courseId}/modules/${moduleId}/quizzes/${quiz.id}`}
            className="block p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium">{quiz.title}</div>
            <div className="text-sm text-gray-500">{quiz.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
} 