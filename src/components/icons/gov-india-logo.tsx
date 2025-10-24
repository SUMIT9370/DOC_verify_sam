import type { SVGProps } from 'react';

export function GovIndiaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <title>Government of India Logo</title>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 2v2.5" />
      <path d="M12 19.5V22" />
      <path d="M22 12h-2.5" />
      <path d="M4.5 12H2" />
      <path d="m19.071 4.929-1.768 1.768" />
      <path d="m6.7 17.3-1.768 1.768" />
      <path d="m19.071 19.071-1.768-1.768" />
      <path d="m6.7 6.7-1.768-1.768" />
      <path d="M20.243 8.5h-1.414" />
      <path d="M5.171 15.5H3.757" />
      <path d="M15.5 5.171V3.757" />
      <path d="M8.5 20.243v-1.414" />
      <path d="M17.214 6.786l-1-1" />
      <path d="M7.786 17.214l-1-1" />
      <path d="M17.214 17.214l-1-1" />
      <path d="M7.786 6.786l-1-1" />
    </svg>
  );
}
