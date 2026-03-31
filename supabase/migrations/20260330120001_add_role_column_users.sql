-- Text role (e.g. 'admin') — backend resolveRole() treats role = 'admin' same as is_admin = true
alter table public.users
  add column if not exists role text not null default 'user';

comment on column public.users.role is 'Use admin or is_admin=true for admin panel access';
