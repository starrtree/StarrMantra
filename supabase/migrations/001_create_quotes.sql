create extension if not exists pgcrypto;

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(text) between 1 and 5000),
  author text not null default 'Unknown',
  source text not null default '',
  source_url text not null default '',
  tag text not null default 'Mantra',
  created_at timestamptz not null default now()
);

alter table public.quotes enable row level security;

-- No anonymous policies are created intentionally.
-- The Vercel serverless API uses the Supabase service-role key server-side,
-- so public visitors can read/write only through the protected API.

insert into public.quotes (text, author, source, source_url, tag)
select *
from (
  values
    ('Imagination is more important than knowledge.', 'Albert Einstein', '', '', 'Vision'),
    ('One must still have chaos in oneself to be able to give birth to a dancing star.', 'Friedrich Nietzsche', 'Thus Spoke Zarathustra', '', 'Creative Fire'),
    ('We know what we are, but know not what we may be.', 'William Shakespeare', 'Hamlet', '', 'Becoming'),
    ('The people who are crazy enough to think they can change the world are the ones who do.', 'Apple', 'Think Different', '', 'Change')
) as seed(text, author, source, source_url, tag)
where not exists (select 1 from public.quotes);
