type RememberCheckIconProps = {
  indeterminate: boolean | undefined;
  className: string;
};

export function RememberCheckIcon({ className }: RememberCheckIconProps) {
  return <span className={`block size-2 bg-body ${className}`} />;
}
