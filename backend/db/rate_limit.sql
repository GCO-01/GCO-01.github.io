-- VAGGO — rate-limit compartido para la Edge Function de leads.
-- Contador central en Postgres (todas las copias de la función lo consultan).
-- Correr en el SQL Editor de Supabase (una vez). Es idempotente.

create table if not exists public.rate_limit (
  key          text primary key,           -- IP del cliente
  window_start timestamptz not null default now(),
  count        int not null default 0
);
alter table public.rate_limit enable row level security;  -- solo service_role la toca

-- Incrementa el contador de `p_key` dentro de una ventana de `p_window_secs`
-- segundos y devuelve TRUE si sigue bajo el límite `p_max`.
create or replace function public.rate_limit_hit(p_key text, p_max int, p_window_secs int)
returns boolean
language plpgsql
security definer
as $$
declare
  v_count int;
begin
  insert into public.rate_limit (key, window_start, count)
    values (p_key, now(), 1)
  on conflict (key) do update set
    count = case
      when public.rate_limit.window_start > now() - make_interval(secs => p_window_secs)
      then public.rate_limit.count + 1
      else 1 end,
    window_start = case
      when public.rate_limit.window_start > now() - make_interval(secs => p_window_secs)
      then public.rate_limit.window_start
      else now() end
  returning count into v_count;

  return v_count <= p_max;
end;
$$;
