'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Course, User } from '@prisma/client';

interface CourseWithTeacher extends Course {
  teacher: User;
}

interface CourseListProps {
  courses: CourseWithTeacher[];
}

export default function CourseList({ courses }: CourseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'startDate' | 'price'>('startDate');

  const filteredCourses = courses
    .filter(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'startDate':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'price':
          return a.price - b.price;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-96">
          <input
            type="text"
            placeholder="Kurse durchsuchen..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="w-full sm:w-48 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'title' | 'startDate' | 'price')}
        >
          <option value="title">Nach Titel sortieren</option>
          <option value="startDate">Nach Startdatum sortieren</option>
          <option value="price">Nach Preis sortieren</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
              </span>
              <span className="font-semibold">{course.price}€</span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              <span className="font-medium">Schwierigkeit:</span> {course.difficulty.toLowerCase()}
            </div>
          </Link>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine Kurse gefunden.</p>
        </div>
      )}
    </div>
  );
} 