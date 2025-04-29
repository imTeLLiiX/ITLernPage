// @ts-nocheck
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        enrollments: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Kurs nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfen, ob der Benutzer bereits eingeschrieben ist
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Sie sind bereits in diesem Kurs eingeschrieben' },
        { status: 400 }
      );
    }

    // Check if course has available spots
    if (course._count.enrollments >= course.maxParticipants) {
      return NextResponse.json(
        { error: 'Course is full' },
        { status: 400 }
      );
    }

    // Neue Einschreibung erstellen
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
      },
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