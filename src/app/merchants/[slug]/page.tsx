import { notFound } from "next/navigation";

import { getMerchantBySlug } from "@/data/merchants";

import { MerchantDetailClient } from "./merchant-detail-client";

export default function MerchantDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const merchant = getMerchantBySlug(params.slug);

  if (!merchant) {
    notFound();
  }

  return <MerchantDetailClient merchant={merchant} />;
}
