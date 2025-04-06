-- Скрипт для проверки и обновления политик безопасности для таблицы profiles

-- Проверяем существующие политики
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  tablename = 'profiles';

-- Проверяем, включен ли RLS для таблицы profiles
SELECT
  tablename,
  rowsecurity
FROM
  pg_tables
WHERE
  tablename = 'profiles';

-- Удаляем все политики для таблицы profiles
DROP POLICY IF EXISTS "Пользователи могут видеть все профили" ON public.profiles;
DROP POLICY IF EXISTS "Пользователи могут обновлять свой профиль" ON public.profiles;
DROP POLICY IF EXISTS "Разрешить создание профилей" ON public.profiles;
DROP POLICY IF EXISTS "Пользователи могут удалять свой профиль" ON public.profiles;
DROP POLICY IF EXISTS "Администраторы могут делать все" ON public.profiles;
DROP POLICY IF EXISTS "Разрешить создание профилей при регистрации" ON public.profiles;

-- Создаем новые политики
-- Разрешаем всем видеть все профили
CREATE POLICY "Пользователи могут видеть все профили" ON public.profiles
  FOR SELECT USING (true);

-- Разрешаем всем обновлять профили (временно для отладки)
CREATE POLICY "Разрешить обновление профилей" ON public.profiles
  FOR UPDATE USING (true);

-- Разрешаем всем создавать профили
CREATE POLICY "Разрешить создание профилей" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Разрешаем всем удалять профили (временно для отладки)
CREATE POLICY "Разрешить удаление профилей" ON public.profiles
  FOR DELETE USING (true);

-- Проверяем, что RLS включен для таблицы profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Проверяем обновленные политики
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  tablename = 'profiles';
