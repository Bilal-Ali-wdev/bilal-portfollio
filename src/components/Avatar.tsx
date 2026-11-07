export default function Avatar() {
  return (
    <svg
      className="avatar"
      role="img"
      aria-label="Hand-drawn portrait of Bilal"
      viewBox="0 0 400 420"
      fill="none"
      stroke="var(--av-stroke)"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* hoodie */}
      <path d="M40 420c4-70 40-112 110-128l50 24 50-24c70 16 106 58 110 128" fill="var(--av-hoodie)" />
      <path d="M150 292c4 28 22 46 50 46s46-18 50-46" fill="var(--av-shirt)" />
      <path d="M182 336v48M218 336v40" strokeWidth={4} />
      <circle cx="182" cy="390" r="5" fill="var(--av-stroke)" stroke="none" />
      <circle cx="218" cy="382" r="5" fill="var(--av-stroke)" stroke="none" />
      <path d="M95 360v60M305 360v60" strokeWidth={4} />

      <g className="avatar-head">
        {/* neck */}
        <path d="M172 262v34c10 10 46 10 56 0v-34" fill="var(--av-skin)" />
        {/* ears */}
        <path d="M118 180c-22-8-30 18-18 38 8 12 20 14 26 10" fill="var(--av-skin)" />
        <path d="M282 180c22-8 30 18 18 38-8 12-20 14-26 10" fill="var(--av-skin)" />
        {/* face */}
        <path d="M120 150c0-50 36-80 80-80s80 30 80 80v40c0 50-36 90-80 90s-80-40-80-90z" fill="var(--av-skin)" />
        {/* hair */}
        <path
          d="M114 162c-10-52 18-98 64-104 12-16 44-18 60-4 34 2 58 34 54 70 4 14 2 28-6 40-8-24-22-34-40-38-10 12-32 14-48 4-14 12-36 14-50 2-14 8-26 18-34 30z"
          fill="var(--av-hair)"
        />
        <path d="M150 120c6-8 16-10 24-4M206 110c8-6 18-6 26 0M244 122c8-2 14 2 18 8" stroke="var(--av-skin)" strokeWidth={3} />
        {/* brows & eyes */}
        <path d="M150 168c10-6 24-6 32 0M218 168c8-6 22-6 32 0" />
        <circle cx="166" cy="192" r="7" fill="var(--av-stroke)" stroke="none" />
        <circle cx="234" cy="192" r="7" fill="var(--av-stroke)" stroke="none" />
        {/* nose, beard, smile */}
        <path d="M200 198c-4 16-8 26 2 30" />
        <path
          d="M126 210c4 46 34 70 74 70s70-24 74-70c-10 18-22 24-36 24-14 0-24-6-38-6s-24 6-38 6c-14 0-26-6-36-24z"
          fill="var(--av-beard)"
          strokeWidth={4}
        />
        <path d="M176 250c14 10 34 10 48 0" stroke="var(--av-skin)" strokeWidth={4} />
      </g>
    </svg>
  );
}
