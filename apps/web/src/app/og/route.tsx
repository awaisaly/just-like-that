import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { AGENCY_NAME } from '../../lib/brand';

export const runtime = 'nodejs';

const WIDTH = 1200;
const HEIGHT = 630;

type Assets = {
  logo: string;
  hero: string;
  font: ArrayBuffer;
};

let assetsPromise: Promise<Assets> | null = null;

function loadAssets(): Promise<Assets> {
  if (!assetsPromise) {
    const root = process.cwd();
    assetsPromise = Promise.all([
      readFile(join(root, 'public/icon-512.png')),
      readFile(join(root, 'public/img/og-hero.jpg')),
      readFile(join(root, 'src/app/fonts/syne-700.ttf')),
    ]).then(([logo, hero, font]) => ({
      logo: `data:image/png;base64,${logo.toString('base64')}`,
      hero: `data:image/jpeg;base64,${hero.toString('base64')}`,
      font: font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength),
    }));
  }
  return assetsPromise;
}

function headlineSize(title: string): number {
  if (title.length > 64) return 46;
  if (title.length > 42) return 54;
  return 62;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get('title')?.replace(/\s+/g, ' ').trim() || 'Cheap flights from London to Lagos';
  const title = raw.length > 90 ? `${raw.slice(0, 87).trimEnd()}…` : raw;
  const { logo, hero, font } = await loadAssets();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#10193a',
          color: 'white',
          fontFamily: 'Syne',
        }}
      >
        <div
          style={{
            width: 680,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '56px 52px 52px 60px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={logo} width={92} height={92} alt="" />
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 22 }}>
              <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>
                {AGENCY_NAME}
              </div>
              <div style={{ fontSize: 20, color: '#ff6a2c', marginTop: 10, fontWeight: 700 }}>
                UK travel desk
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', width: 560 }}>
            <div
              style={{
                width: 72,
                height: 8,
                borderRadius: 99,
                background: '#ff6a2c',
                marginBottom: 28,
              }}
            />
            <div
              style={{
                fontSize: headlineSize(title),
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: -1.5,
              }}
            >
              {title}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 999,
                padding: '12px 22px',
                fontSize: 22,
                color: 'rgba(255,255,255,0.88)',
              }}
            >
              elcaairbridge.com
            </div>
          </div>
        </div>

        <div
          style={{
            width: 520,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            paddingRight: 36,
          }}
        >
          <img
            src={hero}
            width={484}
            height={558}
            alt=""
            style={{ borderRadius: 28, objectFit: 'cover' }}
          />
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: 'Syne',
          data: font,
          weight: 700,
          style: 'normal',
        },
      ],
      headers: {
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    },
  );
}
