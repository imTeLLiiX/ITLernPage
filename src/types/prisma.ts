import { Prisma } from '@prisma/client';

export type Course = Prisma.CourseGetPayload<{
  include: {
    teacher: {
      select: {
        id: true;
        name: true;
        email: true;
        avatar: true;
      };
    };
    category: true;
  };
}>;

export type ModuleWithRelations = Prisma.ModuleGetPayload<{
  include: {
    lessons: true;
    quizzes: true;
    progress: true;
  };
}>;

export type CourseWithRelations = Prisma.CourseGetPayload<{
  include: {
    teacher: true;
    modules: {
      include: {
        lessons: true;
        quizzes: true;
      };
    };
    enrollments: true;
    category: true;
  };
}>;

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    courses: true;
    enrollments: true;
  };
}>;

export type CourseParticipantWithRelations = Prisma.CourseParticipantGetPayload<{
  include: {
    user: true;
    course: true;
  };
}>; 