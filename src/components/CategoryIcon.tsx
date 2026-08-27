import type { CategoryId } from "@/lib/products";

type Props = {
  category: CategoryId;
  className?: string;
};

const iconClass = "h-6 w-6";

function IconShell({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconClass}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function CategoryIcon({ category, className = "" }: Props) {
  const known =
    category === "celulares" ||
    category === "notebooks" ||
    category === "macbooks" ||
    category === "videojuego" ||
    category === "televisores" ||
    category === "gadgets" ||
    category === "audio";

  return (
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-muted-soft ${className}`}
    >
      {category === "celulares" && (
        <IconShell>
          <rect x="7" y="2.5" width="10" height="19" rx="2" />
          <path d="M11 18.5h2" />
        </IconShell>
      )}
      {category === "notebooks" && (
        <IconShell>
          <rect x="3" y="4" width="18" height="12" rx="1.5" />
          <path d="M2 19h20" />
          <path d="M9 19v-1.5h6V19" />
        </IconShell>
      )}
      {category === "macbooks" && (
        <IconShell>
          <rect x="3.5" y="3.5" width="17" height="11.5" rx="1.5" />
          <path d="M8 18.5h8" />
          <path d="M10.5 15v3.5M13.5 15v3.5" />
          <circle cx="12" cy="9" r="1.2" fill="currentColor" stroke="none" />
        </IconShell>
      )}
      {category === "videojuego" && (
        <IconShell>
          <path d="M6.5 8.5h11a3.5 3.5 0 0 1 3.4 4.3l-.7 2.8A3 3 0 0 1 17.3 18H6.7a3 3 0 0 1-2.9-2.4l-.7-2.8A3.5 3.5 0 0 1 6.5 8.5z" />
          <path d="M9 12v3M7.5 13.5h3" />
          <circle cx="15.5" cy="12.5" r="0.7" fill="currentColor" stroke="none" />
          <circle cx="17.2" cy="14.2" r="0.7" fill="currentColor" stroke="none" />
        </IconShell>
      )}
      {category === "televisores" && (
        <IconShell>
          <rect x="2.5" y="4" width="19" height="12.5" rx="1.5" />
          <path d="M9 20h6M12 16.5V20" />
        </IconShell>
      )}
      {category === "gadgets" && (
        <IconShell>
          <rect x="6" y="2.5" width="12" height="19" rx="3" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 7.5v1.2M12 15.3v1.2M8.5 12H7.3M16.7 12H15.5" />
        </IconShell>
      )}
      {category === "audio" && (
        <IconShell>
          <path d="M4 13.5v-2a8 8 0 0 1 16 0v2" />
          <rect x="2.5" y="12" width="4" height="7" rx="1.5" />
          <rect x="17.5" y="12" width="4" height="7" rx="1.5" />
        </IconShell>
      )}
      {!known && (
        <IconShell>
          <path d="M4 7h16v10H4z" />
          <path d="M8 7V5.5A4 4 0 0 1 12 1.5 4 4 0 0 1 16 5.5V7" />
        </IconShell>
      )}
    </div>
  );
}
