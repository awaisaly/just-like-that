import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSeoPage, seoPath, seoRedirects } from './data/seo-pages';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/^\//, '');
  const targetSlug = seoRedirects[path];
  if (!targetSlug) return NextResponse.next();

  const page = getSeoPage(targetSlug);
  if (!page) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = seoPath(page);
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ['/((?!_next|api|og|favicon.ico|img).*)'],
};
