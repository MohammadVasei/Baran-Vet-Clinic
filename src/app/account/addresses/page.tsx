"use client";

import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { MapPinIcon, PhoneIcon, UserIcon, CheckCircleIcon, EditIcon, TrashIcon, PlusIcon } from "@/components/icons";
import { supabaseClient } from "@/lib/supabase-client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Address {
  id: string;
  label: string | null;
  recipient_name: string;
  recipient_phone: string;
  province: string;
  city: string;
  address_line: string;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
}

const AddressSchema = z.object({
  label: z.string().optional(),
  recipient_name: z.string().min(2, "نام گیرنده الزامی است"),
  recipient_phone: z.string().regex(/^0?\d{10,11}$/, "شماره تلفن معتبر نیست"),
  province: z.string().min(2, "استان الزامی است"),
  city: z.string().min(2, "شهر الزامی است"),
  address_line: z.string().min(10, "آدرس کامل الزامی است"),
  postal_code: z.string().optional(),
  is_default: z.boolean().optional(),
});

type AddressForm = z.infer<typeof AddressSchema>;

export default function AccountAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  const form = useForm<AddressForm>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      label: "",
      recipient_name: "",
      recipient_phone: "",
      province: "",
      city: "",
      address_line: "",
      postal_code: "",
      is_default: false,
    },
  });

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".addresses-grid", { once: true, y: 24, delay: 0.1 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced, addresses] }
  );

  useEffect(() => {
    if (!user) return;
    const fetchAddresses = async () => {
      try {
        const { data, error } = await supabaseClient
          .from("customer_addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (!error && data) {
          setAddresses(data);
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [user]);

  const openCreateDialog = () => {
    form.reset({ label: "", recipient_name: "", recipient_phone: "", province: "", city: "", address_line: "", postal_code: "", is_default: false });
    setEditingAddress(null);
    setShowDialog(true);
  };

  const openEditDialog = (address: Address) => {
    form.reset({
      label: address.label || "",
      recipient_name: address.recipient_name,
      recipient_phone: address.recipient_phone,
      province: address.province,
      city: address.city,
      address_line: address.address_line,
      postal_code: address.postal_code || "",
      is_default: address.is_default,
    });
    setEditingAddress(address);
    setShowDialog(true);
  };

  const handleSubmit = async (formData: AddressForm) => {
    setLoading(true);
    try {
      if (editingAddress) {
        const { error } = await supabaseClient
          .from("customer_addresses")
          .update({
            ...formData,
            is_default: formData.is_default,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingAddress.id)
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        if (formData.is_default) {
          await supabaseClient
            .from("customer_addresses")
            .update({ is_default: false, updated_at: new Date().toISOString() })
            .eq("user_id", user!.id)
            .eq("is_default", true);
        }
        const { error } = await supabaseClient
          .from("customer_addresses")
          .insert({
            ...formData,
            user_id: user!.id,
            is_default: formData.is_default,
          });
        if (error) throw error;
      }
      setShowDialog(false);
      setEditingAddress(null);
      // Refetch
      const { data: refetchedData } = await supabaseClient
        .from("customer_addresses")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (refetchedData) setAddresses(refetchedData);
    } catch (err) {
      console.error("Failed to save address:", err);
      alert("خطا در ذخیره آدرس");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("آیا از حذف این آدرس مطمئن هستید؟")) return;
    try {
      const { error } = await supabaseClient
        .from("customer_addresses")
        .delete()
        .eq("id", addressId)
        .eq("user_id", user!.id);
      if (error) throw error;
      setAddresses(addresses.filter((a) => a.id !== addressId));
    } catch (err) {
      console.error("Failed to delete address:", err);
      alert("خطا در حذف آدرس");
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const updates = addresses
        .filter((a) => a.is_default && a.id !== addressId)
        .map((a) =>
          supabaseClient
            .from("customer_addresses")
            .update({ is_default: false, updated_at: new Date().toISOString() })
            .eq("id", a.id)
            .eq("user_id", user!.id)
        );
      updates.push(
        supabaseClient
          .from("customer_addresses")
          .update({ is_default: true, updated_at: new Date().toISOString() })
          .eq("id", addressId)
          .eq("user_id", user!.id)
      );
      const results = await Promise.all(updates);
      if (results.some((r) => r.error)) throw results.find((r) => r.error)!.error;
      // Update local state
      setAddresses(addresses.map((a) => ({
        ...a,
        is_default: a.id === addressId,
      })));
    } catch (err) {
      console.error("Failed to set default:", err);
    }
  };

  return (
    <div ref={root} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 ref={headline} className="font-display text-2xl font-bold text-foreground">آدرس‌های من</h1>
          <p className="text-muted-foreground mt-1">مدیریت آدرس‌های تحویل سفارشات</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon className="size-4 mr-1" />
          افزودن آدرس جدید
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "ویرایش آدرس" : "آدرس جدید"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">برچسب (اختیاری)</Label>
              <Input
                {...form.register("label")}
                id="label"
                placeholder="مثلا: خانه، محل کار"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient_name">نام گیرنده</Label>
              <Input
                {...form.register("recipient_name")}
                id="recipient_name"
                placeholder="محمد محمدی"
              />
              {form.formState.errors.recipient_name && (
                <p className="text-sm text-red-600">{form.formState.errors.recipient_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient_phone">تلفن گیرنده</Label>
              <Input
                {...form.register("recipient_phone")}
                id="recipient_phone"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
              />
              {form.formState.errors.recipient_phone && (
                <p className="text-sm text-red-600">{form.formState.errors.recipient_phone.message}</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="province">استان</Label>
                <Input
                  {...form.register("province")}
                  id="province"
                  placeholder="تهران"
                />
                {form.formState.errors.province && (
                  <p className="text-sm text-red-600">{form.formState.errors.province.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">شهر</Label>
                <Input
                  {...form.register("city")}
                  id="city"
                  placeholder="تهران"
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-red-600">{form.formState.errors.city.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_line">آدرس کامل</Label>
              <Input
                {...form.register("address_line")}
                id="address_line"
                placeholder="خیابان، کوچه، پلاک، واحد"
              />
              {form.formState.errors.address_line && (
                <p className="text-sm text-red-600">{form.formState.errors.address_line.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">کد پستی (اختیاری)</Label>
              <Input
                {...form.register("postal_code")}
                id="postal_code"
                placeholder="۱۲۳۴۵۶۷۸۹۰"
                dir="ltr"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...form.register("is_default")}
                id="is_default"
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="is_default" className="cursor-pointer">
                این آدرس را به عنوان پیش‌فرض قرار دهید
              </Label>
            </div>

            <DialogFooter className="flex-col gap-3">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="w-full">
                انصراف
              </Button>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "در حال ذخیره..." : (editingAddress ? "به‌روزرسانی" : "ذخیره آدرس")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="addresses-grid">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">در حال بارگذاری آدرس‌ها...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16">
            <MapPinIcon className="size-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">آدرسی ثبت نشده است</h3>
            <p className="text-muted-foreground mb-6">برای تسریع تسویه‌حساب، آدرس خود را اضافه کنید</p>
            <Button onClick={openCreateDialog}>
              <PlusIcon className="size-4 mr-1" />
              افزودن آدرس اول
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <div key={address.id} className={`rounded-app-lg border border-border bg-surface p-6 transition-all ${address.is_default ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPinIcon className="size-5 text-primary-text" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {address.label || "بدون برچسب"}
                        {address.is_default && (
                          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary-text">
                            <CheckCircleIcon className="size-3" /> پیش‌فرض
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!address.is_default && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                        title="تعیین به عنوان پیش‌فرض"
                      >
                        <CheckCircleIcon className="size-4" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditDialog(address)}
                      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="ویرایش"
                    >
                      <EditIcon className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="حذف"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <UserIcon className="size-4 text-muted-foreground" />
                    <span className="font-medium">{address.recipient_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="size-4 text-muted-foreground" />
                    <span dir="ltr">{address.recipient_phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="size-4 text-muted-foreground" />
                    <span>{address.province}، {address.city}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="size-4 text-muted-foreground mt-0.5" />
                    <span className="whitespace-pre-wrap text-muted-foreground">{address.address_line}</span>
                  </div>
                  {address.postal_code && (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground dir-ltr">{address.postal_code}</span>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}