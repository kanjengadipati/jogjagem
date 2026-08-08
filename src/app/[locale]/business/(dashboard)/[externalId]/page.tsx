"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

export default function BusinessExternalIdRedirect() {
  const params = useParams();
  const router = useRouter();
  const externalId = typeof params?.externalId === "string" ? params.externalId : "";

  useEffect(() => {
    if (!externalId) {
      router.replace("/business/settings");
      return;
    }
    router.replace(`/business/${externalId}/dashboard`);
  }, [externalId, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-xs text-stone-400">Mengalihkan ke dashboard...</div>
    </div>
  );
}
