"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CreditCardIcon } from "@/components/icons";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(100),
  customerPhone: z.string().regex(/^0?\d{10,11}$/, "شماره تلفن معتبر نیست"),
  customerAddress: z.string().min(10, "آدرس باید حداقل ۱۰ کاراکتر باشد").max(500),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  form: UseFormReturn<CheckoutFormData>;
}

export function CheckoutForm({ onSubmit, form }: CheckoutFormProps) {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="customer-name">نام و نام خانوادگی <span className="text-destructive">*</span></Label>
        <Input
          id="customer-name"
          {...form.register("customerName")}
          required
          className="mt-2"
          aria-invalid={form.formState.errors.customerName ? "true" : "false"}
          aria-describedby={form.formState.errors.customerName ? "customer-name-error" : undefined}
        />
        {form.formState.errors.customerName && (
          <p id="customer-name-error" className="text-sm text-destructive" role="alert">
            {form.formState.errors.customerName.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="customer-phone">شماره تماس <span className="text-destructive">*</span></Label>
        <Input
          id="customer-phone"
          type="tel"
          {...form.register("customerPhone")}
          required
          className="mt-2"
          aria-invalid={form.formState.errors.customerPhone ? "true" : "false"}
          aria-describedby={form.formState.errors.customerPhone ? "customer-phone-error" : undefined}
        />
        {form.formState.errors.customerPhone && (
          <p id="customer-phone-error" className="text-sm text-destructive" role="alert">
            {form.formState.errors.customerPhone.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="customer-address">آدرس تحویل <span className="text-destructive">*</span></Label>
        <Textarea
          id="customer-address"
          {...form.register("customerAddress")}
          required
          rows={3}
          className="mt-2"
          aria-invalid={form.formState.errors.customerAddress ? "true" : "false"}
          aria-describedby={form.formState.errors.customerAddress ? "customer-address-error" : undefined}
        />
        {form.formState.errors.customerAddress && (
          <p id="customer-address-error" className="text-sm text-destructive" role="alert">
            {form.formState.errors.customerAddress.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full py-3">
        ادامه به پرداخت
        <CreditCardIcon className="size-5 mr-2" />
      </Button>
    </form>
  );
}