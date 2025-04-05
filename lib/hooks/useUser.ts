import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/project';

export function useUser() {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Получаем текущего пользователя при загрузке компонента
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        
        // Получаем текущую сессию
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          setUser(null);
          return;
        }
        
        // Получаем профиль пользователя
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        setUser(profile);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err instanceof Error ? err : new Error('Неизвестная ошибка'));
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
    
    // Подписываемся на изменения аутентификации
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          // Получаем профиль пользователя
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            setUser(null);
          } else {
            setUser(profile);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      
      setIsLoading(false);
    });
    
    // Отписываемся при размонтировании компонента
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      console.log('Начало процесса выхода из системы');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Ошибка при выходе:', error);
        throw error;
      }
      console.log('Успешный выход из системы');
      router.push('/login');
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    }
  };

  return { user, isLoading, error, logout };
} 