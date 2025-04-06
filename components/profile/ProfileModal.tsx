import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserPassword } = useAuth();
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState<string>('student');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    registrationDate: ''
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUsersList, setShowUsersList] = useState(false);
  const [userName, setUserName] = useState('');

  // Загружаем данные пользователя при открытии модального окна
  useEffect(() => {
    if (isOpen && user) {
      fetchUserProfile();
      fetchUserStats();
      checkAdminRole();
      if (selectedUserId) {
        fetchSelectedUserProfile();
      }
    }
  }, [isOpen, user, selectedUserId]);

  // Получаем имя пользователя из профиля
  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (data && data.full_name) {
          setUserName(data.full_name);
        } else if (user.email) {
          setUserName(user.email);
        } else {
          setUserName('');
        }
      }
    };

    fetchUserName();
  }, [user]);

  // Проверяем, является ли пользователь администратором
  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('roles')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setIsAdmin(data?.roles === 'admin');

      // Если пользователь администратор, загружаем список всех пользователей
      if (data?.roles === 'admin') {
        fetchAllUsers();
      }
    } catch (error) {
      console.error('Ошибка при проверке роли:', error);
    }
  };

  // Загружаем список всех пользователей
  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, roles, created_at')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
    }
  };

  // Загружаем профиль выбранного пользователя
  const fetchSelectedUserProfile = async () => {
    if (!selectedUserId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, roles')
        .eq('id', selectedUserId)
        .single();

      if (error) throw error;
      if (data) {
        setFullName(data.full_name || '');
        setUserRole(data.roles || 'student');
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля выбранного пользователя:', error);
    }
  };

  // Получаем профиль пользователя
  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', selectedUserId || user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setFullName(data.full_name || '');
      }
    } catch (error) {
      console.error('Ошибка при загрузке профиля:', error);
    }
  };

  // Получаем статистику пользователя
  const fetchUserStats = async () => {
    try {
      // Получаем дату регистрации
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      // Форматируем дату регистрации
      const registrationDate = userData?.created_at
        ? new Date(userData.created_at).toLocaleDateString('ru-RU')
        : 'Н/Д';

      // Получаем проекты пользователя
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, progress')
        .eq('owner_id', user?.id);

      if (projectsError) throw projectsError;

      // Считаем статистику
      const totalProjects = projectsData?.length || 0;
      const completedProjects = projectsData?.filter(p => p.progress === 100)?.length || 0;
      const inProgressProjects = totalProjects - completedProjects;

      setStats({
        totalProjects,
        completedProjects,
        inProgressProjects,
        registrationDate
      });
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
    }
  };

  // Обновляем имя пользователя
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNameSuccess(false);
    setPasswordSuccess(false);

    try {
      const updateData: any = { full_name: fullName };

      // Если это администратор и выбран другой пользователь, обновляем также роль
      if (isAdmin && selectedUserId) {
        updateData.roles = userRole;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', selectedUserId || user?.id);

      if (error) throw error;
      setNameSuccess(true);

      // Обновляем список пользователей, если это администратор
      if (isAdmin) {
        fetchAllUsers();
      }

      // Сбрасываем сообщение об успехе через 3 секунды
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (error: any) {
      setError(error.message || 'Ошибка при обновлении данных');
    } finally {
      setLoading(false);
    }
  };

  // Удаление пользователя
  const handleDeleteUser = async () => {
    if (!selectedUserId || !isAdmin) return;

    // Показываем модальное окно подтверждения
    setShowDeleteConfirm(true);
  };

  // Подтверждение удаления пользователя
  const confirmDeleteUser = async () => {
    if (!selectedUserId || !isAdmin) return;

    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    setLoading(true);
    setError(null);
    setShowDeleteConfirm(false);

    try {
      // Сначала удаляем из таблицы profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUserId);

      if (profileError) throw profileError;

      // Обновляем список пользователей
      fetchAllUsers();

      // Сбрасываем выбранного пользователя
      setSelectedUserId(null);
      setFullName('');

      // Показываем сообщение об успехе
      alert('Пользователь успешно удален');
    } catch (error: any) {
      setError(error.message || 'Ошибка при удалении пользователя');
    } finally {
      setLoading(false);
    }
  };

  // Обновляем пароль пользователя
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNameSuccess(false);
    setPasswordSuccess(false);

    if (!newPassword || !confirmPassword) {
      // Если пароль не введен, обновляем только имя
      await handleUpdateName(e);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    try {
      // Сначала обновляем имя, если оно изменилось
      if (fullName !== userName) {
        const { error: nameError } = await supabase
          .from('profiles')
          .update({ full_name: fullName })
          .eq('id', user?.id);

        if (nameError) throw nameError;
        setNameSuccess(true);
      }

      // Затем обновляем пароль
      const { error } = await updateUserPassword(newPassword);
      if (error) throw error;

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Сбрасываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setNameSuccess(false);
        setPasswordSuccess(false);
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Ошибка при обновлении данных');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cryptix-darker bg-opacity-90 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-[95%] sm:w-[90%] md:w-full max-w-2xl bg-cryptix-darker border border-glass-border rounded-xl overflow-hidden shadow-glow-lg animate-fadeIn" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          {/* Заголовок */}
          <div className="p-6 border-b border-glass-border flex items-center justify-between" style={{ backgroundColor: 'rgba(2, 5, 7, 0.95)' }}>
            <h2 className="text-xl font-bold text-white flex items-center">
              {isAdmin && selectedUserId ? 'Редактирование пользователя' : 'Редактирование профиля'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {/* Информация о пользователе */}
            <div className="mb-6 flex items-center">
              <div className="w-10 h-10 rounded-full bg-cryptix-green/10 border border-cryptix-green/30 flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-cryptix-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{fullName || 'Пользователь'}</h3>
                <p className="text-sm text-gray-400">{selectedUserId ? allUsers.find(u => u.id === selectedUserId)?.email : user?.email}</p>
              </div>
            </div>

            {/* Выбор пользователя для администратора */}
            {isAdmin && (
              <div className="mb-6 relative">
                <div className="flex items-center mb-2">
                  <button
                    type="button"
                    className="flex items-center justify-between w-full px-3 py-2 bg-cryptix-dark border border-glass-border rounded-md text-white"
                    onClick={() => setShowUsersList(!showUsersList)}
                  >
                    <span>Выбрать пользователя</span>
                    <svg className={`w-4 h-4 text-cryptix-green ml-2 transition-transform ${showUsersList ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {showUsersList && (
                  <div className="absolute z-10 w-full mt-1 bg-cryptix-dark border border-glass-border rounded-md shadow-glow-sm max-h-60 overflow-y-auto">
                    <div className="sticky top-0 bg-cryptix-dark p-2 border-b border-glass-border">
                      <input
                        type="text"
                        placeholder="Поиск пользователя..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 bg-cryptix-darker border border-glass-border rounded-md text-white focus:outline-none focus:ring-1 focus:ring-cryptix-green/30"
                      />
                    </div>
                    <ul>
                      {allUsers
                        .filter(u =>
                          u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(user => (
                          <li
                            key={user.id}
                            className={`px-3 py-2 cursor-pointer hover:bg-cryptix-green/10 ${selectedUserId === user.id ? 'bg-cryptix-green/20' : ''}`}
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setShowUsersList(false);
                              fetchSelectedUserProfile();
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-white">{user.full_name || 'Без имени'}</div>
                                <div className="text-xs text-gray-400">{user.email}</div>
                              </div>
                              {user.roles === 'admin' ? (
                                <span className="text-xs px-2 py-1 bg-cryptix-green/20 text-cryptix-green rounded-full">Admin</span>
                              ) : (
                                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">Student</span>
                              )}
                            </div>
                          </li>
                        ))
                      }
                      {allUsers.filter(u =>
                        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 && (
                        <li className="px-3 py-2 text-gray-400 text-center">Пользователи не найдены</li>
                      )}
                    </ul>
                  </div>
                )}

                {selectedUserId && (
                  <div className="mt-2 flex items-center">
                    <span className="text-sm text-gray-400 mr-2">Выбранный пользователь:</span>
                    <span className="text-sm text-cryptix-green">{allUsers.find(u => u.id === selectedUserId)?.full_name}</span>
                    <button
                      type="button"
                      className="ml-2 text-red-400 hover:text-red-300"
                      onClick={() => {
                        setSelectedUserId(null);
                        fetchUserProfile();
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Статистика пользователя */}
            <div className="bg-cryptix-darker border border-glass-border rounded-lg p-4 mb-8">
              <div className="text-sm text-gray-400 mb-2">Статистика пользователя</div>
              <div className="flex flex-wrap justify-between">
                <div className="text-center px-3 py-1">
                  <div className="text-lg font-medium text-cryptix-green">{stats.totalProjects}</div>
                  <div className="text-xs text-gray-400">Всего проектов</div>
                </div>
                <div className="text-center px-3 py-1">
                  <div className="text-lg font-medium text-cryptix-green">{stats.completedProjects}</div>
                  <div className="text-xs text-gray-400">Завершено</div>
                </div>
                <div className="text-center px-3 py-1">
                  <div className="text-lg font-medium text-cryptix-green">{stats.inProgressProjects}</div>
                  <div className="text-xs text-gray-400">В процессе</div>
                </div>
                <div className="text-center px-3 py-1">
                  <div className="text-lg font-medium text-cryptix-green">{stats.registrationDate}</div>
                  <div className="text-xs text-gray-400">Дата регистрации</div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-2 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              if (newPassword && confirmPassword) {
                handleUpdatePassword(e);
              } else {
                handleUpdateName(e);
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Форма изменения имени */}
                <div className="bg-cryptix-darker border border-glass-border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4">Изменить имя</h3>
                  <div className="mb-4">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                      Полное имя
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-cryptix-dark border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30"
                      placeholder="Введите ваше имя"
                    />
                  </div>

                  {/* Выбор роли для администратора */}
                  {isAdmin && selectedUserId && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Роль пользователя
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="userRole"
                            value="student"
                            checked={userRole === 'student'}
                            onChange={() => setUserRole('student')}
                            className="w-4 h-4 text-cryptix-green focus:ring-cryptix-green/30"
                          />
                          <span className="text-gray-300">Student</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="userRole"
                            value="admin"
                            checked={userRole === 'admin'}
                            onChange={() => setUserRole('admin')}
                            className="w-4 h-4 text-cryptix-green focus:ring-cryptix-green/30"
                          />
                          <span className="text-gray-300">Admin</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {nameSuccess && (
                    <div className="text-sm text-cryptix-green">
                      {selectedUserId ? 'Пользователь успешно удален!' : 'Данные успешно обновлены!'}
                    </div>
                  )}
                </div>

                {/* Форма изменения пароля */}
                <div className="bg-cryptix-darker border border-glass-border rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4">Изменить пароль</h3>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Новый пароль
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-cryptix-dark border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30"
                      placeholder="Минимум 6 символов"
                      minLength={6}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Подтвердите пароль
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-cryptix-dark border border-glass-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cryptix-green/30"
                      placeholder="Повторите пароль"
                      minLength={6}
                    />
                  </div>
                  {passwordSuccess && (
                    <div className="text-sm text-cryptix-green">
                      Пароль успешно обновлен!
                    </div>
                  )}
                </div>
              </div>

              {/* Кнопки внизу окна */}
              <div className="flex justify-end space-x-3 border-t border-glass-border pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setFullName(userName || '');
                    setNewPassword('');
                    setConfirmPassword('');
                    onClose();
                  }}
                  className="px-6 py-2 bg-cryptix-dark border border-glass-border rounded-md text-gray-300 hover:text-white hover:border-white/30 transition-all duration-300"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-cryptix-green-dark to-cryptix-green text-black font-medium rounded-md hover:from-cryptix-green hover:to-cryptix-green-dark transition-all duration-300 shadow-glow-sm"
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
                {isAdmin && selectedUserId && (
                  <button
                    type="button"
                    onClick={handleDeleteUser}
                    disabled={loading}
                    className="px-6 py-2 bg-red-900/50 border border-red-800/50 text-red-400 rounded-md hover:bg-red-900/70 hover:text-red-300 transition-all duration-300"
                  >
                    Удалить
                  </button>
                )}
              </div>
            </form>

            {/* Модальное окно подтверждения удаления */}
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center">
                <div className="absolute inset-0 bg-black bg-opacity-70" onClick={() => setShowDeleteConfirm(false)}></div>
                <div className="relative z-10 bg-cryptix-darker border border-glass-border rounded-xl p-6 max-w-md w-full shadow-glow-lg animate-fadeIn">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/30 border border-red-800/50 mb-4">
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Удаление пользователя</h3>
                    <p className="text-gray-300 mb-4">Вы уверены, что хотите удалить пользователя <span className="text-cryptix-green font-medium">{allUsers.find(u => u.id === selectedUserId)?.full_name}</span>?</p>
                    <p className="text-red-400 text-sm mb-6">Это действие нельзя отменить.</p>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-cryptix-dark border border-glass-border rounded-md text-gray-300 hover:text-white hover:border-white/30 transition-all duration-300"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteUser}
                      disabled={loading}
                      className="px-4 py-2 bg-red-900/70 border border-red-800/70 text-white rounded-md hover:bg-red-800 transition-all duration-300"
                    >
                      {loading ? 'Удаление...' : 'Удалить'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
