"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { InfoIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ADMIN_HELP } from "@/lib/admin-help";

export function PageHelp({ id }: { id: string }) {
  const entry = ADMIN_HELP[id];
  if (!entry) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`راهنمای این صفحه: ${entry.title}`}
          title="راهنمای این صفحه"
          className="inline-flex items-center justify-center size-8 rounded-full shrink-0 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <InfoIcon className="size-5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold">{entry.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 px-1 text-sm leading-7 text-foreground">
          {entry.sections.map((section, index) => (
            <section key={index} className="space-y-1">
              {section.heading && (
                <h4 className="font-semibold text-foreground">{section.heading}</h4>
              )}
              <p>{section.text}</p>
            </section>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">متوجه شدم</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}