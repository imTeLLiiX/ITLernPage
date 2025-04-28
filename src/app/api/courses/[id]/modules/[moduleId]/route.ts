import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string;
    moduleId: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    const module = await prisma.module.findUnique({
      where: { id: params.moduleId },
      include: {
        lessons: {
          orderBy: {
            order: 'asc',
          },
        },
        quizzes: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // If user is logged in, fetch their progress
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        const progress = await prisma.progress.findMany({
          where: {
            userId: user.id,
            OR: [
              { lessonId: { in: module.lessons.map(l => l.id) } },
              { quizId: { in: module.quizzes.map(q => q.id) } },
            ],
          },
        });

        return NextResponse.json({
          ...module,
          progress,
        });
      }
    }

    return NextResponse.json(module);
  } catch (error) {
    console.error('Error fetching module:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 