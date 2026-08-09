-- VAGGO — tabla de leads de la calculadora (Supabase; sirve a Camino C y B).
-- Correr en el SQL Editor de Supabase (una vez). Al correr, elegir "Run and enable RLS".

create table if not exists public.leads (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  grams       int,
  gap         int,
  goal        text,
  age         text,        -- bucket actual (under65/over65)
  training    text,
  activity    text,
  gender      text,        -- rediseño (aún no capturado)
  age_range   text,        -- rediseño (edad granular)
  client_ts   text         -- timestamp enviado por el cliente
);

create index if not exists leads_created_idx on public.leads (created_at desc);
create index if not exists leads_email_idx   on public.leads (email);

-- RLS: activar SIEMPRE. La tabla tiene PII (nombre/email). La Edge Function
-- (service_role) y FastAPI (conexión directa) IGNORAN RLS, así que siguen
-- escribiendo. Sin policies para 'anon', nadie puede leer/escribir con la anon
-- key pública → los leads quedan protegidos.
alter table public.leads enable row level security;
-- (a propósito, NO se crean policies para 'anon' ni 'authenticated')
