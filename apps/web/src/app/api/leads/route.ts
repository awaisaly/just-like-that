import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { callbackLeadSchema } from '../../../lib/lead';
import { sendCallbackEmail } from '../../../server/leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 15;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 100_000) {
    return errorResponse(413, 'PAYLOAD_TOO_LARGE', 'The callback request is too large');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'The request body must be valid JSON');
  }

  const reference = createReference();
  if (
    typeof body === 'object' &&
    body !== null &&
    'company' in body &&
    typeof body.company === 'string' &&
    body.company.length > 0
  ) {
    return successResponse(reference);
  }

  const parsed = callbackLeadSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, 'VALIDATION_ERROR', 'Check your contact and flight details');
  }

  try {
    await sendCallbackEmail(parsed.data, reference);
    return successResponse(reference);
  } catch (error) {
    console.error('Callback email failed', error);
    return errorResponse(
      503,
      'EMAIL_DELIVERY_FAILED',
      'We could not send your request. Please call or message us instead.',
    );
  }
}

function createReference(): string {
  const date = new Date().toISOString().slice(2, 10).replaceAll('-', '');
  const suffix = randomUUID().replaceAll('-', '').slice(0, 6).toUpperCase();
  return `JLT-${date}-${suffix}`;
}

function successResponse(reference: string) {
  return NextResponse.json(
    { reference },
    {
      status: 201,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}
