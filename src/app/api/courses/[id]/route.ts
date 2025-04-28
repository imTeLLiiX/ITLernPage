import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
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
  { params }: { params: { id: string } }
) {
  try {
    // @ts-ignore - Prisma types are not correctly recognized
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        modules: true,
        enrollments: true,
        category: true
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // @ts-ignore - Prisma types are not correctly recognized
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
      select: {
        teacherId: true
      }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (existingCourse.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Only the course teacher can update this course' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = courseSchema.parse(body);

    // @ts-ignore - Prisma types are not correctly recognized
    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
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
        category: true
      }
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // @ts-ignore - Prisma types are not correctly recognized
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        modules: true
      }
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (existingCourse.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Only the course teacher can delete this course' },
        { status: 403 }
      );
    }

    // Delete all related records in the correct order
    await prisma.$transaction([
      // Delete progress records
      prisma.progress.deleteMany({
        where: {
          moduleId: { in: existingCourse.modules.map(m => m.id) }
        }
      }),
      // Delete enrollments
      // @ts-ignore - Prisma types are not correctly recognized
      prisma.enrollment.deleteMany({
        where: { courseId: params.id }
      }),
      // Delete modules
      prisma.module.deleteMany({
        where: { courseId: params.id }
      }),
      // Finally, delete the course
      prisma.course.delete({
        where: { id: params.id }
      })
    ]);

    return NextResponse.json(
      { message: 'Course and all related data deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 