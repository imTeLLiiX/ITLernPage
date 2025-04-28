import React from 'react'
import Link from 'next/link'
import { Course } from '../CourseContext'

interface CourseCardProps {
  course: Course
  onEnroll?: (courseId: string) => Promise<void>
}

export function CourseCard({ course, onEnroll }: CourseCardProps) {
  const handleEnroll = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (onEnroll) {
      try {
        await onEnroll(course.id)
      } catch (error) {
        console.error('Failed to enroll:', error)
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {course.title}
        </h3>
        <p className="text-gray-600 mb-4">{course.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500">Instructor:</span>
            <span className="ml-2 text-sm text-gray-900">{course.instructor}</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500">Level:</span>
            <span className="ml-2 text-sm text-gray-900">{course.level}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500">Duration:</span>
            <span className="ml-2 text-sm text-gray-900">{course.duration} min</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500">Category:</span>
            <span className="ml-2 text-sm text-gray-900">{course.category}</span>
          </div>
        </div>

        {course.rating && (
          <div className="flex items-center mb-4">
            <span className="text-sm font-medium text-gray-500">Rating:</span>
            <div className="ml-2 flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm text-gray-900">{course.rating.toFixed(1)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ${course.price.toFixed(2)}
          </span>
          <div className="space-x-2">
            <Link
              href={`/courses/${course.id}`}
              className="inline-block px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Details
            </Link>
            {onEnroll && (
              <button
                onClick={handleEnroll}
                className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Enroll Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 