// Объект с переводами
const translations = {
  ru: {
    // Навигация
    'nav-home': 'Главная',
    'nav-docs': 'Документы',
    'nav-download': 'Скачать',
    'nav-guide': 'Руководство',
    'nav-changelog': 'Чейнджлог',
    // Футер
    'footer-description': 'Лучший чит-клиент для Minecraft с мощными функциями.',
    'footer-navigation': 'Навигация',
    'footer-community': 'Сообщество',
    'footer-discord-join': 'Присоединяйся к нашему Discord!',
    'footer-discord-button': 'Войти',
    'footer-copyright': '© 2025 Pasta.xyz. Все права защищены.',
    // index.html
    'hero-description': 'Чит клиент для Minecraft с топовыми обводами, мощными модулями и удобным интерфейсом.',
    'hero-download': 'Скачать',
    'hero-features': 'Возможности',
    'features-title': 'Почему Pasta.xyz?',
    'features-description': 'Всё, что нужно для доминирования на серверах!',
    'features-bypasses': 'Обходы',
    'features-bypasses-desc': 'Надёжные обходы топовых античитов.',
    'features-modules': 'Модули',
    'features-modules-desc': 'Мощные модули для PvP и выживания.',
    'features-visuals': 'Визуалы',
    'features-visuals-desc': 'Красивые HUD и ClickGUI.',
    'features-security': 'Безопасность',
    'features-security-desc': 'Защита от банов и кражи аккаунта.',
    'modules-title': 'Ключевые модули',
    'modules-description': 'Самые нужные функции для игры',
    'modules-killaura-desc': 'Мощная килаура с обходами античитов.',
    'modules-visuals-desc': 'Кастомные HUD и ClickGUI.',
    'modules-speedfly-desc': 'Быстрое перемещение с обходами.',
    'modules-autofarm-desc': 'Автоматизация фарма ресурсов.',
    'menu-title': 'Меню Pasta.xyz',
    'menu-description': 'Обходит сервера: FunTime, HolyWorld, ReallyWorld...',
    // download.html
    'download-description': 'Скачай наш лоадер последней версии и начни доминировать на Funtime, Reallyworld!',
    'download-main-version': 'Основная версия',
    'download-beta-version': 'Бета-версия',
    'download-button': 'Скачать',
    'download-not-available': 'Не доступно',
    'download-version': 'Версия',
    'download-size': 'Размер',
    'download-updated': 'Обновлено',
    // documents.html
    'docs-title': 'Документация',
    'docs-description': 'Всё, что нужно знать о Pasta.xyz!',
    'faq-install': 'Как установить чит?',
    'faq-install-answer': 'Скачай лоадер, войди в аккаунт и запусти клиент.',
    'faq-menu': 'Как открыть меню?',
    'faq-menu-answer': 'Нажми RShift (по умолчанию).',
    'faq-safety': 'Безопасно ли использовать?',
    'faq-safety-answer': 'Да, лоадер чист от вирусов и надёжен.',
    'faq-whatsnew': 'Что нового в последней версии?',
    'faq-whatsnew-answer': 'Смотри чейнджлог в разделе "Документы".',
    // changelog.html
    'changelog-title': 'Чейнджлог',
    'changelog-description': 'Все обновления Pasta.xyz — от новых фич до багфиксов!',
    'changelog-v1.16.5-date': '2025-04-17',
    'changelog-bypasses': 'Добавлены новые обходы античитов',
    'changelog-killaura': 'Улучшена производительность KillAura',
    'changelog-visuals': 'Исправлены баги с визуалами',
  },
  en: {
    // Навигация
    'nav-home': 'Home',
    'nav-docs': 'Docs',
    'nav-download': 'Download',
    'nav-guide': 'Guide',
    'nav-changelog': 'Changelog',
    // Футер
    'footer-description': 'The best cheat client for Minecraft with powerful features.',
    'footer-navigation': 'Navigation',
    'footer-community': 'Community',
    'footer-discord-join': 'Join our Discord!',
    'footer-discord-button': 'Join',
    'footer-copyright': '© 2025 Pasta.xyz. All rights reserved.',
    // index.html
    'hero-description': 'Cheat client for Minecraft with top-notch bypasses, powerful modules, and a user-friendly interface.',
    'hero-download': 'Download',
    'hero-features': 'Features',
    'features-title': 'Why Pasta.xyz?',
    'features-description': 'Everything you need to dominate servers!',
    'features-bypasses': 'Bypasses',
    'features-bypasses-desc': 'Reliable bypasses for top anticheats.',
    'features-modules': 'Modules',
    'features-modules-desc': 'Powerful modules for PvP and survival.',
    'features-visuals': 'Visuals',
    'features-visuals-desc': 'Beautiful HUD and ClickGUI.',
    'features-security': 'Security',
    'features-security-desc': 'Protection against bans and account theft.',
    'modules-title': 'Key Modules',
    'modules-description': 'The most essential features for gameplay',
    'modules-killaura-desc': 'Powerful KillAura with anticheat bypasses.',
    'modules-visuals-desc': 'Custom HUD and ClickGUI.',
    'modules-speedfly-desc': 'Fast movement with bypasses.',
    'modules-autofarm-desc': 'Automation of resource farming.',
    'menu-title': 'Pasta.xyz Menu',
    'menu-description': 'Bypasses servers: FunTime, HolyWorld, ReallyWorld...',
    // download.html
    'download-description': 'Download our latest loader and start dominating on Funtime, Reallyworld!',
    'download-main-version': 'Main Version',
    'download-beta-version': 'Beta Version',
    'download-button': 'Download',
    'download-not-available': 'Not Available',
    'download-version': 'Version',
    'download-size': 'Size',
    'download-updated': 'Updated',
    // documents.html
    'docs-title': 'Documentation',
    'docs-description': 'Everything you need to know about Pasta.xyz!',
    'faq-install': 'How to install the cheat?',
    'faq-install-answer': 'Download the loader, log in, and launch the client.',
    'faq-menu': 'How to open the menu?',
    'faq-menu-answer': 'Press RShift (default).',
    'faq-safety': 'Is it safe to use?',
    'faq-safety-answer': 'Yes, the loader is virus-free and reliable.',
    'faq-whatsnew': 'What\'s new in the latest version?',
    'faq-whatsnew-answer': 'Check the changelog in the "Docs" section.',
    // changelog.html
    'changelog-title': 'Changelog',
    'changelog-description': 'All Pasta.xyz updates — from new features to bug fixes!',
    'changelog-v1.16.5-date': '04/17/2025',
    'changelog-bypasses': 'Added new anticheat bypasses',
    'changelog-killaura': 'Improved KillAura performance',
    'changelog-visuals': 'Fixed bugs with visuals',
  }
};

// Функция для применения перевода
function applyTranslation(lang) {
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });

  // Обновляем текст кнопки language-toggle
  const toggle = document.querySelector('.language-toggle');
  toggle.innerHTML = `<i class="fas fa-globe"></i> ${lang.toUpperCase()}`;

  // Обновляем lang атрибут HTML
  document.documentElement.lang = lang;
}

// Загрузка сохраненного языка или установка RU по умолчанию
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('language') || 'ru';
  applyTranslation(savedLang);

  // Обработка кликов по языковому меню
  document.querySelectorAll('.language-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = link.getAttribute('data-lang');
      localStorage.setItem('language', lang);
      applyTranslation(lang);
    });
  });
});