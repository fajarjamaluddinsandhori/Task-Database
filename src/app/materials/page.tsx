import Link from "next/link";

import { deleteMaterialAction } from "@/app/actions/materials";
import { AppShell } from "@/components/app-shell";
import { MaterialForm } from "@/components/forms/material-form";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listDistributionEntities } from "@/lib/repositories/distributions";
import { listMaterialEntities } from "@/lib/repositories/materials";
import { formatBytes, formatOptionalDate, getMaterialTypeLabel } from "@/lib/utils";

interface MaterialsPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";

export default async function MaterialsPage({ searchParams }: MaterialsPageProps) {
  const params = (await searchParams) ?? {};
  const editId = typeof params.edit === "string" ? params.edit : undefined;

  const [materials, distributions] = await Promise.all([
    listMaterialEntities(),
    listDistributionEntities(),
  ]);

  const selectedMaterial = materials.find((item) => item.id === editId);

  return (
    <AppShell currentPath="/materials">
      <PageHeader
        eyebrow="Bank materi"
        title="Kelola materi pusat"
        description="Upload satu kali, lalu pakai ulang materi yang sama ke banyak kelas."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedMaterial ? "Edit metadata materi" : "Upload materi baru"}
              </h3>
              <p className="text-sm text-slate-600">
                File akan disimpan ke bucket `materials`, lalu metadata-nya dicatat di tabel `materials`.
              </p>
            </div>

            <MaterialForm
              defaultValue={selectedMaterial}
              submitLabel={selectedMaterial ? "Simpan perubahan" : "Upload materi"}
            />

            {selectedMaterial ? (
              <Link className="text-sm text-sky-600 hover:underline" href="/materials">
                Batal edit
              </Link>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Daftar materi</h3>
              <p className="text-sm text-slate-600">
                Materi disimpan sebagai aset pusat dan bisa dipakai ulang melalui distribusi.
              </p>
            </div>

            {materials.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Belum ada materi. Upload file pertama Anda dari panel kiri.
              </p>
            ) : (
              <div className="space-y-3">
                {materials.map((item) => {
                  const classCount = new Set(
                    distributions
                      .filter((distribution) => distribution.materialId === item.id)
                      .map((distribution) => distribution.classId),
                  ).size;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{item.title}</p>
                            <Badge tone="info">{getMaterialTypeLabel(item.materialType)}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {item.description || "Tanpa deskripsi"}
                          </p>
                          <div className="mt-3 space-y-1 text-sm text-slate-500">
                            <p>{item.originalFileName}</p>
                            <p>
                              {formatBytes(item.sizeBytes)} • {classCount} kelas • diunggah{" "}
                              {formatOptionalDate(item.uploadedAt)}
                            </p>
                            <a
                              className="text-sky-600 hover:underline"
                              href={item.publicUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Buka file
                            </a>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/materials?edit=${item.id}`}>
                            <Button type="button" variant="secondary">
                              Edit
                            </Button>
                          </Link>
                          <form action={deleteMaterialAction}>
                            <input name="id" type="hidden" value={item.id} />
                            <Button type="submit" variant="ghost">
                              Hapus
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
