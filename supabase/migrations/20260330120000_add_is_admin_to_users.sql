-- Admin panel: is_admin = true and/or role = 'admin' (see resolveRole in backend).
alter table public.users
  add column if not exists is_admin boolean not null default false;

comment on column public.users.is_admin is 'When true, this user can access /admin (API returns role admin)';
