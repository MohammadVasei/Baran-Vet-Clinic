import type { SVGProps } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, Pencil, LogOut , TriangleAlert} from "lucide-react";

/** Pass-through Lucide icons under the project's canonical `XxxIcon` names. */
export { CircleAlert as CircleAlertIcon } from "lucide-react";
export { CircleCheck as CircleCheckIcon } from "lucide-react";
export { CircleX as CircleXIcon } from "lucide-react";
export { TriangleAlert as TriangleAlertIcon } from "lucide-react";
export { Circle as CircleIcon } from "lucide-react";
export { Calendar as CalendarIcon } from "lucide-react";
export { Check as CheckIcon } from "lucide-react";
export { ChevronDown as ChevronDownIcon } from "lucide-react";
export { ChevronLeft as ChevronLeftIcon } from "lucide-react";
export { ChevronRight as ChevronRightIcon } from "lucide-react";
export { ChevronUp as ChevronUpIcon } from "lucide-react";
export { Clock as ClockIcon } from "lucide-react";
export { CreditCard as CreditCardIcon } from "lucide-react";
export { Download as DownloadIcon } from "lucide-react";
export { Eye as EyeIcon } from "lucide-react";
export { EyeOff as EyeOffIcon } from "lucide-react";
export { HeartPulse as HeartPulseIcon } from "lucide-react";
export { Info as InfoIcon } from "lucide-react";
export { Lock as LockIcon } from "lucide-react";
export { Mail as MailIcon } from "lucide-react";
export { MapPin as MapPinIcon } from "lucide-react";
export { Menu as MenuIcon } from "lucide-react";
export { Minus as MinusIcon } from "lucide-react";
export { Moon as MoonIcon } from "lucide-react";
export { Package as PackageIcon } from "lucide-react";
export { PackageCheck as PackageCheckIcon } from "lucide-react";
export { PawPrint as PawPrintIcon } from "lucide-react";
export { Phone as PhoneIcon } from "lucide-react";
export { Plus as PlusIcon } from "lucide-react";
export { RotateCcw as RotateCcwIcon } from "lucide-react";
export { Search as SearchIcon } from "lucide-react";
export { Settings as SettingsIcon } from "lucide-react";
export { ShoppingCart as ShoppingCartIcon } from "lucide-react";
export { Shield as ShieldIcon } from "lucide-react";
export { SlidersHorizontal as SlidersHorizontalIcon } from "lucide-react";
export { Star as StarIcon } from "lucide-react";
export { Sun as SunIcon } from "lucide-react";
export { Tag as TagIcon } from "lucide-react";
export { Trash2 as TrashIcon } from "lucide-react";
export { Truck as TruckIcon } from "lucide-react";
export { Upload as UploadIcon } from "lucide-react";
export { UserRound as UserRoundIcon } from "lucide-react";
export { X as XIcon } from "lucide-react";

/* --- local definitions: Lucide icons that the wrappers below reference --- */
export const ArrowLeftIcon = ArrowLeft;
export const ArrowRightIcon = ArrowRight;
export const PencilIcon = Pencil;
export const LogOutIcon = LogOut;

/** Directional "back"/"forward" button: back points left, forward points right. */
export function ArrowIcon(props: SVGProps<SVGSVGElement> & { direction?: "forward" | "back" }) {
  const { direction = "forward", ...rest } = props;
  return direction === "back"
    ? <ArrowLeftIcon {...rest} />
    : <ArrowRightIcon {...rest} />;
}

/** Loading spinner: injects `animate-spin` so callers do not need it. */
export function LoaderCircleIcon(props: SVGProps<SVGSVGElement>) {
  return <LoaderCircle {...props} className={`animate-spin${props.className ? " " + props.className : ""}`} />;
}

/* --- brand marks: Lucide ships no brand icons, so the originals are kept. --- */
export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <path d="M17 7h.01" />
    </svg>
  );
}

export function TelegramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m21 4-3.2 16-6-4.5-3.8 1.6L8 15.5 17 8l-12 6.3L3.5 12 21 4Z" />
    </svg>
  );
}

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5Z" />
      <path d="M8.7 9.2c.3 2.4 2.1 4.1 4.6 4.9l.7-1.4a.5.5 0 0 1 .6-.2l1.6.8c.3.1.4.4.3.6-.2.7-.8 1.7-1.7 1.4-2.3-.9-4.6-2.7-5.6-5-.6-.8.2-2 1.1-1.8 0 .4.6 1.1.6 2a2 2 0 0 1-.2 1.2c-.3.5-.4.4-.3.1l.3-.9Z" />
    </svg>
  );
}

export function ThreadsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1.5-12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm4 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-8 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
    </svg>
  );
}
