import React from 'react'
import { CourseCard } from './CourseCard'
import { useCourses } from '../CourseContext'

export function CourseList() {
  const { courses, loading, error, enrollInCourse } = useCourses()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No courses available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onEnroll={enrollInCourse}
        />
      ))}
    </div>
  )
} 