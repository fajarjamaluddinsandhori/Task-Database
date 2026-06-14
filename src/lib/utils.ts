import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassStatus, MaterialType } from "@/types/domain";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
}

export function formatOptionalDate(dateValue: string | null) {
  if (!dateValue) {
    return "-";
  }

  return formatDate(dateValue);
}

export function formatDateTime(dateValue: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

export function formatOptionalDateTime(dateValue: string | null) {
  if (!dateValue) {
    return "-";
  }

  return formatDateTime(dateValue);
}

export function toDatetimeLocalValue(dateValue: string | null) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function toIsoString(dateValue: string) {
  return new Date(dateValue).toISOString();
}

export function slugifyFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function formatBytes(bytes: number | null) {
  if (!bytes) {
    return "-";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function getClassStatusLabel(status: ClassStatus) {
  const labels = {
    active: "Aktif",
    archived: "Arsip",
  } as const;

  return labels[status];
}

export function getMaterialTypeLabel(type: MaterialType) {
  const labels = {
    pdf: "PDF",
    docx: "DOCX",
    pptx: "PPTX",
    xlsx: "XLSX",
    link: "Link",
    other: "Lainnya",
  } as const;

  return labels[type];
}

export function getSetupSteps(missingKeys: string[]) {
  return [
    "Buat project Supabase baru.",
    "Jalankan file `supabase/schema.sql` di SQL Editor.",
    "Buat bucket publik bernama `materials` jika belum dibuat lewat SQL.",
    `Isi env yang dibutuhkan: ${missingKeys.join(", ") || "tidak ada yang hilang"}.`,
    "Jalankan ulang `npm run dev` setelah env tersimpan.",
  ];
}
