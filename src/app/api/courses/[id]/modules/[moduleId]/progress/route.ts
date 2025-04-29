import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
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

    const progress = await prisma.progress.findFirst({
      where: {
        userId: session.user.id,
        moduleId: params.moduleId,
        module: {
          courseId: params.id,
        },
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Fehler beim Abrufen des Fortschritts:', error);
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

    const data = await request.json();
    const progress = await prisma.progress.upsert({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: params.moduleId,
        },
      },
      update: {
        completed: data.completed,
      },
      create: {
        userId: session.user.id,
        moduleId: params.moduleId,
        completed: data.completed,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Fortschritts:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 