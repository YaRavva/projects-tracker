-- Удаляем существующие политики для таблицы profiles
DROP POLICY IF EXISTS "Пользователи могут видеть все профили" ON public.profiles;
DROP POLICY IF EXISTS "Пользователи могут обновлять свой профиль" ON public.profiles;
DROP POLICY IF EXISTS "Пользователи могут создавать свой профиль" ON public.profiles;

-- Создаем новые политики для таблицы profiles
-- Разрешаем всем видеть все профили
CREATE POLICY "Пользователи могут видеть все профили" ON public.profiles
  FOR SELECT USING (true);

-- Разрешаем пользователям обновлять свой профиль
CREATE POLICY "Пользователи могут обновлять свой профиль" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Разрешаем всем создавать профили (для регистрации новых пользователей)
CREATE POLICY "Разрешить создание профилей" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Отключаем RLS для таблицы profiles (временно, для отладки)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Создаем политику для администраторов
CREATE POLICY "Администраторы могут делать все" ON public.profiles
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE roles = 'admin'
  ))
  WITH CHECK (auth.uid() IN (
    SELECT id FROM public.profiles WHERE roles = 'admin'
  ));
