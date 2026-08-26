type TrustIconId = "shipping" | "warranty" | "support";

type Props = {
  id: TrustIconId;
};

export function TrustIcon({ id }: Props) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-primary-softer text-muted">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        {id === "shipping" && (
          <>
            <path d="M3 7.5h11.5v9H8.5" />
            <path d="M14.5 10.5h3.2l2.3 3v3h-5.5v-6z" />
            <circle cx="7" cy="17.5" r="1.7" />
            <circle cx="17.5" cy="17.5" r="1.7" />
          </>
        )}
        {id === "warranty" && (
          <>
            <path d="M12 3.5 5.5 6v5.2c0 4 2.8 7.4 6.5 8.8 3.7-1.4 6.5-4.8 6.5-8.8V6L12 3.5z" />
            <path d="m9.2 12 1.9 1.9 3.7-3.8" />
          </>
        )}
        {id === "support" && (
          <>
            <path d="M5.5 11.5a6.5 6.5 0 0 1 13 0v2.2a2.3 2.3 0 0 1-2.3 2.3h-.7" />
            <path d="M5.5 11.5v2.5a2 2 0 0 0 2 2H9" />
            <path d="M14.5 18.5c0 1.4-1.1 2.5-2.5 2.5h-1" />
            <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          </>
        )}
      </svg>
    </div>
  );
}
