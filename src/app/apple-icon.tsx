import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* White droplet with G inside — built with CSS shapes */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: -8,
          }}
        >
          {/* Droplet tip (rotated square) */}
          <div
            style={{
              width: 36,
              height: 36,
              background: '#fff',
              transform: 'rotate(45deg)',
              marginBottom: -22,
            }}
          />
          {/* Droplet body (circle with G) */}
          <div
            style={{
              width: 88,
              height: 88,
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
                fontSize: 60,
                fontWeight: 900,
                letterSpacing: '-0.04em',
                marginTop: -2,
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
