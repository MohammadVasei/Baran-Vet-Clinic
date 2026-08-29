"use client";

import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatPrice } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/lib/supabase-client";
import {
  CheckoutEmptyState,
  OrderItemsList,
  SavedAddresses,
  CheckoutForm,
  OrderSummary,
  BenefitsSection,
  ContactCTA,
  BackToShopLink,
} from "./components";
import { ResumePaymentState, ResumeOrder } from "./components/ResumePaymentState";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(100),
  customerPhone: z.string().regex(/^0?\d{10,11}$/, "شماره تلفن معتبر نیست"),
  customerAddress: z.string().min(10, "آدرس باید حداقل ۱۰ کاراکتر باشد").max(500),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

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

interface CheckoutPageClientProps {
  resumeOrder?: ResumeOrder | null;
}

export function CheckoutPageClient({ resumeOrder = null }: CheckoutPageClientProps) {
  const router = useRouter();
  const {
    state,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getItemCount,
  } = useCart();
  const { user } = useAuth();
  const { items } = state;
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  const [resuming, setResuming] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const handleResumePayment = async () => {
    if (!resumeOrder) return;
    setResuming(true);
    setResumeError(null);
    try {
      const response = await fetch("/api/checkout/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: resumeOrder.id }),
      });
      const result = await response.json();
      if (result.success && result.alreadyPaid) {
        router.push(`/checkout/success?order_id=${resumeOrder.id}`);
      } else if (result.success && result.redirectUrl) {
        router.push(result.redirectUrl);
      } else {
        setResumeError(result.error || "خطا در اتصال به درگاه پرداخت");
      }
    } catch {
      setResumeError("خطا در اتصال به درگاه پرداخت");
    } finally {
      setResuming(false);
    }
  };

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Build default values from user profile + default saved address
  const getDefaultValues = (): CheckoutFormData => {
    const defaults: CheckoutFormData = {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
    };

    // From auth user profile
    if (user) {
      const fullName = user.user_metadata?.full_name || "";
      const phone = user.phone || "";
      if (fullName) defaults.customerName = fullName;
      if (phone) defaults.customerPhone = phone.replace(/^\+98/, "0"); // +98912... -> 0912...
    }

    return defaults;
  };

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (!user) return;
    setLoadingAddresses(true);
    Promise.resolve(
      supabaseClient
        .from("customer_addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })
    ).then(({ data, error }) => {
      if (!error && data) {
        setSavedAddresses(data);
        const def = data.find((a) => a.is_default) ?? data[0];
        if (def) {
          // Pre-fill address if form doesn't already have one from user profile
          const currentAddress = form.getValues("customerAddress");
          if (!currentAddress) {
            form.setValue(
              "customerAddress",
              `${def.province}، ${def.city}، ${def.address_line}`
            );
          }
          // Pre-fill name/phone if not already from profile
          const currentName = form.getValues("customerName");
          const currentPhone = form.getValues("customerPhone");
          if (!currentName) form.setValue("customerName", def.recipient_name);
          if (!currentPhone) form.setValue("customerPhone", def.recipient_phone);
          setSelectedAddressId(def.id);
        }
      }
    }).finally(() => setLoadingAddresses(false));
  }, [user, form]);

  const applyAddress = (addr: SavedAddress) => {
    form.setValue("customerName", addr.recipient_name);
    form.setValue("customerPhone", addr.recipient_phone);
    form.setValue(
      "customerAddress",
      `${addr.province}، ${addr.city}، ${addr.address_line}`
    );
    setSelectedAddressId(addr.id);
  };

  const handleFormSubmit = async (data: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
  }) => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customerName: data.customerName.trim(),
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        clearCart(); // Empty cart after successful order
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
        } else if (result.requiresManualPayment) {
          alert(result.message || "سفارش ثبت شد. لطفاً از صفحه سفارشات پرداخت را تکمیل کنید.");
          router.push(`/account/orders?order=${result.orderId}`);
        }
      } else {
        alert(result.error || result.message || "خطا در ایجاد سفارش");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("خطا در اتصال به درگاه پرداخت");
    }
  };

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".checkout-items", { once: true, y: 24, delay: 0.1 }),
        revealUp(".checkout-summary", { once: true, y: 24, delay: 0.2 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced] }
  );

  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const shipping = 0;

  if (items.length === 0) {
    if (resumeOrder) {
      return (
        <ResumePaymentState
          order={resumeOrder}
          onResume={handleResumePayment}
          resuming={resuming}
          error={resumeError}
        />
      );
    }
    return <CheckoutEmptyState />;
  }

  return (
    <section ref={root} id="checkout" className="relative overflow-hidden bg-background py-16 lg:py-24">
      <div className="container-site relative">
        <h1 ref={headline} className="font-display text-3xl font-bold leading-[1.3] text-foreground sm:text-4xl mb-10">
          تسویه‌حساب
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Order Items */}
          <OrderItemsList
            items={items}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
            onClear={clearCart}
          />

          {/* Order Form & Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <SavedAddresses
                addresses={savedAddresses}
                selectedId={selectedAddressId}
                onSelect={applyAddress}
              />
            )}

            <CheckoutForm onSubmit={handleFormSubmit} form={form} />

            {/* Order Summary */}
            <OrderSummary
              itemCount={itemCount}
              subtotal={subtotal}
              shipping={shipping}
            />

            {/* Benefits */}
            <BenefitsSection />

            {/* Contact CTA */}
            <ContactCTA />
          </div>
        </div>

        {/* Back Link */}
        <BackToShopLink />
      </div>
    </section>
  );
}