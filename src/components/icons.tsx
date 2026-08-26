import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function PawIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <ellipse cx="6" cy="8.2" rx="2.2" ry="2.5" />
      <ellipse cx="11.2" cy="5.8" rx="2.2" ry="2.5" />
      <ellipse cx="16.4" cy="8.2" rx="2.2" ry="2.5" />
      <ellipse cx="4.2" cy="13.4" rx="2" ry="2.4" />
      <ellipse cx="19.8" cy="13.4" rx="2" ry="2.4" />
      <path d="M12 12.4c2.9 0 6 1.6 6 4.5 0 2-1.6 3.1-3.5 3.1-1.4 0-2-.5-2.5-.9-.5.4-1.1.9-2.5.9C7.6 20 6 18.9 6 16.9c0-2.9 3.1-4.5 6-4.5Z" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M5.5 4h3l1.5 4-2 1.3a12 12 0 0 0 6.7 6.7l1.3-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3.5 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 21s-6.5-5.4-6.5-10A6.5 6.5 0 0 1 12 4.5 6.5 6.5 0 0 1 18.5 11c0 4.6-6.5 10-6.5 10Z" />
      <circle cx="12" cy="11" r="2.4" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M4 6.5h16M4 12h16M4 17.5h10" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ChevronUpIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  );
}

/** RTL-aware arrow — points to the inline-end ("forward" in the current direction). */
export function ArrowIcon(props: IconProps & { direction?: "forward" | "back" }) {
  const { direction = "forward", ...rest } = props;
  const flip = direction === "forward";
  return (
    <svg {...stroke} {...rest}>
      <path d={flip ? "m19 12-7-7m7 7-7 7m7-7H5" : "m5 12 7-7m-7 7 7 7M5 12h14"} />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <path d="M17 7h.01" />
    </svg>
  );
}

export function TelegramIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="m21 4-3.2 16-6-4.5-3.8 1.6L8 15.5 17 8l-12 6.3L3.5 12 21 4Z" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5Z" />
      <path d="M8.7 9.2c.3 2.4 2.1 4.1 4.6 4.9l.7-1.4a.5.5 0 0 1 .6-.2l1.6.8c.3.1.4.4.3.6-.2.7-.8 1.7-1.7 1.4-2.3-.9-4.6-2.7-5.6-5-.6-.8.2-2 1.1-1.8 0 .4.6 1.1.6 2a2 2 0 0 1-.2 1.2c-.3.5-.4.4-.3.1l.3-.9Z" />
    </svg>
  );
}

export function HeartPulseIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 20s-7-4.6-7-10a4.5 4.5 0 0 1 7-3.6A4.5 4.5 0 0 1 19 10c0 5.4-7 10-7 10Z" />
      <path d="M3.5 12h4l1.5-3 2.5 6 2-4h7" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 21s-6.5-5.4-6.5-10A6.5 6.5 0 0 1 12 4.5 6.5 6.5 0 0 1 18.5 11c0 4.6-6.5 10-6.5 10Z" />
      <circle cx="12" cy="11" r="2.4" />
    </svg>
  );
}

export function ThreadsIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1.5-12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm4 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-8 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <polygon points="22 3 2 3 10 12.46 2 21 22 21 10 12.46 22 3" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function LogOutIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <svg {...stroke} {...props}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5a2.121 2.121 0 0 1 3 3z" />
    </svg>
  );
}