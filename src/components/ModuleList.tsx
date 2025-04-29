'use client';

import { useState, useEffect } from 'react';
import { ModuleWithRelations } from '@/types/prisma';

interface ModuleListProps {
  courseId: string;
}

export default function ModuleList({ courseId }: ModuleListProps) {
  const [modules, setModules] = useState<ModuleWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/modules`);
        if (!response.ok) {
          throw new Error('Module konnten nicht geladen werden');
        }
        const data = await response.json();
        setModules(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [courseId]);

  if (loading) return <div>Lade Module...</div>;
  if (error) return <div>Fehler: {error}</div>;
  if (!modules.length) return <div>Keine Module verfügbar</div>;

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <div key={module.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{module.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Lektionen</h4>
              <ul className="list-disc list-inside">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id}>{lesson.title}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Quizze</h4>
              <ul className="list-disc list-inside">
                {module.quizzes.map((quiz) => (
                  <li key={quiz.id}>{quiz.title}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 