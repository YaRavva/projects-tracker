import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';
import { ProjectStatus } from '../../../components/projects/ProjectStatusBadge';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Проверяем метод запроса
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Метод не разрешен' });
  }

  try {
    // Получаем текущего пользователя
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    // Проверяем роль пользователя
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ message: 'Ошибка при получении профиля пользователя' });
    }

    // Проверяем, является ли пользователь администратором
    if (profileData?.roles !== 'admin') {
      return res.status(403).json({ message: 'Недостаточно прав для выполнения операции' });
    }

    // Получаем параметры из тела запроса
    const { projectId, action, comment } = req.body;

    if (!projectId || !action) {
      return res.status(400).json({ message: 'Отсутствуют обязательные параметры' });
    }

    // Проверяем, что действие допустимо
    if (!['approve', 'reject', 'return', 'complete'].includes(action)) {
      return res.status(400).json({ message: 'Недопустимое действие' });
    }

    // Проверяем, что комментарий указан для действий reject и return
    if ((action === 'reject' || action === 'return') && !comment) {
      return res.status(400).json({ message: 'Для отклонения или возврата проекта необходимо указать комментарий' });
    }

    // Определяем новый статус в зависимости от действия
    let newStatus: ProjectStatus;
    switch (action) {
      case 'approve':
        newStatus = 'active';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'return':
        newStatus = 'returned';
        break;
      case 'complete':
        newStatus = 'completed';
        break;
      default:
        return res.status(400).json({ message: 'Недопустимое действие' });
    }

    // Обновляем статус проекта
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        status: newStatus,
        review_comment: action !== 'approve' ? comment : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      return res.status(500).json({ message: 'Ошибка при обновлении статуса проекта', error: updateError });
    }

    // Добавляем запись в историю рассмотрения
    const { error: reviewError } = await supabase
      .from('project_reviews')
      .insert([
        {
          project_id: projectId,
          reviewer_id: user.id,
          status: newStatus,
          comment: action !== 'approve' ? comment : null
        }
      ]);

    if (reviewError) {
      return res.status(500).json({ message: 'Ошибка при добавлении записи в историю рассмотрения', error: reviewError });
    }

    // Возвращаем успешный ответ
    return res.status(200).json({
      message: 'Статус проекта успешно обновлен',
      status: newStatus
    });
  } catch (error) {
    console.error('Ошибка при обновлении статуса проекта:', error);
    return res.status(500).json({ message: 'Внутренняя ошибка сервера', error });
  }
}
