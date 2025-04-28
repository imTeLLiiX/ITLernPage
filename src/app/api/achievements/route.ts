import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/achievements - Achievements des Benutzers abrufen
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const achievements = await prisma.achievement.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });

    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Fehler beim Abrufen der Achievements:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// POST /api/achievements - Achievement vergeben
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const { type, description } = await request.json();

    // Prüfe, ob das Achievement bereits vergeben wurde
    const existingAchievement = await prisma.achievement.findFirst({
      where: {
        userId: session.user.id,
        type,
      },
    });

    if (existingAchievement) {
      return NextResponse.json(
        { error: 'Achievement bereits vergeben' },
        { status: 400 }
      );
    }

    const achievement = await prisma.achievement.create({
      data: {
        userId: session.user.id,
        type,
        description,
      },
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Vergeben des Achievements:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// Hilfsfunktion zum Überprüfen und Vergeben von Achievements
export async function checkAndAwardAchievements(userId: string) {
  try {
    // Hole Benutzerfortschritt
    const progress = await prisma.progress.findMany({
      where: { userId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    // Hole Streak
    const streak = await prisma.streak.findUnique({
      where: { userId },
    });

    // Hole bestehende Achievements
    const existingAchievements = await prisma.achievement.findMany({
      where: { userId },
      select: { type: true },
    });

    const newAchievements = [];

    // Überprüfe verschiedene Achievement-Bedingungen
    const completedModules = progress.filter((p: { completed: boolean }) => p.completed).length;
    const totalXP = progress.reduce((sum: number, p: { score: number | null }) => sum + (p.score || 0), 0);

    // "Erster Schritt" Achievement
    if (completedModules >= 1 && !existingAchievements.some((a: { type: string }) => a.type === 'FIRST_MODULE')) {
      newAchievements.push({
        type: 'FIRST_MODULE',
        description: 'Erstes Modul abgeschlossen',
      });
    }

    // "Lernstreak" Achievements
    if (streak) {
      if (streak.count >= 7 && !existingAchievements.some((a: { type: string }) => a.type === 'WEEK_STREAK')) {
        newAchievements.push({
          type: 'WEEK_STREAK',
          description: '7 Tage Lernstreak erreicht',
        });
      }
      if (streak.count >= 30 && !existingAchievements.some((a: { type: string }) => a.type === 'MONTH_STREAK')) {
        newAchievements.push({
          type: 'MONTH_STREAK',
          description: '30 Tage Lernstreak erreicht',
        });
      }
    }

    // "XP Master" Achievements
    if (totalXP >= 1000 && !existingAchievements.some((a: { type: string }) => a.type === 'XP_1000')) {
      newAchievements.push({
        type: 'XP_1000',
        description: '1000 XP erreicht',
      });
    }
    if (totalXP >= 5000 && !existingAchievements.some((a: { type: string }) => a.type === 'XP_5000')) {
      newAchievements.push({
        type: 'XP_5000',
        description: '5000 XP erreicht',
      });
    }

    // Vergebe neue Achievements
    for (const achievement of newAchievements) {
      await prisma.achievement.create({
        data: {
          userId,
          type: achievement.type,
          description: achievement.description,
        },
      });
    }

    return newAchievements;
  } catch (error) {
    console.error('Fehler beim Überprüfen der Achievements:', error);
    return [];
  }
} 