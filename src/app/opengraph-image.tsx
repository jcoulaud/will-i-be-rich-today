import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Will I Be Rich Today?';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom, #4c1d95, #000000)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}>
        <div
          style={{
            fontSize: 96,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.2,
          }}>
          Will I Be Rich Today? 🤑
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
