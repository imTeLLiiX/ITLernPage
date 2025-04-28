import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma

// Exportiere die Prisma-Typen für die Verwendung in anderen Dateien
export type { Prisma, PrismaClient }

// Hilfstypen für die API-Routen
export type CourseWithRelations = Prisma.CourseGetPayload<{
  include: {
    teacher: {
      select: {
        id: true;
        name: true;
        email: true;
        avatar: true;
      };
    };
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

export type ModuleWithRelations = Prisma.ModuleGetPayload<{
  include: {
    progress: true;
    lessons: {
      select: {
        id: true;
        title: true;
      };
    };
    quizzes: {
      select: {
        id: true;
        title: true;
      };
    };
  };
}>; 