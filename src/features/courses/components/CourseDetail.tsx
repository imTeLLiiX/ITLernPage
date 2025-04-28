import React from 'react'
import { Course } from '../CourseContext'

interface CourseDetailProps {
  course: Course
  onEnroll?: (courseId: string) => Promise<void>
  onEdit?: () => void
  onDelete?: () => void
  isInstructor?: boolean
}

export function CourseDetail({
  course,
  onEnroll,
  onEdit,
  onDelete,
  isInstructor = false,
}: CourseDetailProps) {
  const handleEnroll = async () => {
    if (onEnroll) {
      try {
        await onEnroll(course.id)
      } catch (error) {
        console.error('Failed to enroll:', error)
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {course.title}
            </h1>
            <p className="text-lg text-gray-600 mb-4">{course.description}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${course.price.toFixed(2)}
            </div>
            {!isInstructor && onEnroll && (
              <button
                onClick={handleEnroll}
                className="w-full px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Enroll Now
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Instructor</h3>
            <p className="mt-1 text-lg text-gray-900">{course.instructor}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Category</h3>
            <p className="mt-1 text-lg text-gray-900">{course.category}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Level</h3>
            <p className="mt-1 text-lg text-gray-900">{course.level}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Duration</h3>
            <p className="mt-1 text-lg text-gray-900">{course.duration} minutes</p>
          </div>
        </div>

        {course.rating && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Rating</h3>
            <div className="flex items-center">
              <span className="text-yellow-400 text-2xl">★</span>
              <span className="ml-2 text-lg text-gray-900">
                {course.rating.toFixed(1)}
              </span>
              {course.enrolledStudents && (
                <span className="ml-2 text-sm text-gray-500">
                  ({course.enrolledStudents} enrolled)
                </span>
              )}
            </div>
          </div>
        )}

        {isInstructor && (
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Edit Course
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Course
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 