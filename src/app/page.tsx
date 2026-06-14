import Link from "next/link";
import { ArrowRight, Database, FolderKanban, Sparkles } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { PageHeader } from "@/components/page-header";
import { SetupBanner } from "@/components/setup-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSetupStatus } from "@/lib/env";
import { listClassEntities } from "@/lib/repositories/classes";
import { listDistributionEntities } from "@/lib/repositories/distributions";
import { listMaterialEntities } from "@/lib/repositories/materials";
import { formatDateTime, formatOptionalDate, getClassStatusLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [setup, classes, materials, distributions] = await Promise.all([
    Promise.resolve(getSetupStatus()),
    listClassEntities(),
    listMaterialEntities(),
    listDistributionEntities(),
  ]);

  const metrics = [
    {
      label: "Jumlah kelas",
      value: String(classes.length),
      helperText: "Kelas yang sudah tersimpan di database.",
    },
    {
      label: "Bank materi",
      value: String(materials.length),
      helperText: "Materi yang bisa dipakai ulang untuk banyak kelas.",
    },
    {
      label: "Distribusi aktif",
      value: String(distributions.length),
      helperText: "Relasi materi-ke-kelas yang sudah tercatat.",
    },
  ];

  const latestDistributions = distributions
    .map((distribution) => {
      const classItem = classes.find((item) => item.id === distribution.classId);
      const materialItem = materials.find((item) => item.id === distribution.materialId);

      return {
        ...distribution,
        className: classItem?.name ?? "-",
        courseCode: classItem?.courseCode ?? null,
        semesterLabel: classItem?.semesterLabel ?? "-",
        materialTitle: materialItem?.title ?? "-",
      };
    })
    .slice(0, 6);

  const mostUsedMaterials = materials
    .map((material) => ({
      ...material,
      classCount: distributions.filter((item) => item.materialId === material.id).length,
    }))
    .sort((a, b) => b.classCount - a.classCount || b.uploadedAt.localeCompare(a.uploadedAt))
    .slice(0, 5);

  const classHighlights = classes.slice(0, 5);

  return (
    <AppShell currentPath="/">
      <PageHeader
        eyebrow="Dashboard dosen"
        title="Ringkasan kerja multi-kelas"
        description={
          setup.mode === "supabase"
            ? "Aplikasi sedang membaca dan menyimpan data langsung ke Supabase, jadi perubahan kelas, materi, dan distribusi sudah tersimpan di backend cloud."
            : "Aplikasi sedang berjalan dalam mode lokal persisten, jadi perubahan kelas, materi, dan distribusi tetap tersimpan langsung di laptop Anda."
        }
      />

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900">
          <CardContent className="relative space-y-6 text-white">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="absolute bottom-0 left-16 h-28 w-28 rounded-full bg-cyan-300/10 blur-2xl" />
            <div className="relative space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
                <Sparkles className="h-3.5 w-3.5" />
                Task Database
              </div>
              <div className="space-y-2">
                <h3 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
                  Upload sekali, distribusikan ke banyak kelas dengan alur yang lebih rapi
                </h3>
                <p className="max-w-2xl text-sm leading-7 text-slate-200">
                  Mode sekarang bisa berjalan langsung di laptop Anda. Jika kredensial Supabase belum ada,
                  aplikasi otomatis menyimpan data dan file secara lokal agar workflow tetap jalan.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/materials">
                  <Button className="gap-2 bg-white text-slate-900 hover:bg-slate-100" type="button">
                    <FolderKanban className="h-4 w-4" />
                    Kelola materi
                  </Button>
                </Link>
                <Link href="/distribution">
                  <Button className="gap-2 border border-white/20 bg-white/10 text-white hover:bg-white/15" type="button">
                    <Database className="h-4 w-4" />
                    Buka distribusi
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">
                  Mode aktif
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                  {setup.mode === "supabase" ? "Cloud sync aktif" : "Penyimpanan lokal aktif"}
                </h3>
              </div>
              <Badge tone={setup.mode === "supabase" ? "success" : "info"}>
                {setup.mode}
              </Badge>
            </div>

            <div className="grid gap-3">
              {[
                {
                  label: "Penyimpanan data",
                  value: setup.mode === "supabase" ? "Supabase PostgreSQL" : "File lokal di project",
                },
                {
                  label: "Penyimpanan file",
                  value: setup.mode === "supabase" ? "Supabase Storage" : "Folder `public/uploads`",
                },
                {
                  label: "Status saat ini",
                  value: setup.message,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <SetupBanner
        setup={{
          ...setup,
          steps:
            setup.mode === "supabase"
              ? [
                  "Supabase aktif dan siap dipakai untuk penyimpanan cloud.",
                  "Lanjutkan upload materi lalu distribusikan ke banyak kelas.",
                  "Jika perlu, tambahkan auth dan RLS setelah flow inti stabil.",
                ]
              : [
                  "Data sekarang otomatis tersimpan ke file lokal di project.",
                  "File materi akan disimpan ke folder `public/uploads` di laptop Anda.",
                  "Isi `.env.local` jika nanti ingin memindahkan persistence ke Supabase cloud.",
                ],
        }}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Distribusi terbaru</h3>
              <p className="text-sm text-slate-600">
                Riwayat terbaru untuk memeriksa materi apa yang sudah dibagikan ke kelas tertentu.
              </p>
            </div>

            {latestDistributions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Belum ada distribusi. Mulai dari upload materi, lalu pilih beberapa kelas tujuan.
              </p>
            ) : (
              <div className="space-y-3">
                {latestDistributions.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{item.materialTitle}</p>
                      <p className="text-sm text-slate-600">
                        {item.className} • {item.courseCode ?? "Tanpa kode"} • {item.semesterLabel}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">{formatDateTime(item.distributedAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Materi paling sering dipakai</h3>
              <p className="text-sm text-slate-600">
                Membantu memilih materi yang paling relevan untuk reuse.
              </p>
            </div>

            {mostUsedMaterials.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Belum ada materi. Tambahkan materi pertama Anda di halaman Materi.
              </p>
            ) : (
              <div className="space-y-3">
                {mostUsedMaterials.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.originalFileName}</p>
                      </div>
                      <Badge tone={item.classCount > 0 ? "success" : "neutral"}>
                        {item.classCount} kelas
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Kelas yang dikelola</h3>
              <p className="text-sm text-slate-600">
                Ringkasan singkat agar mudah memeriksa kelas aktif yang siap menerima materi.
              </p>
            </div>

            {classHighlights.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Belum ada kelas. Tambahkan kelas terlebih dahulu sebelum melakukan distribusi.
              </p>
            ) : (
              <div className="space-y-3">
                {classHighlights.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {item.courseCode ?? "Tanpa kode"} • {item.semesterLabel}
                        </p>
                      </div>
                      <Badge tone={item.status === "active" ? "success" : "neutral"}>
                        {getClassStatusLabel(item.status)}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {item.participantCount} peserta • dibuat {formatOptionalDate(item.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Alur backend yang aktif</h3>
              <p className="text-sm text-slate-600">
                Komponen inti yang sekarang sudah dihubungkan ke backend nyata.
              </p>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              {[
                "CRUD kelas ke tabel `classes`.",
                "Upload file dan metadata materi ke tabel `materials` dan bucket `materials`.",
                "Distribusi satu materi ke banyak kelas melalui `material_distributions`.",
                "Penghapusan data langsung memanggil backend dan me-refresh halaman.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4"
                >
                  <ArrowRight className="mt-0.5 h-4 w-4 text-slate-400" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
