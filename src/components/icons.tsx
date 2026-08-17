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