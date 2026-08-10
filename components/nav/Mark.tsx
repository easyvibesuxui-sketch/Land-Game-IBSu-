/** The chevron-wing mark that sits in the dark square tab, as in the reference. */
export default function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ display: "block" }}
    >
      <path
        d="M3 5.5 L12 13 L21 5.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
      <path
        d="M6.5 10.5 L12 15 L17.5 10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
        opacity="0.62"
      />
      <path
        d="M9.6 15.4 L12 17.4 L14.4 15.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
        opacity="0.3"
      />
    </svg>
  );
}
