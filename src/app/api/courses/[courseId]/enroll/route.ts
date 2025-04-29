import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const courseId = params.courseId;

    // Check if user is already enrolled
    const isEnrolled = await redis.sismember(`course:${courseId}:enrolled`, userId);
    if (isEnrolled) {
      return new NextResponse('Already enrolled', { status: 400 });
    }

    // Add user to enrolled set
    await redis.sadd(`course:${courseId}:enrolled`, userId);
    
    // Add course to user's enrolled courses
    await redis.sadd(`user:${userId}:enrolled`, courseId);

    return new NextResponse('Enrolled successfully', { status: 200 });
  } catch (error) {
    console.error('Error enrolling in course:', error);
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

    const userId = session.user.id;
    const courseId = params.courseId;

    // Remove user from enrolled set
    await redis.srem(`course:${courseId}:enrolled`, userId);
    
    // Remove course from user's enrolled courses
    await redis.srem(`user:${userId}:enrolled`, courseId);

    return new NextResponse('Unenrolled successfully', { status: 200 });
  } catch (error) {
    console.error('Error unenrolling from course:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 