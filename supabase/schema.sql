create extension if not exists "pgcrypto";

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  course_code text,
  semester_label text not null,
  participant_count integer not null default 0 check (participant_count >= 0),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  original_file_name text not null,
  storage_path text not null,
  public_url text not null,
  mime_type text not null,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  material_type text not null default 'pdf' check (material_type in ('pdf', 'docx', 'pptx', 'xlsx', 'link', 'other')),
  uploaded_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.material_distributions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  distributed_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique (material_id, class_id)
);

insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

create index if not exists classes_semester_label_idx on public.classes(semester_label);
create index if not exists materials_uploaded_at_idx on public.materials(uploaded_at desc);
create index if not exists material_distributions_class_id_idx on public.material_distributions(class_id);
create index if not exists material_distributions_material_id_idx on public.material_distributions(material_id);
create index if not exists material_distributions_distributed_at_idx on public.material_distributions(distributed_at desc);
