// Мокап данные для тестовых проектов
const mockProjects = [
  {
    title: "Умный дом на Arduino",
    description: "Проект системы умного дома с использованием Arduino и датчиков. Включает управление освещением, температурой и безопасностью.",
    status: "completed",
    progress: 100,
    deadline: new Date(2023, 11, 15).toISOString(), // 15 декабря 2023
    repository_url: "https://github.com/example/smart-home-arduino",
    demo_url: "https://example.com/smart-home-demo",
    team_members: [
      { name: "Иван Петров", class: "11А", isLeader: true },
      { name: "Мария Сидорова", class: "11А", isLeader: false }
    ]
  },
  {
    title: "Мобильное приложение для учета расходов",
    description: "Приложение для учета личных финансов с возможностью категоризации расходов и построения графиков.",
    status: "active",
    progress: 75,
    deadline: new Date(2024, 5, 20).toISOString(), // 20 июня 2024
    repository_url: "https://github.com/example/expense-tracker",
    demo_url: null,
    team_members: [
      { name: "Алексей Смирнов", class: "10Б", isLeader: true },
      { name: "Екатерина Иванова", class: "10Б", isLeader: false }
    ]
  },
  {
    title: "Веб-сайт школьной библиотеки",
    description: "Разработка веб-сайта для школьной библиотеки с каталогом книг и системой бронирования.",
    status: "active",
    progress: 60,
    deadline: new Date(2024, 4, 10).toISOString(), // 10 мая 2024
    repository_url: "https://github.com/example/school-library",
    demo_url: "https://example.com/library-demo",
    team_members: [
      { name: "Дмитрий Козлов", class: "9В", isLeader: true },
      { name: "Анна Морозова", class: "9В", isLeader: false },
      { name: "Павел Соколов", class: "9В", isLeader: false }
    ]
  },
  {
    title: "Игра-платформер на Unity",
    description: "2D игра-платформер с оригинальным дизайном уровней и персонажей.",
    status: "pending",
    progress: 30,
    deadline: new Date(2024, 7, 5).toISOString(), // 5 августа 2024
    repository_url: "https://github.com/example/unity-platformer",
    demo_url: null,
    team_members: [
      { name: "Сергей Новиков", class: "11Г", isLeader: true },
      { name: "Ольга Федорова", class: "11Г", isLeader: false }
    ]
  },
  {
    title: "Система распознавания лиц",
    description: "Проект по компьютерному зрению с использованием OpenCV для распознавания лиц и эмоций.",
    status: "returned",
    progress: 45,
    deadline: new Date(2024, 3, 25).toISOString(), // 25 апреля 2024
    repository_url: "https://github.com/example/face-recognition",
    demo_url: null,
    team_members: [
      { name: "Максим Волков", class: "10А", isLeader: true },
      { name: "Юлия Соловьева", class: "10А", isLeader: false }
    ]
  },
  {
    title: "Чат-бот для школьного сайта",
    description: "Разработка чат-бота для ответов на часто задаваемые вопросы о школе.",
    status: "rejected",
    progress: 20,
    deadline: new Date(2024, 2, 15).toISOString(), // 15 марта 2024
    repository_url: null,
    demo_url: null,
    team_members: [
      { name: "Артем Лебедев", class: "9Б", isLeader: true }
    ]
  },
  {
    title: "Мобильное приложение для изучения языков",
    description: "Приложение для изучения иностранных языков с использованием игровых механик и системы достижений.",
    status: "pending",
    progress: 10,
    deadline: new Date(2024, 8, 30).toISOString(), // 30 сентября 2024
    repository_url: "https://github.com/example/language-learning-app",
    demo_url: null,
    team_members: [
      { name: "Наталья Кузнецова", class: "11Б", isLeader: true },
      { name: "Игорь Попов", class: "11Б", isLeader: false },
      { name: "Вера Андреева", class: "11Б", isLeader: false }
    ]
  },
  {
    title: "Система автоматического полива растений",
    description: "Проект системы автоматического полива растений с использованием Arduino и датчиков влажности почвы.",
    status: "completed",
    progress: 100,
    deadline: new Date(2023, 9, 10).toISOString(), // 10 октября 2023
    repository_url: "https://github.com/example/auto-watering",
    demo_url: "https://example.com/watering-demo",
    team_members: [
      { name: "Кирилл Орлов", class: "8А", isLeader: true },
      { name: "Софья Белова", class: "8А", isLeader: false }
    ]
  },
  {
    title: "Виртуальная экскурсия по школе",
    description: "Создание виртуальной 3D-экскурсии по школе с использованием технологий WebGL и панорамных фотографий.",
    status: "active",
    progress: 85,
    deadline: new Date(2024, 1, 28).toISOString(), // 28 февраля 2024
    repository_url: "https://github.com/example/school-tour",
    demo_url: "https://example.com/school-tour-demo",
    team_members: [
      { name: "Денис Макаров", class: "10В", isLeader: true },
      { name: "Елена Титова", class: "10В", isLeader: false }
    ]
  },
  {
    title: "Образовательная игра по математике",
    description: "Разработка игры для изучения математики в начальной школе с интерактивными заданиями и системой наград.",
    status: "returned",
    progress: 50,
    deadline: new Date(2024, 6, 15).toISOString(), // 15 июля 2024
    repository_url: "https://github.com/example/math-game",
    demo_url: null,
    team_members: [
      { name: "Антон Григорьев", class: "11Д", isLeader: true },
      { name: "Полина Жукова", class: "11Д", isLeader: false }
    ]
  }
];

// Рассчитываем прогресс для каждого проекта на основе завершенных этапов
mockProjects.forEach(project => {
  // Добавляем этапы проекта, если их нет
  if (!project.stages) {
    project.stages = [
      { name: "Планирование", completed: project.progress >= 25 },
      { name: "Разработка", completed: project.progress >= 50 },
      { name: "Тестирование", completed: project.progress >= 75 },
      { name: "Завершение", completed: project.progress >= 100 }
    ];
  }

  // Пересчитываем прогресс на основе этапов
  const completedStages = project.stages.filter(stage => stage.completed).length;
  const totalStages = project.stages.length;
  project.progress = Math.round((completedStages / totalStages) * 100);

  // Изменяем формат имен на "Фамилия Имя"
  if (project.team_members) {
    project.team_members.forEach(member => {
      if (member.name && member.name.includes(' ')) {
        const parts = member.name.split(' ');
        if (parts.length === 2) {
          member.name = `${parts[1]} ${parts[0]}`;
        }
      }
    });
  }
});

module.exports = { mockProjects };
