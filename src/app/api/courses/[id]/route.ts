import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Difficulty, Role } from '@prisma/client';

const courseSchema = z.object({
  title: z.string(),
  description: z.string(),
  slug: z.string(),
  difficulty: z.nativeEnum(Difficulty),
  xp: z.number(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  price: z.number(),
  maxParticipants: z.number(),
  categoryId: z.string()
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        enrollments: true,
        modules: {
          include: {
            lessons: true,
            quizzes: true
          }
        },
        category: true
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Kurs nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Fehler beim Abrufen des Kurses:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      include: { teacher: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Kurs nicht gefunden' },
        { status: 404 }
      );
    }

    if (course.teacher.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Kurses:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      include: { teacher: true },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Kurs nicht gefunden' },
        { status: 404 }
      );
    }

    if (course.teacher.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 403 }
      );
    }

    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Kurs erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Kurses:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}