import { Course, User, CourseParticipant } from '@prisma/client';

export interface CourseWithTeacher extends Course {
  teacher: Pick<User, 'id' | 'name' | 'email'>;
}

export interface CourseWithParticipants extends Course {
  participants: CourseParticipant[];
}

export interface CourseWithDetails extends Course {
  teacher: Pick<User, 'id' | 'name' | 'email'>;
  participants: CourseParticipant[];
}

export type CourseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'; 