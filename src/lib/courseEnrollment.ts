// @ts-nocheck
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface EnrollmentEligibility {
  eligible: boolean;
  error?: string;
}

/**
 * Prüft, ob ein Benutzer sich für einen Kurs anmelden kann
 */
export async function checkEnrollmentEligibility(
  userId: string,
  courseId: string
): Promise<EnrollmentEligibility> {
  try {
    // Kurs abrufen
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          where: {
            userId: userId,
          },
        },
        teacher: true,
      },
    });

    if (!course) {
      return {
        eligible: false,
        error: 'Kurs nicht gefunden',
      };
    }

    // Prüfen, ob der Benutzer bereits angemeldet ist
    if (course.enrollments.length > 0) {
      return {
        eligible: false,
        error: 'Sie sind bereits für diesen Kurs angemeldet',
      };
    }

    // Anzahl der bestätigten Anmeldungen abrufen
    const enrollmentCount = await prisma.enrollment.count({
      where: {
        courseId: courseId,
        status: 'APPROVED',
      },
    });

    if (enrollmentCount >= course.maxParticipants) {
      return {
        eligible: false,
        error: 'Der Kurs ist bereits ausgebucht',
      };
    }

    return { eligible: true };
  } catch (error) {
    console.error('Fehler bei der Prüfung der Anmeldebedingungen:', error);
    return {
      eligible: false,
      error: 'Interner Serverfehler',
    };
  }
}

/**
 * Erstellt eine neue Kursanmeldung
 */
export async function createEnrollment(userId: string, courseId: string) {
  return prisma.enrollment.create({
    data: {
      userId: userId,
      courseId: courseId,
      status: 'PENDING',
    },
  });
}

/**
 * Aktualisiert den Status einer Kursanmeldung
 */
export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
) {
  return prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status },
  });
}

/**
 * Löscht eine Kursanmeldung
 */
export async function deleteEnrollment(enrollmentId: string) {
  return prisma.enrollment.delete({
    where: { id: enrollmentId },
  });
} 