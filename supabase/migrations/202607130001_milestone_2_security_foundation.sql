begin;

-- Canonical application fields. Legacy columns are intentionally retained.
alter table public.applications
    add column if not exists application_date date,
    add column if not exists job_url text,
    add column if not exists location text,
    add column if not exists work_mode text not null default 'unknown',
    add column if not exists employment_type text not null default 'unknown',
    add column if not exists salary_text text,
    add column if not exists source text,
    add column if not exists contact_name text,
    add column if not exists contact_email text,
    add column if not exists notes text,
    add column if not exists next_follow_up_date date,
    add column if not exists created_at timestamptz not null default now(),
    add column if not exists updated_at timestamptz not null default now(),
    add column if not exists user_id uuid;

-- Copy legacy data only when the canonical destination is empty.
do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'applications'
          and column_name = 'applied_date'
    ) then
        execute $copy$
            update public.applications
            set application_date = applied_date
            where application_date is null
              and applied_date is not null
        $copy$;
    end if;

    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'applications'
          and column_name = 'link'
    ) then
        execute $copy$
            update public.applications
            set job_url = link
            where job_url is null
              and link is not null
        $copy$;
    end if;
end
$$;

alter table public.applications
    alter column status set default 'applied',
    alter column user_id set default auth.uid(),
    alter column work_mode set default 'unknown',
    alter column employment_type set default 'unknown',
    alter column updated_at set default now();

update public.applications set work_mode = 'unknown' where work_mode is null;
update public.applications
set employment_type = 'unknown'
where employment_type is null;

alter table public.applications
    alter column work_mode set not null,
    alter column employment_type set not null;

-- NOT VALID preserves legacy rows while enforcing these checks for new and
-- changed rows. Existing null-owned rows remain available for manual review.
do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.applications'::regclass
          and conname = 'applications_user_id_required'
    ) then
        alter table public.applications
            add constraint applications_user_id_required
            check (user_id is not null) not valid;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.applications'::regclass
          and conname = 'applications_user_id_fkey'
    ) then
        alter table public.applications
            add constraint applications_user_id_fkey
            foreign key (user_id) references auth.users(id) on delete cascade
            not valid;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.applications'::regclass
          and conname = 'applications_application_date_required'
    ) then
        alter table public.applications
            add constraint applications_application_date_required
            check (application_date is not null) not valid;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.applications'::regclass
          and conname = 'applications_status_contract'
    ) then
        alter table public.applications
            add constraint applications_status_contract
            check (status in (
                'saved', 'applied', 'screening', 'interview',
                'offer', 'rejected', 'withdrawn'
            )) not valid;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.applications'::regclass
          and conname = 'applications_work_mode_contract'
    ) then
        alter table public.applications
            add constraint applications_work_mode_contract
            check (work_mode in ('onsite', 'hybrid', 'remote', 'unknown'));
    end if;

    if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.applications'::regclass
          and conname = 'applications_employment_type_contract'
    ) then
        alter table public.applications
            add constraint applications_employment_type_contract
            check (employment_type in (
                'full-time', 'part-time', 'contract', 'internship',
                'graduate', 'unknown'
            ));
    end if;

    if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.applications'::regclass
          and conname = 'applications_company_length'
    ) then
        alter table public.applications
            add constraint applications_company_length
            check (char_length(trim(company)) between 1 and 200) not valid;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.applications'::regclass
          and conname = 'applications_role_length'
    ) then
        alter table public.applications
            add constraint applications_role_length
            check (char_length(trim(role)) between 1 and 200) not valid;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.applications'::regclass
          and conname = 'applications_job_url_length'
    ) then
        alter table public.applications
            add constraint applications_job_url_length
            check (job_url is null or char_length(trim(job_url)) between 1 and 2048)
            not valid;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conrelid = 'public.applications'::regclass
          and conname = 'applications_contact_email_shape'
    ) then
        alter table public.applications
            add constraint applications_contact_email_shape
            check (
                contact_email is null
                or (
                    char_length(contact_email) <= 320
                    and position('@' in contact_email) > 1
                )
            ) not valid;
    end if;
end
$$;

create or replace function public.set_applications_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
before update on public.applications
for each row execute function public.set_applications_updated_at();

create index if not exists idx_applications_user_application_date
    on public.applications (user_id, application_date desc, created_at desc)
    where user_id is not null;

create index if not exists idx_applications_user_status
    on public.applications (user_id, status)
    where user_id is not null;

create index if not exists idx_applications_user_follow_up
    on public.applications (user_id, next_follow_up_date)
    where user_id is not null and next_follow_up_date is not null;

alter table public.applications enable row level security;

drop policy if exists "Users can view their own applications" on public.applications;
drop policy if exists "Users can insert their own applications" on public.applications;
drop policy if exists "Users can update their own applications" on public.applications;
drop policy if exists "Users can delete their own applications" on public.applications;
drop policy if exists applications_select_own on public.applications;
drop policy if exists applications_insert_own on public.applications;
drop policy if exists applications_update_own on public.applications;
drop policy if exists applications_delete_own on public.applications;

create policy applications_select_own
on public.applications
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy applications_insert_own
on public.applications
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy applications_update_own
on public.applications
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy applications_delete_own
on public.applications
for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all privileges on table public.applications from anon;
revoke all privileges on table public.applications from public;
revoke all privileges on table public.applications from authenticated;
grant select, insert, update, delete on table public.applications to authenticated;

comment on column public.applications.application_date is
    'Canonical user-entered application date. Replaces legacy applied_date.';
comment on column public.applications.job_url is
    'Canonical original job URL. Replaces legacy link.';
comment on constraint applications_user_id_required on public.applications is
    'Not validated so legacy null-owned rows are preserved; enforced for new or changed rows.';

-- Keep the status, work-mode, and employment-type values synchronized with
-- web/src/constants/application.js.

commit;
