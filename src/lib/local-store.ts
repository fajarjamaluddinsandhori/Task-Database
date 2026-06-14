import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Database } from "@/types/database";

type ClassRow = Database["public"]["Tables"]["classes"]["Row"];
type MaterialRow = Database["public"]["Tables"]["materials"]["Row"];
type DistributionRow = Database["public"]["Tables"]["material_distributions"]["Row"];

interface LocalDatabase {
  classes: ClassRow[];
  materials: MaterialRow[];
  materialDistributions: DistributionRow[];
}

const storageDir = path.join(process.cwd(), "storage");
const dbFilePath = path.join(storageDir, "local-db.json");
const publicUploadsDir = path.join(process.cwd(), "public", "uploads");

function getDefaultDatabase(): LocalDatabase {
  return {
    classes: [],
    materials: [],
    materialDistributions: [],
  };
}

async function ensureLocalStorage() {
  await mkdir(storageDir, { recursive: true });
  await mkdir(publicUploadsDir, { recursive: true });
}

export async function readLocalDatabase(): Promise<LocalDatabase> {
  await ensureLocalStorage();

  try {
    const raw = await readFile(dbFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalDatabase>;

    return {
      classes: parsed.classes ?? [],
      materials: parsed.materials ?? [],
      materialDistributions: parsed.materialDistributions ?? [],
    };
  } catch {
    const initial = getDefaultDatabase();
    await writeFile(dbFilePath, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
}

export async function writeLocalDatabase(database: LocalDatabase) {
  await ensureLocalStorage();
  await writeFile(dbFilePath, JSON.stringify(database, null, 2), "utf8");
}

export async function mutateLocalDatabase<T>(
  callback: (database: LocalDatabase) => Promise<T> | T,
) {
  const database = await readLocalDatabase();
  const result = await callback(database);
  await writeLocalDatabase(database);
  return result;
}

export function createLocalId() {
  return randomUUID();
}

export async function saveLocalMaterialFile(
  file: File,
  materialId: string,
  currentPath?: string | null,
) {
  await ensureLocalStorage();

  if (currentPath) {
    await removeLocalMaterialFile(currentPath);
  }

  const materialDir = path.join(publicUploadsDir, materialId);
  await mkdir(materialDir, { recursive: true });

  const fileName = `${Date.now()}-${file.name}`;
  const targetPath = path.join(materialDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(targetPath, buffer);

  const relativePath = path
    .join("uploads", materialId, fileName)
    .replaceAll("\\", "/");

  return {
    storagePath: relativePath,
    publicUrl: `/${relativePath}`,
    originalFileName: file.name,
    sizeBytes: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

export async function removeLocalMaterialFile(storagePath: string | null) {
  if (!storagePath) {
    return;
  }

  const targetPath = path.join(process.cwd(), "public", storagePath);

  try {
    await unlink(targetPath);
  } catch {
    return;
  }

  const parentDir = path.dirname(targetPath);

  try {
    await rm(parentDir, { recursive: false });
  } catch {
    return;
  }
}
