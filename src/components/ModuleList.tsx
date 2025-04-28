'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Module, Progress, Difficulty } from '@prisma/client';

interface ModuleWithRelations {
  id: string;
  title: string;
  content: string;
  order: number;
  xp: number;
  difficulty: Difficulty;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  progress: Progress[];
  lessons: {
    id: string;
  }[];
  quizzes: {
    id: string;
  }[];
}

interface ModuleListProps {
  modules: ModuleWithRelations[];
  onModuleClick: (moduleId: string) => void;
}

export default function ModuleList({ modules, onModuleClick }: ModuleListProps) {
  const calculateProgress = (module: ModuleWithRelations) => {
    const totalItems = module.lessons.length + module.quizzes.length;
    if (totalItems === 0) return 0;
    
    const completedItems = module.progress.filter(p => p.completed).length;
    return Math.round((completedItems / totalItems) * 100);
  };

  const getDifficultyColor = (difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') => {
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

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <div
          key={module.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onModuleClick(module.id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {module.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {module.content}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {module.difficulty}
              </span>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {module.xp} XP
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{calculateProgress(module)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${calculateProgress(module)}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{module.lessons.length} Lessons</span>
            <span>{module.quizzes.length} Quizzes</span>
          </div>
        </div>
      ))}
    </div>
  );
} 