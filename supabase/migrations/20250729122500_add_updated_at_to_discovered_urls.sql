alter table discovered_urls
add column updated_at timestamptz default now();
