import { useState } from 'react';
import { Module } from '@prisma/client';
import ModuleList from './ModuleList';
import LessonList from './LessonList';
import QuizList from './QuizList';

interface CourseContentProps {
  courseId: string;
  modules: Module[];
}

export default function CourseContent({ courseId, modules }: CourseContentProps) {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="md:col-span-1">
        <ModuleList
          modules={modules}
          selectedModule={selectedModule}
          onSelectModule={setSelectedModule}
        />
      </div>
      <div className="md:col-span-3">
        {selectedModule ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">{selectedModule.title}</h2>
            <p className="text-gray-600">{selectedModule.description}</p>
            <div className="space-y-4">
              <LessonList
                courseId={courseId}
                moduleId={selectedModule.id}
              />
              <QuizList
                courseId={courseId}
                moduleId={selectedModule.id}
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Wählen Sie ein Modul aus, um den Inhalt anzuzeigen
          </div>
        )}
      </div>
    </div>
  );
} 