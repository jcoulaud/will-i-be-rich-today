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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 40,
          }}>
          Will I Be Rich Today? 🤑
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 'bold',
            color: '#ef4444',
          }}>
          NO
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
