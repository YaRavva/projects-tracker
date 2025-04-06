-- Удаляем все политики для таблицы profiles
DROP POLICY IF EXISTS "Пользователи могут видеть все профили" ON public.profiles;
DROP POLICY IF EXISTS "Пользователи могут обновлять свой профиль" ON public.profiles;
DROP POLICY IF EXISTS "Разрешить создание профилей" ON public.profiles;
DROP POLICY IF EXISTS "Администраторы могут делать все" ON public.profiles;
DROP POLICY IF EXISTS "Разрешить создание профилей при регистрации" ON public.profiles;

-- Включаем RLS для таблицы profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Создаем простые политики без рекурсии
-- Разрешаем всем видеть все профили
CREATE POLICY "Пользователи могут видеть все профили" ON public.profiles
  FOR SELECT USING (true);

-- Разрешаем пользователям обновлять свой профиль
CREATE POLICY "Пользователи могут обновлять свой профиль" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Разрешаем всем создавать профили (для регистрации новых пользователей)
CREATE POLICY "Разрешить создание профилей" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Разрешаем пользователям удалять свой профиль
CREATE POLICY "Пользователи могут удалять свой профиль" ON public.profiles
  FOR DELETE USING (auth.uid() = id);
