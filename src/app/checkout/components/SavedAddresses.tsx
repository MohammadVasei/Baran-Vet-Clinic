"use client";

import { MapPinIcon, CheckCircleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface SavedAddress {
  id: string;
  label: string | null;
  recipient_name: string;
  recipient_phone: string;
  province: string;
  city: string;
  address_line: string;
  postal_code: string | null;
  is_default: boolean;
}

interface SavedAddressesProps {
  addresses: SavedAddress[];
  selectedId: string | null;
  onSelect: (addr: SavedAddress) => void;
}

export function SavedAddresses({ addresses, selectedId, onSelect }: SavedAddressesProps) {
  return (
    <div className="rounded-app border border-border bg-surface p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-label text-sm text-primary-text">آدرس‌های ذخیره‌شده</h3>
        <a
          href="/account/addresses"
          className="text-sm text-primary-text hover:underline"
        >
          مدیریت آدرس‌ها
        </a>
      </div>
      <div className="flex flex-wrap gap-2">
        {addresses.map((addr) => (
          <button
            key={addr.id}
            type="button"
            onClick={() => onSelect(addr)}
            className={`flex items-center gap-2 px-3 py-2 rounded-app border transition-all ${
              selectedId === addr.id
                ? "border-primary bg-primary/5 text-primary-text"
                : "border-border hover:border-primary/50 text-foreground"
            }`}
          >
            <MapPinIcon className="size-4" />
            <span className="text-sm font-medium">{addr.recipient_name}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {addr.province}، {addr.city}
            </span>
            {addr.is_default && (
              <CheckCircleIcon className="size-3 text-green-600 ml-1" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}