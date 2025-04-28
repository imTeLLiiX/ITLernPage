import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: params.slug },
      include: {
        modules: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Kurs nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Fehler beim Abrufen des Kurses:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { title, difficulty, xp, modules } = await request.json();

    const course = await prisma.course.update({
      where: { slug: params.slug },
      data: {
        title,
        difficulty,
        xp,
        modules: {
          deleteMany: {},
          create: modules,
        },
      },
      include: {
        modules: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Kurses:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.course.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json(
      { message: 'Kurs erfolgreich gelöscht' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Fehler beim Löschen des Kurses:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 