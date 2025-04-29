import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string; moduleId: string } }
) {
  try {
    const lessons = await prisma.lesson.findMany({
      where: {
        moduleId: params.moduleId,
        module: {
          courseId: params.id,
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Fehler beim Abrufen der Lektionen:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const module = await prisma.module.findUnique({
      where: { id: params.moduleId },
      include: { course: { include: { teacher: true } } },
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Modul nicht gefunden' },
        { status: 404 }
      );
    }

    if (module.course.teacher.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const lesson = await prisma.lesson.create({
      data: {
        title: data.title,
        content: data.content,
        order: data.order,
        moduleId: params.moduleId,
        xp: data.xp || 0,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('Fehler beim Erstellen der Lektion:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 