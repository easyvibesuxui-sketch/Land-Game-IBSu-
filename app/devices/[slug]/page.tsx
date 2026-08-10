import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { devices, bySlug } from "@/lib/devices";
import DeviceDetail from "@/components/sections/DeviceDetail";

export function generateStaticParams() {
  return devices.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const device = bySlug(slug);
  if (!device) return { title: "syniotec · devices" };
  return {
    title: `${device.name} · syniotec devices`,
    description: device.tagline,
  };
}

export default async function DevicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const device = bySlug(slug);
  if (!device) notFound();

  return <DeviceDetail device={device} />;
}
