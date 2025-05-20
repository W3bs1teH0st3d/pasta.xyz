if (typeof window.supabase === 'undefined') {
    console.error('Supabase not loaded in user.js');
} else {
    console.log('Supabase library loaded in user.js');
}

const supabase = window.supabase.createClient(
    'https://ypfoeackdeyzkmrkytwz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZm9lYWNrZGV5emttcmt5dHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODc5OTQsImV4cCI6MjA1ODM2Mzk5NH0.WkCxdRT8sy6n9VH1owcDgnbCJzjgzm5P5OG1h86eRYg'
);

async function checkAuth() {
    const sessionToken = localStorage.getItem('session_token');
    const storedUsername = localStorage.getItem('username');

    if (!sessionToken || !storedUsername) {
        console.log('Токен или username отсутствуют');
        return null;
    }

    console.log('Проверка авторизации:', { sessionToken, storedUsername });

    try {
        const { data: user, error } = await supabase
            .from('userz')
            .select('id, username')
            .eq('token', sessionToken)
            .eq('username', storedUsername)
            .single();

        if (error || !user) {
            console.error('Ошибка проверки токена:', error || 'Пользователь не найден');
            return null;
        }

        console.log('Авторизация успешна:', user);
        return user;
    } catch (err) {
        console.error('Ошибка сервера при проверке авторизации:', err);
        return null;
    }
}

function logout() {
    const sessionToken = localStorage.getItem('session_token');
    if (sessionToken) {
        supabase
            .from('userz')
            .update({ token: null, token_expires: null })
            .eq('token', sessionToken)
            .then(() => {
                console.log('Токен сброшен в базе');
            })
            .catch(err => console.error('Ошибка сброса токена:', err));
    }
    localStorage.removeItem('session_token');
    localStorage.removeItem('username');
    window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.location.pathname.includes('userpanel')) return;

    const loadingMessage = document.getElementById('loading-message');
    const content = document.getElementById('content');

    // Проверка авторизации
    const userData = await checkAuth();
	if (!userData) {
		console.log('Пользователь не авторизован, редирект на 403.html');
		window.location.href = '/403.html';
		return;
	}

    // Показываем сообщение о загрузке
    loadingMessage.style.display = 'block';
    content.style.display = 'none';

    try {
        // Загрузка данных пользователя
        const { data: user, error } = await supabase
            .from('userz')
            .select('id, username, access_level, created_at, last_login, hwid, expires, token, avatar_url')
            .eq('id', userData.id)
            .single();

        if (error || !user) {
            console.error('Ошибка получения данных пользователя:', error || 'Пользователь не найден');
            logout();
            return;
        }

        // Скрываем загрузку и показываем контент
        loadingMessage.style.display = 'none';
        content.style.display = 'block';

        // Определение уровней доступа
        const accessLevels = {
            0: 'No access',
            1: 'User',
            2: 'Beta tester',
            3: 'Premium',
            4: 'Developer'
        };

        // Заполнение данных пользователя
        document.getElementById('user-uid').textContent = user.id || 'N/A';
        document.getElementById('user-username').textContent = user.username || 'N/A';
        document.getElementById('user-access-level').textContent = accessLevels[user.access_level] || 'No access';
        document.getElementById('user-created-at').textContent = user.created_at ? new Date(user.created_at).toLocaleString('ru-RU') : 'N/A';
        document.getElementById('user-last-login').textContent = user.last_login ? new Date(user.last_login).toLocaleString('ru-RU') : 'Никогда';
        document.getElementById('user-hwid').textContent = user.hwid || 'Не привязан';
        document.getElementById('user-expires').textContent = user.expires ? new Date(user.expires).toLocaleString('ru-RU') : 'Никогда';
        document.getElementById('user-token').textContent = user.token || 'Нет ключа';

        // Обработчики кнопок
        document.getElementById('fanpay-subscribe').addEventListener('click', () => {
            console.log('Клик по кнопке покупки');
            window.location.href = 'https://funpay.com/users/9660555/';
        });

        document.getElementById('download-launcher').addEventListener('click', () => {
            console.log('Клик по кнопке скачивания лаунчера');
            window.location.href = '/download';
        });

        document.getElementById('discord').addEventListener('click', () => {
            console.log('Клик по кнопке Discord');
            window.location.href = 'https://discord.gg/9dMNYANZ';
        });

        const logoutBtn = document.getElementById('logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                console.log('Клик по кнопке выхода');
                logout();
            });
        } else {
            console.warn('Элемент logout не найден в DOM');
        }
    } catch (err) {
        console.error('Ошибка загрузки данных пользователя:', err);
        logout();
    }
});
