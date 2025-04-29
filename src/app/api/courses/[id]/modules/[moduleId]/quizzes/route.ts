import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string; moduleId: string } }
) {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: {
        moduleId: params.moduleId,
        module: {
          courseId: params.id,
        },
      },
      include: {
        QuizQuestion: {
          include: {
            QuizAnswer: true,
          },
        },
      },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Fehler beim Abrufen der Quizze:', error);
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
    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        moduleId: params.moduleId,
        xp: data.xp || 0,
        QuizQuestion: {
          create: data.questions.map((q: any) => ({
            text: q.text,
            type: q.type,
            QuizAnswer: {
              create: q.answers.map((a: any) => ({
                text: a.text,
                isCorrect: a.isCorrect,
              })),
            },
          })),
        },
      },
      include: {
        QuizQuestion: {
          include: {
            QuizAnswer: true,
          },
        },
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Fehler beim Erstellen des Quiz:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 