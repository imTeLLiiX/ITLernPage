import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/progress - Fortschritt des Benutzers abrufen
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const progress = await prisma.progress.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        module: {
          include: {
            course: true,
          },
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

// POST /api/progress - Fortschritt aktualisieren
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const { moduleId, completed, score } = await request.json();

    const progress = await prisma.progress.upsert({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId,
        },
      },
      update: {
        completed,
        score,
      },
      create: {
        userId: session.user.id,
        moduleId,
        completed,
        score,
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    // Wenn das Modul abgeschlossen ist, aktualisiere den Streak
    if (completed) {
      await updateStreak(session.user.id);
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Fortschritts:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

async function updateStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const streak = await prisma.streak.findUnique({
    where: { userId },
  });

  if (!streak) {
    await prisma.streak.create({
      data: {
        userId,
        count: 1,
        lastLogin: today,
      },
    });
    return;
  }

  const lastLogin = new Date(streak.lastLogin);
  lastLogin.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Bereits heute aktiv
    return;
  }

  if (diffDays === 1) {
    // Nächster Tag in Folge
    await prisma.streak.update({
      where: { userId },
      data: {
        count: streak.count + 1,
        lastLogin: today,
      },
    });
  } else {
    // Streak unterbrochen
    await prisma.streak.update({
      where: { userId },
      data: {
        count: 1,
        lastLogin: today,
      },
    });
  }
} 