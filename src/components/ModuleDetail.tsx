'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Module, Lesson, Quiz, Progress } from '@prisma/client';

interface ModuleWithContent extends Module {
  lessons: Lesson[];
  quizzes: Quiz[];
  progress?: Progress[];
}

interface ModuleDetailProps {
  courseId: string;
  moduleId: string;
}

export default function ModuleDetail({ courseId, moduleId }: ModuleDetailProps) {
  const { data: session } = useSession();
  const [module, setModule] = useState<ModuleWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch module');
        }
        const data = await response.json();
        setModule(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [courseId, moduleId]);

  const isCompleted = (itemId: string, type: 'lesson' | 'quiz') => {
    if (!session?.user || !module?.progress) return false;
    
    return module.progress.some(p => 
      (type === 'lesson' && p.lessonId === itemId) || 
      (type === 'quiz' && p.quizId === itemId)
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (error || !module) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'Module not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{module.title}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
              {module.difficulty}
            </span>
          </div>
          
          <p className="text-gray-600 mb-6">{module.description}</p>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {module.lessons.length} Lessons
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {module.quizzes.length} Quizzes
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {module.xp} XP
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Lessons</h3>
            {module.lessons.map((lesson, index) => (
              <div 
                key={lesson.id} 
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-medium mr-4">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-base font-medium text-gray-900">{lesson.title}</h4>
                    <p className="text-sm text-gray-500">{lesson.xp} XP</p>
                  </div>
                </div>
                
                <Link
                  href={`/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                    isCompleted(lesson.id, 'lesson')
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isCompleted(lesson.id, 'lesson') ? 'Review' : 'Start'}
                </Link>
              </div>
            ))}
            
            {module.quizzes.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mt-6">Quizzes</h3>
                {module.quizzes.map((quiz, index) => (
                  <div 
                    key={quiz.id} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-medium mr-4">
                        Q{index + 1}
                      </span>
                      <div>
                        <h4 className="text-base font-medium text-gray-900">{quiz.title}</h4>
                        <p className="text-sm text-gray-500">{quiz.xp} XP</p>
                      </div>
                    </div>
                    
                    <Link
                      href={`/courses/${courseId}/modules/${moduleId}/quizzes/${quiz.id}`}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                        isCompleted(quiz.id, 'quiz')
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isCompleted(quiz.id, 'quiz') ? 'Review' : 'Start'}
                    </Link>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 