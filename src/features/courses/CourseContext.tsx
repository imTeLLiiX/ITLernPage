import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  category: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  duration: number // in minutes
  price: number
  rating?: number
  enrolledStudents?: number
}

interface CourseContextType {
  courses: Course[]
  loading: boolean
  error: string | null
  fetchCourses: () => Promise<void>
  getCourseById: (id: string) => Course | undefined
  enrollInCourse: (courseId: string) => Promise<void>
  createCourse: (courseData: Omit<Course, 'id'>) => Promise<void>
  updateCourse: (id: string, courseData: Partial<Course>) => Promise<void>
  deleteCourse: (id: string) => Promise<void>
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

export function CourseProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      const data = await response.json()
      setCourses(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getCourseById = (id: string) => {
    return courses.find(course => course.id === id)
  }

  const enrollInCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to enroll in course')
      }
      await fetchCourses() // Refresh courses after enrollment
      router.push(`/courses/${courseId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll in course')
      throw err
    }
  }

  const createCourse = async (courseData: Omit<Course, 'id'>) => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      })
      if (!response.ok) {
        throw new Error('Failed to create course')
      }
      await fetchCourses() // Refresh courses after creation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course')
      throw err
    }
  }

  const updateCourse = async (id: string, courseData: Partial<Course>) => {
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      })
      if (!response.ok) {
        throw new Error('Failed to update course')
      }
      await fetchCourses() // Refresh courses after update
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course')
      throw err
    }
  }

  const deleteCourse = async (id: string) => {
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete course')
      }
      await fetchCourses() // Refresh courses after deletion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course')
      throw err
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        error,
        fetchCourses,
        getCourseById,
        enrollInCourse,
        createCourse,
        updateCourse,
        deleteCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  )
}

export function useCourses() {
  const context = useContext(CourseContext)
  if (context === undefined) {
    throw new Error('useCourses must be used within a CourseProvider')
  }
  return context
} 