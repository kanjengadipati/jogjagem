"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useActiveBusiness } from "@/hooks/useActiveBusiness";

export default function BusinessSectionRedirect({ section }: { section: string }) {
  const { active, loading } = useActiveBusiness();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (active) {
      router.replace(`/business/${active.id}/${section}`);
    } else {
      router.replace("/business/settings");
    }
  }, [active, loading, router, section]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-xs text-stone-400">Mengalihkan...</div>
    </div>
  );
}
