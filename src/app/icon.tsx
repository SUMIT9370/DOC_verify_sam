import { ImageResponse } from 'next/og';
import Image from 'next/image';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// This component generates the favicon for the application.
// It uses the app's logo.png from the public directory.
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
          backgroundColor: 'white',
          borderRadius: '50%',
        }}
      >
        <img
            width="32"
            height="32"
            src="http://localhost:9002/logo.png"
            style={{
                borderRadius: '4px',
            }}
            alt="DocVerify Logo"
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
