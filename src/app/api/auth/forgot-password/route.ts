import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail-Adresse ist erforderlich' },
        { status: 400 }
      );
    }

    // Benutzer suchen
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Aus Sicherheitsgründen immer eine Erfolgsmeldung zurückgeben,
    // auch wenn der Benutzer nicht existiert
    if (!user) {
      return NextResponse.json(
        { message: 'Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir Ihnen einen Link zum Zurücksetzen des Passworts gesendet.' },
        { status: 200 }
      );
    }

    // Reset-Token generieren
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 Stunde

    // Token in der Datenbank speichern
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // JWT für den Reset-Link erstellen
    const token = sign(
      {
        userId: user.id,
        resetToken,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Reset-Link erstellen
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // Hier würde normalerweise der E-Mail-Versand erfolgen
    // Für Entwicklungszwecke geben wir den Link in der Konsole aus
    console.log('Reset-Link:', resetUrl);

    return NextResponse.json(
      { message: 'Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir Ihnen einen Link zum Zurücksetzen des Passworts gesendet.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fehler bei der Passwort-Reset-Anfrage:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 