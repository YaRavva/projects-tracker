import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import StatusBarChart from '../components/analytics/StatusBarChart';
import ProgressCards from '../components/analytics/ProgressCards';
import ProjectHeatmap from '../components/analytics/ProjectHeatmap';
import ProjectFunnel from '../components/analytics/ProjectFunnel';
import RadialProgress from '../components/analytics/RadialProgress';
import ActivityGraph from '../components/analytics/ActivityGraph';
import ProjectStats from '../components/analytics/ProjectStats';
import StatsCard from '../components/analytics/StatsCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    averageProgress: 0,
    totalUsers: 0,
    projectsThisMonth: 0,
    projectsLastMonth: 0
  });

  const [progressData, setProgressData] = useState([
    { name: 'Завершено', value: 0, color: '#00ff9d' },
    { name: 'В процессе', value: 0, color: '#7dffcb' },
    { name: 'Не начато', value: 0, color: '#8892b0' },
  ]);

  const [activityData, setActivityData] = useState([
    { date: '01.01', projects: 0, completed: 0 },
    { date: '01.02', projects: 0, completed: 0 },
    { date: '01.03', projects: 0, completed: 0 },
    { date: '01.04', projects: 0, completed: 0 },
    { date: '01.05', projects: 0, completed: 0 },
    { date: '01.06', projects: 0, completed: 0 },
  ]);

  const [projectStatsData, setProjectStatsData] = useState([
    { name: 'Январь', value: 0 },
    { name: 'Февраль', value: 0 },
    { name: 'Март', value: 0 },
    { name: 'Апрель', value: 0 },
    { name: 'Май', value: 0 },
    { name: 'Июнь', value: 0 },
  ]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Получаем все проекты
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*');

        if (projectsError) throw projectsError;

        // Получаем всех пользователей
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('*');

        if (usersError) throw usersError;

        // Рассчитываем статистику
        const totalProjects = projects?.length || 0;
        const completedProjects = projects?.filter(p => p.progress === 100)?.length || 0;
        const inProgressProjects = projects?.filter(p => p.progress > 0 && p.progress < 100)?.length || 0;

        // Рассчитываем количество проектов по статусам
        const activeProjects = projects?.filter(p => p.status === 'active')?.length || 0;
        const pendingProjects = projects?.filter(p => p.status === 'pending')?.length || 0;
        const returnedProjects = projects?.filter(p => p.status === 'returned')?.length || 0;
        const rejectedProjects = projects?.filter(p => p.status === 'rejected')?.length || 0;

        // Средний прогресс
        const totalProgress = projects?.reduce((acc, project) => acc + (project.progress || 0), 0) || 0;
        const averageProgress = totalProjects > 0 ? Math.round(totalProgress / totalProjects) : 0;

        // Количество пользователей
        const totalUsers = users?.length || 0;

        // Проекты за текущий и прошлый месяц
        const now = new Date();
        const currentMonth = now.getMonth();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const currentYear = now.getFullYear();
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const projectsThisMonth = projects?.filter(p => {
          const createdAt = new Date(p.created_at);
          return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
        })?.length || 0;

        const projectsLastMonth = projects?.filter(p => {
          const createdAt = new Date(p.created_at);
          return createdAt.getMonth() === lastMonth && createdAt.getFullYear() === lastMonthYear;
        })?.length || 0;

        // Обновляем состояние
        setStats({
          totalProjects,
          completedProjects,
          inProgressProjects,
          averageProgress,
          totalUsers,
          projectsThisMonth,
          projectsLastMonth
        });

        // Данные для графика статусов проектов
        setProgressData([
          { name: 'Активный', value: activeProjects, color: '#00ff9d' },
          { name: 'На рассмотрении', value: pendingProjects, color: '#7dffcb' },
          { name: 'Возвращен', value: returnedProjects, color: '#ffcc00' },
          { name: 'Отклонен', value: rejectedProjects, color: '#ff6b6b' },
        ]);

        // Данные для графика активности
        // Здесь мы создаем данные за последние 6 месяцев
        const activityData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date();
          monthDate.setMonth(monthDate.getMonth() - i);
          const month = monthDate.getMonth();
          const year = monthDate.getFullYear();

          const monthProjects = projects?.filter(p => {
            const createdAt = new Date(p.created_at);
            return createdAt.getMonth() === month && createdAt.getFullYear() === year;
          })?.length || 0;

          const monthCompleted = projects?.filter(p => {
            const createdAt = new Date(p.created_at);
            return createdAt.getMonth() === month && createdAt.getFullYear() === year && p.progress === 100;
          })?.length || 0;

          activityData.push({
            date: `${String(month + 1).padStart(2, '0')}.${String(year).slice(2)}`,
            projects: monthProjects,
            completed: monthCompleted
          });
        }
        setActivityData(activityData);

        // Данные для статистики проектов по месяцам
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                           'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        const projectStatsData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date();
          monthDate.setMonth(monthDate.getMonth() - i);
          const month = monthDate.getMonth();
          const year = monthDate.getFullYear();

          const monthProjects = projects?.filter(p => {
            const createdAt = new Date(p.created_at);
            return createdAt.getMonth() === month && createdAt.getFullYear() === year;
          })?.length || 0;

          projectStatsData.push({
            name: monthNames[month],
            value: monthProjects
          });
        }
        setProjectStatsData(projectStatsData);

      } catch (error) {
        console.error('Ошибка при загрузке данных аналитики:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user]);

  return (
    <ProtectedRoute>
      <Layout title="Аналитика | Digital Projects Tracker">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white">Аналитика проектов</h1>
            <p className="text-gray-300 mt-2">
              Статистика и графики по проектам и активности пользователей
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cryptix-green shadow-glow"></div>
            </div>
          ) : (
            <>
              {/* Карточки со статистикой */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                  title="Всего проектов"
                  value={stats.totalProjects}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                  trend={
                    stats.projectsLastMonth > 0
                      ? {
                          value: Math.round((stats.projectsThisMonth - stats.projectsLastMonth) / stats.projectsLastMonth * 100),
                          isPositive: stats.projectsThisMonth >= stats.projectsLastMonth
                        }
                      : undefined
                  }
                />
                <StatsCard
                  title="Завершенные проекты"
                  value={stats.completedProjects}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatsCard
                  title="Средний прогресс"
                  value={`${stats.averageProgress}%`}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  }
                />
                <StatsCard
                  title="Всего пользователей"
                  value={stats.totalUsers}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  }
                />
              </div>

              {/* Графики */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg p-6 shadow-glass">
                  <h2 className="text-xl font-semibold text-white mb-4">Статусы проектов</h2>
                  <StatusBarChart key={`status-chart-${Date.now()}`} data={progressData} />
                </div>
                <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg p-6 shadow-glass">
                  <h2 className="text-xl font-semibold text-white mb-4">Активность по месяцам</h2>
                  <ActivityGraph key={`activity-graph-${Date.now()}`} data={activityData} />
                </div>
              </div>

              {/* Статистика проектов */}
              <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg p-6 shadow-glass mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Проекты по месяцам</h2>
                <ProjectStats key={`project-stats-${Date.now()}`} data={projectStatsData} />
              </div>

              {/* Альтернативные визуализации статусов проектов */}
              <h2 className="text-2xl font-bold text-white mb-4">Альтернативные визуализации статусов проектов</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg p-6 shadow-glass">
                  <h2 className="text-xl font-semibold text-white mb-4">Карточки статусов</h2>
                  <ProgressCards key={`progress-cards-${Date.now()}`} data={progressData} />
                </div>
                <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg p-6 shadow-glass">
                  <h2 className="text-xl font-semibold text-white mb-4">Тепловая карта проектов</h2>
                  <ProjectHeatmap key={`project-heatmap-${Date.now()}`} data={progressData} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg p-6 shadow-glass">
                  <h2 className="text-xl font-semibold text-white mb-4">Воронка статусов</h2>
                  <ProjectFunnel key={`project-funnel-${Date.now()}`} data={progressData} />
                </div>
                <div className="bg-glass-bg backdrop-blur-md border border-glass-border rounded-lg p-6 shadow-glass">
                  <h2 className="text-xl font-semibold text-white mb-4">Радиальная диаграмма</h2>
                  <RadialProgress key={`radial-progress-${Date.now()}`} data={progressData} />
                </div>
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AnalyticsPage;
