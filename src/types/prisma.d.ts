import { Prisma } from '@prisma/client';

// Exportiere die Typen direkt
export type CourseWithEnrollments = Prisma.CourseGetPayload<{
  include: {
    enrollments: true;
    teacher: true;
  };
}>;

export type EnrollmentWithRelations = Prisma.EnrollmentGetPayload<{
  include: {
    user: true;
    course: true;
  };
}>;

export type CourseWithTeacher = Prisma.CourseGetPayload<{
  include: {
    teacher: true;
    enrollments: true;
  };
}>;

export type UserWithEnrollments = Prisma.UserGetPayload<{
  include: {
    enrollments: true;
  };
}>;

// Erweiterte Typen für die Prisma-Client-Methoden
declare module '@prisma/client' {
  interface PrismaClient {
    course: Prisma.CourseDelegate<DefaultArgs>;
    enrollment: Prisma.EnrollmentDelegate<DefaultArgs>;
    user: Prisma.UserDelegate<DefaultArgs>;
  }

  // Erweiterte Typen für die Modelle
  interface Course {
    id: string;
    title: string;
    description: string;
    slug: string;
    difficulty: Difficulty;
    xp: number;
    startDate: Date;
    endDate: Date;
    price: number;
    maxParticipants: number;
    teacherId: string;
    teacher: User;
    enrollments: Enrollment[];
    createdAt: Date;
    updatedAt: Date;
  }

  interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    status: EnrollmentStatus;
    user: User;
    course: Course;
    createdAt: Date;
    updatedAt: Date;
  }

  interface User {
    id: string;
    name: string | null;
    email: string;
    password: string;
    role: Role;
    stripeId: string | null;
    createdAt: Date;
    updatedAt: Date;
    teacherCourses: Course[];
    enrollments: Enrollment[];
  }

  enum Role {
    USER = 'USER',
    TEACHER = 'TEACHER',
    ADMIN = 'ADMIN'
  }

  enum Difficulty {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED'
  }

  enum EnrollmentStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED'
  }
} 