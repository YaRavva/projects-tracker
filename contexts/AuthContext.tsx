import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase, signIn, signUp, signOut, resetPassword, updatePassword, signInWithGoogle, signInWithGithub } from '../lib/supabase'
import { Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/router'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any, data: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  updateUserPassword: (password: string) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any, data: any }>
  signInWithGithub: () => Promise<{ error: any, data: any }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  updateUserPassword: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null, data: null }),
  signInWithGithub: async () => ({ error: null, data: null }),
})

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Получаем текущую сессию и устанавливаем слушатель изменений
    const setData = async () => {
      setLoading(true)

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Ошибка при получении сессии:', error.message)
      }

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    setData()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (!error) {
      // Редирект на страницу проектов после успешного входа
      router.push('/projects')
    }

    return { error }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (!error && data?.user) {
      // Создаем запись в таблице profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: email,
            full_name: fullName,
            roles: 'student' // Устанавливаем роль по умолчанию
          }
        ])

      if (profileError) {
        console.error('Ошибка при создании профиля:', profileError)
      } else {
        // Редирект на страницу проектов после успешной регистрации
        router.push('/projects')
      }
    }

    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      return { error }
    } catch (e) {
      console.error('Error during password reset:', e)
      return { error: e }
    }
  }

  const updateUserPassword = async (password: string) => {
    try {
      console.log('Обновление пароля пользователя в AuthContext');

      // Используем напрямую supabase.auth.updateUser вместо функции updatePassword
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('Ошибка при обновлении пароля:', error);
      } else {
        console.log('Пароль успешно обновлен:', data);
      }

      return { error };
    } catch (e) {
      console.error('Исключение при обновлении пароля:', e);
      return { error: e };
    }
  }



  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUserPassword,
    signInWithGoogle,
    signInWithGithub,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }
  return context
}