type LogoutSuccessIconProps = {
  className?: string;
};

export function LogoutSuccessIcon({ className }: LogoutSuccessIconProps) {
  return (
    <svg
      width={56}
      height={56}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  );
}
