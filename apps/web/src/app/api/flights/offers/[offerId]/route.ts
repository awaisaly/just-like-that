import { NextResponse } from 'next/server';
import { getFlightOffer } from '../../../../../server/flights';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type Props = {
  params: Promise<{ offerId: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { offerId } = await params;
  if (!offerId || offerId.length > 200) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Offer id is required' } },
      { status: 400 },
    );
  }

  try {
    const offer = await getFlightOffer(offerId);
    if (!offer) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Offer is unavailable or expired' } },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { offer },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('Get flight offer failed', error);
    return NextResponse.json(
      {
        error: {
          code: 'FLIGHT_OFFER_FAILED',
          message:
            error instanceof Error ? error.message : 'Flight details are temporarily unavailable',
        },
      },
      { status: 502 },
    );
  }
}
