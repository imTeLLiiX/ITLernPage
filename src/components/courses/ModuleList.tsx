import { Module } from '@prisma/client';
import Link from 'next/link';

interface ModuleListProps {
  modules: Module[];
  selectedModule: Module | null;
  onSelectModule: (module: Module) => void;
}

export default function ModuleList({
  modules,
  selectedModule,
  onSelectModule,
}: ModuleListProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Module</h3>
      </div>
      <div className="divide-y">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => onSelectModule(module)}
            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
              selectedModule?.id === module.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="font-medium">{module.title}</div>
            <div className="text-sm text-gray-500">{module.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
} 