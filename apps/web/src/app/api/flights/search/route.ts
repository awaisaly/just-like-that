import { NextResponse } from 'next/server';
import { flightSearchSchema } from '@jlt/shared';
import { getCachedFlightSearch } from '../../../../server/flight-cache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'The request body must be valid JSON');
  }

  const parsed = flightSearchSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, 'VALIDATION_ERROR', 'Check the flight search details');
  }

  const input = parsed.data;
  if (input.origin === input.destination) {
    return errorResponse(400, 'VALIDATION_ERROR', 'Origin and destination must be different');
  }
  if (input.returnDate && input.returnDate < input.departDate) {
    return errorResponse(400, 'VALIDATION_ERROR', 'Return date must be after departure');
  }
  if (input.infants > input.adults) {
    return errorResponse(400, 'VALIDATION_ERROR', 'Each infant must travel with an adult');
  }

  try {
    // Server TTL cache (in-process + Next Data Cache). HTTP stays no-store.
    const results = await getCachedFlightSearch(input);
    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'private, no-store',
        },
      },
    );
  } catch (error) {
    console.error('Flight search failed', error);
    return errorResponse(
      502,
      'FLIGHT_SEARCH_FAILED',
      error instanceof Error ? error.message : 'Flight search is temporarily unavailable',
    );
  }
}

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}
