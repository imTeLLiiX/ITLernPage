import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    const modules = await prisma.module.findMany({
      where: {
        courseId: params.id,
      },
      include: {
        lessons: true,
        quizzes: true,
      },
    });

    // If user is logged in, filter progress to only show their records
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        // @ts-ignore - Prisma types are not correctly recognized
        const modulesWithUserProgress = modules.map(module => ({
          ...module,
          progress: module.progress.filter(p => p.userId === user.id)
        }));

        return NextResponse.json(modulesWithUserProgress);
      }
    }

    // If not logged in, return modules without progress
    // @ts-ignore - Prisma types are not correctly recognized
    const modulesWithoutProgress = modules.map(module => ({
      ...module,
      progress: []
    }));

    return NextResponse.json(modulesWithoutProgress);
  } catch (error) {
    console.error('Fehler beim Abrufen der Module:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 