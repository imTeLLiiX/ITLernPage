import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // The user ID will be available in the headers thanks to our middleware
  const userId = request.headers.get('x-user-id');

  return NextResponse.json({
    message: 'This is a protected route',
    userId: userId,
    timestamp: new Date().toISOString(),
  });
} 