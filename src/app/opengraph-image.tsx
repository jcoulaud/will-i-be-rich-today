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
          background: 'linear-gradient(to bottom, #4C1D95, #000000)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '40px',
        }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
            textAlign: 'center',
            lineHeight: 1.2,
          }}>
          Will I Be Rich Today? 🤑
        </div>
        <div
          style={{
            fontSize: 40,
            color: '#FCD34D',
            marginTop: 20,
            textAlign: 'center',
            maxWidth: '80%',
          }}>
          Community-driven fortune teller for memecoin traders
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 30,
            color: '#9CA3AF',
          }}>
          Add your own predictions! 🎯
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
