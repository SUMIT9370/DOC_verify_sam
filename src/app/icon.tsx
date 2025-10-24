import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// This is now a fallback for platforms that use maskable icons or other generation methods.
// The primary favicon is now set via static file export in layout.tsx.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#00308F',
          borderRadius: '50%',
        }}
      >
        <span style={{color: 'white', fontSize: 24, fontFamily: 'sans-serif'}}>D</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
