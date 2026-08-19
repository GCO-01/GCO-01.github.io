-- VAGGO — tabla de aplicaciones al Founding Batch #001 (Supabase; sirve a Camino C y B).
-- Correr en el SQL Editor de Supabase (una vez). Al correr, elegir "Run and enable RLS".

create table if not exists public.batch_001_applications (
  id                        bigint generated always as identity primary key,
  created_at                timestamptz not null default now(),
  full_name                 text not null,
  age                       int not null,
  gender                    text not null,
  address                   text not null,
  email                     text not null,
  lifestyle                 text[] not null,
  goal                      text not null,
  goal_other                text,
  expectations              text not null,
  commit_consume_week       boolean not null,
  commit_whatsapp_checkins  boolean not null,
  commit_final_survey       boolean not null,
  commit_honest_feedback    boolean not null,
  commit_terms_accepted     boolean not null,
  client_ts                 text
);

create index if not exists batch_001_applications_created_idx on public.batch_001_applications (created_at desc);
create index if not exists batch_001_applications_email_idx   on public.batch_001_applications (email);

-- RLS: activar SIEMPRE. La tabla tiene PII (nombre/email/dirección). La Edge Function
-- (service_role) y FastAPI (conexión directa) IGNORAN RLS, así que siguen
-- escribiendo. Sin policies para 'anon', nadie puede leer/escribir con la anon
-- key pública → las aplicaciones quedan protegidas.
alter table public.batch_001_applications enable row level security;
-- (a propósito, NO se crean policies para 'anon' ni 'authenticated')
