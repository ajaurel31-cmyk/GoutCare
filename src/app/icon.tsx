import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Droplet with G — CSS shapes */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: -1,
          }}
        >
          {/* Droplet tip */}
          <div
            style={{
              width: 7,
              height: 7,
              background: '#fff',
              transform: 'rotate(45deg)',
              marginBottom: -4,
            }}
          />
          {/* Droplet body with G */}
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                color: '#1e3a5f',
                fontSize: 11,
                fontWeight: 900,
                marginTop: -1,
              }}
            >
              G
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
