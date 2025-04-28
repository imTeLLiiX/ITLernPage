import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token und Passwort sind erforderlich' },
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

    // Passwort hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Passwort aktualisieren und Reset-Token zurücksetzen
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Zurücksetzen des Passworts:', error);
    return NextResponse.json(
      { error: 'Fehler beim Zurücksetzen des Passworts' },
      { status: 500 }
    );
  }
} 