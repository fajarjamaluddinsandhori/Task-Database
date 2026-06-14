import Link from "next/link";

import { deleteClassAction } from "@/app/actions/classes";
import { AppShell } from "@/components/app-shell";
import { ClassForm } from "@/components/forms/class-form";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listClassEntities } from "@/lib/repositories/classes";
import { listDistributionEntities } from "@/lib/repositories/distributions";
import { formatOptionalDate, getClassStatusLabel } from "@/lib/utils";

interface ClassesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";

export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const params = (await searchParams) ?? {};
  const editId = typeof params.edit === "string" ? params.edit : undefined;

  const [classes, distributions] = await Promise.all([
    listClassEntities(),
    listDistributionEntities(),
  ]);

  const selectedClass = classes.find((item) => item.id === editId);

  return (
    <AppShell currentPath="/classes">
      <PageHeader
        eyebrow="Manajemen kelas"
        title="Kelola kelas"
        description="Tambah, ubah, dan hapus kelas yang akan menjadi target distribusi materi."
      />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedClass ? "Edit kelas" : "Tambah kelas baru"}
              </h3>
              <p className="text-sm text-slate-600">
                Isi data minimum agar kelas bisa langsung dipakai pada flow distribusi.
              </p>
            </div>

            <ClassForm
              defaultValue={selectedClass}
              submitLabel={selectedClass ? "Simpan perubahan" : "Tambah kelas"}
            />

            {selectedClass ? (
              <Link className="text-sm text-sky-600 hover:underline" href="/classes">
                Batal edit
              </Link>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Daftar kelas</h3>
              <p className="text-sm text-slate-600">
                Semua kelas yang tersimpan di backend dan siap menerima materi.
              </p>
            </div>

            {classes.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Belum ada kelas. Tambahkan kelas pertama Anda dari panel kiri.
              </p>
            ) : (
              <div className="space-y-3">
                {classes.map((item) => {
                  const distributionCount = distributions.filter(
                    (distribution) => distribution.classId === item.id,
                  ).length;

                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <Badge tone={item.status === "active" ? "success" : "neutral"}>
                              {getClassStatusLabel(item.status)}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {item.courseCode ?? "Tanpa kode"} • {item.semesterLabel}
                          </p>
                          <p className="mt-2 text-sm text-slate-500">
                            {item.participantCount} peserta • {distributionCount} distribusi •
                            dibuat {formatOptionalDate(item.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/classes?edit=${item.id}`}>
                            <Button type="button" variant="secondary">
                              Edit
                            </Button>
                          </Link>
                          <form action={deleteClassAction}>
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
