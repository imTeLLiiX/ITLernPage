import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Difficulty } from '@prisma/client';

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
  { params }: { params: { courseId: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
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
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
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
        teacher: true
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Kurs nicht gefunden' },
        { status: 404 }
      );
    }

    if (course.teacherId !== user.id) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = courseSchema.parse(body);

    const updatedCourse = await prisma.course.update({
      where: { id: params.courseId },
      data: validatedData,
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

    return NextResponse.json(updatedCourse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
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
        modules: {
          include: {
            lessons: true,
            quizzes: true
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

    if (course.teacherId !== user.id) {
      return NextResponse.json(
        { error: 'Keine Berechtigung' },
        { status: 403 }
      );
    }

    await prisma.$transaction([
      prisma.progress.deleteMany({
        where: {
          OR: [
            { moduleId: { in: course.modules.map(m => m.id) } },
            { lessonId: { in: course.modules.flatMap(m => m.lessons.map(l => l.id)) } },
            { quizId: { in: course.modules.flatMap(m => m.quizzes.map(q => q.id)) } }
          ]
        }
      }),
      prisma.enrollment.deleteMany({
        where: { courseId: params.courseId }
      }),
      prisma.quiz.deleteMany({
        where: { moduleId: { in: course.modules.map(m => m.id) } }
      }),
      prisma.lesson.deleteMany({
        where: { moduleId: { in: course.modules.map(m => m.id) } }
      }),
      prisma.module.deleteMany({
        where: { courseId: params.courseId }
      }),
      prisma.course.delete({
        where: { id: params.courseId }
      })
    ]);

    return NextResponse.json({ message: 'Kurs erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 