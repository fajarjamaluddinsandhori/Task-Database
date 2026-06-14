import { deleteDistributionAction } from "@/app/actions/distribution";
import { AppShell } from "@/components/app-shell";
import { DistributionForm } from "@/components/forms/distribution-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listClassEntities } from "@/lib/repositories/classes";
import { listDistributionEntities } from "@/lib/repositories/distributions";
import { listMaterialEntities } from "@/lib/repositories/materials";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DistributionPage() {
  const [classes, materials, distributions] = await Promise.all([
    listClassEntities(),
    listMaterialEntities(),
    listDistributionEntities(),
  ]);

  const distributionRows = distributions.map((distribution) => {
    const classItem = classes.find((item) => item.id === distribution.classId);
    const materialItem = materials.find((item) => item.id === distribution.materialId);

    return {
      ...distribution,
      className: classItem?.name ?? "-",
      courseCode: classItem?.courseCode ?? null,
      semesterLabel: classItem?.semesterLabel ?? "-",
      materialTitle: materialItem?.title ?? "-",
      originalFileName: materialItem?.originalFileName ?? "-",
    };
  });

  return (
    <AppShell currentPath="/distribution">
      <PageHeader
        eyebrow="Distribusi materi"
        title="Distribusikan materi ke banyak kelas"
        description="Pilih satu materi, centang beberapa kelas tujuan, lalu simpan relasinya ke tabel `material_distributions`."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Form distribusi</h3>
              <p className="text-sm text-slate-600">
                Satu submit akan membuat beberapa relasi sekaligus tanpa upload ulang file.
              </p>
            </div>

            <DistributionForm classes={classes} materials={materials} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Riwayat distribusi</h3>
              <p className="text-sm text-slate-600">
                Setiap baris adalah satu hubungan antara satu materi dan satu kelas.
              </p>
            </div>

            {distributionRows.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Belum ada distribusi. Pilih materi dan kelas dari panel kiri.
              </p>
            ) : (
              <div className="space-y-3">
                {distributionRows.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{item.materialTitle}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.originalFileName}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          {item.className} • {item.courseCode ?? "Tanpa kode"} • {item.semesterLabel}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Didistribusikan pada {formatDateTime(item.distributedAt)}
                        </p>
                      </div>

                      <form action={deleteDistributionAction}>
                        <input name="id" type="hidden" value={item.id} />
                        <Button type="submit" variant="ghost">
                          Hapus
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
