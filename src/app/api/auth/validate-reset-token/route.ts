import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token ist erforderlich' },
        { status: 400 }
      );
    }

    // Token verifizieren
    const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Benutzer und Reset-Token in der Datenbank überprüfen
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        resetToken: true,
        resetTokenExpiry: true,
      },
    });

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Token' },
        { status: 400 }
      );
    }

    // Überprüfen, ob der Token abgelaufen ist
    if (new Date() > user.resetTokenExpiry) {
      return NextResponse.json(
        { error: 'Token ist abgelaufen' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Fehler bei der Token-Validierung:', error);
    return NextResponse.json(
      { error: 'Ungültiger oder abgelaufener Token' },
      { status: 400 }
    );
  }
} 