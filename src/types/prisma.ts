import { Prisma } from '@prisma/client';

export type CourseWithRelations = Prisma.CourseGetPayload<{
  include: {
    teacher: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    participants: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
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