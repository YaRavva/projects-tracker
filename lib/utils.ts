export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
}

export function calculateDaysLeft(deadlineString: string): number {
  // Проверяем, что строка не пустая
  if (!deadlineString) return 0;

  try {
    // Пробуем парсить дату в формате дд.мм.гг
    let deadline: Date;

    if (deadlineString.includes('.')) {
      // Если дата в формате дд.мм.гг
      const parts = deadlineString.split('.');
      if (parts.length === 3) {
        let year = parts[2];
        if (year.length === 2) year = '20' + year;
        deadline = new Date(`${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
      } else {
        deadline = new Date(deadlineString);
      }
    } else {
      // Если дата в другом формате (ISO, и т.д.)
      deadline = new Date(deadlineString);
    }

    const today = new Date();

    // Сбрасываем время до 00:00:00
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  } catch (e) {
    console.error('Error calculating days left:', e);
    return 0;
  }
}

export function getDaysLeftText(daysLeft: number): string {
  if (daysLeft < 0) {
    return 'Просрочено';
  }

  if (daysLeft === 0) {
    return 'Сегодня';
  }

  if (daysLeft === 1) {
    return 'Завтра';
  }

  // Склонение для русского языка
  const lastDigit = daysLeft % 10;
  const lastTwoDigits = daysLeft % 100;

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `${daysLeft} день`;
  } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return `${daysLeft} дня`;
  } else {
    return `${daysLeft} дней`;
  }
}

// Функция для проверки, является ли пользователь владельцем проекта
export const isProjectOwner = (userId: string, ownerId: string): boolean => {
  return userId === ownerId;
};

// Функция для проверки, является ли пользователь участником проекта
export const isProjectMember = async (
  projectId: string,
  userId: string,
  supabase: any
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
};

// Функция для получения роли пользователя в проекте
export const getUserProjectRole = async (
  projectId: string,
  userId: string,
  supabase: any
): Promise<string | null> => {
  const { data, error } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.role;
};