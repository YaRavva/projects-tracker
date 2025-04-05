/**
 * Форматирует дату в формат дд.мм.гг
 * @param dateString Строка с датой в формате ISO
 * @returns Отформатированная дата в формате дд.мм.гг
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
};

/**
 * Преобразует дату из формата дд.мм.гг в формат ISO для input type="date"
 * @param dateString Строка с датой в формате дд.мм.гг
 * @returns Дата в формате ISO (YYYY-MM-DD)
 */
export const parseDate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Если дата уже в формате ISO, возвращаем её
  if (dateString.includes('-') && dateString.length === 10) {
    return dateString;
  }
  
  try {
    // Парсим дату в формате дд.мм.гг или дд.мм.гггг
    const parts = dateString.split('.');
    if (parts.length !== 3) return '';
    
    let year = parts[2];
    // Если год двузначный, добавляем 20 в начало
    if (year.length === 2) {
      year = `20${year}`;
    }
    
    // Формируем дату в формате ISO (YYYY-MM-DD)
    return `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  } catch (e) {
    return '';
  }
};

/**
 * Проверяет, просрочена ли дата
 * @param dateString Строка с датой в формате ISO
 * @returns true, если дата в прошлом, false - если в будущем или не указана
 */
export const isOverdue = (dateString: string | null): boolean => {
  if (!dateString) return false;
  
  try {
    const deadline = new Date(dateString);
    const today = new Date();
    
    // Сбрасываем время до 00:00:00
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    
    return deadline < today;
  } catch (e) {
    return false;
  }
};

/**
 * Возвращает количество дней до дедлайна
 * @param dateString Строка с датой в формате ISO
 * @returns Количество дней до дедлайна (отрицательное, если просрочен)
 */
export const daysUntilDeadline = (dateString: string | null): number | null => {
  if (!dateString) return null;
  
  try {
    const deadline = new Date(dateString);
    const today = new Date();
    
    // Сбрасываем время до 00:00:00
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (e) {
    return null;
  }
}; 