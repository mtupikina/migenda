type BookingNoticeProps = {
  message: string | null;
};

export function BookingNotice({ message }: BookingNoticeProps) {
  if (!message) {
    return null;
  }

  return (
    <p className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 border border-accent bg-white px-3 py-2 text-[12px] font-semibold text-accent-700 shadow-[0_8px_24px_color-mix(in_srgb,#201e1d_18%,transparent)]">
      {message}
    </p>
  );
}
