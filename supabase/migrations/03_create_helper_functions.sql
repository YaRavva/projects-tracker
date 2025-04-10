-- Создаем функцию для получения информации о структуре таблицы
CREATE OR REPLACE FUNCTION public.get_table_info(table_name text)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable boolean,
  column_default text,
  is_primary_key boolean
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.column_name::text,
    c.data_type::text,
    (c.is_nullable = 'YES')::boolean,
    c.column_default::text,
    (pk.constraint_name IS NOT NULL)::boolean
  FROM
    information_schema.columns c
  LEFT JOIN (
    SELECT
      kcu.column_name,
      tc.constraint_name
    FROM
      information_schema.table_constraints tc
    JOIN
      information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE
      tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_name = table_name
      AND tc.table_schema = 'public'
  ) pk ON c.column_name = pk.column_name
  WHERE
    c.table_name = table_name
    AND c.table_schema = 'public'
  ORDER BY
    c.ordinal_position;
END;
$$;

-- Создаем функцию для получения списка таблиц
CREATE OR REPLACE FUNCTION public.get_tables()
RETURNS TABLE (table_name text) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.table_name::text
  FROM
    information_schema.tables t
  WHERE
    t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
  ORDER BY
    t.table_name;
END;
$$;

-- Предоставляем права на выполнение функций
GRANT EXECUTE ON FUNCTION public.get_table_info TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_tables TO anon, authenticated, service_role;
