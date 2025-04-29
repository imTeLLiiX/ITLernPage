import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const course = await redis.get(`course:${params.courseId}`);
    if (!course) {
      return new NextResponse('Course not found', { status: 404 });
    }

    return NextResponse.json(JSON.parse(course));
  } catch (error) {
    console.error('Error fetching course:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    await redis.set(`course:${params.courseId}`, JSON.stringify(body));

    return NextResponse.json(body);
  } catch (error) {
    console.error('Error updating course:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await redis.del(`course:${params.courseId}`);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting course:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 