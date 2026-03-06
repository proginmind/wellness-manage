"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CheckoutRedirectToastProps {
  success?: boolean;
  canceled?: boolean;
}

/**
 * Shows a toast when user returns from Stripe Checkout (success or cancel).
 * Clears the query param from URL after showing to avoid repeat toasts on refresh.
 */
export function CheckoutRedirectToast({ success, canceled }: CheckoutRedirectToastProps) {
  const router = useRouter();
  const hasShown = useRef(false);

  useEffect(() => {
    if (hasShown.current) return;
    if (success) {
      hasShown.current = true;
      toast.success("Payment successful", {
        description: "Your subscription has been updated.",
      });
      router.replace("/settings/billing", { scroll: false });
    } else if (canceled) {
      hasShown.current = true;
      toast.info("Checkout canceled", {
        description: "You can try again when you're ready.",
      });
      router.replace("/settings/plans", { scroll: false });
    }
  }, [success, canceled, router]);

  return null;
}
