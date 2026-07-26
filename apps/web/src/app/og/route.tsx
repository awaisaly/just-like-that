import { ImageResponse } from 'next/og';
import { AGENCY_NAME } from '../../lib/brand';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? AGENCY_NAME;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 64,
          background: '#16233f',
          color: 'white',
          fontSize: 56,
          fontWeight: 700,
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.85, marginBottom: 16 }}>{AGENCY_NAME}</div>
        <div>{title}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
