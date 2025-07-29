-- Function to get column names and data types for a given table
-- SECURITY INVOKER: Ensures the function runs with the permissions of the calling user.
-- This is a safe, read-only function that queries schema metadata and does not access table data.
create or replace function get_columns(p_table_name text)
returns table(column_name text, data_type text)
language sql
security invoker
as $$
    select column_name::text, data_type::text
    from information_schema.columns
    where table_name = p_table_name;
$$;
