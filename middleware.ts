import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	// Paths that require authentication
	const authRequiredPaths = ['/dashboard', '/create', '/settings'];

	// Check if the path requires authentication
	const isAuthRequired = authRequiredPaths.some(path => request.nextUrl.pathname.startsWith(path));

	// If it's a protected route and user is not authenticated
	if (isAuthRequired && !token) {
		const url = new URL('/auth', request.url);
		url.searchParams.set('callbackUrl', request.nextUrl.pathname);
		return NextResponse.redirect(url);
	}

	// If the user is authenticated and going to /auth
	if (token && request.nextUrl.pathname === '/auth') {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	return NextResponse.next();
}
