import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { EnrollmentStatus } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Nicht autorisiert - Bitte einloggen' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Kurs nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfe, ob der Benutzer bereits eingeschrieben ist
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Sie sind bereits für diesen Kurs eingeschrieben' },
        { status: 400 }
      );
    }

    // Prüfe, ob der Kurs voll ist
    if (course._count.enrollments >= course.maxParticipants) {
      return NextResponse.json(
        { error: 'Der Kurs ist bereits voll' },
        { status: 400 }
      );
    }

    // Erstelle die Einschreibung
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        status: EnrollmentStatus.PENDING
      },
      include: {
        course: {
          select: {
            title: true,
            description: true
          }
        }
      }
    });

    return NextResponse.json(enrollment);
  } catch (error) {
    console.error('Fehler bei der Kurseinschreibung:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 