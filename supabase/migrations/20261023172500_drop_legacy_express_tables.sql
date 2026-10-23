-- Executado pelo SQL Editor em 23/10/2026: remove as tabelas do Diagnóstico Express migrado do Base44.
drop table if exists public.case_entries, public.case_documents, public.consulting_cases cascade;
drop function if exists public.new_id();
drop function if exists public.touch_updated_date();
