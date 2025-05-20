if (typeof window.supabase === 'undefined') {
    console.error('Supabase not loaded in user.js');
} else {
    console.log('Supabase library loaded in user.js');
}



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
    window.location.href = '/auth.html';
}

async function activateKey(userId, key) {
    try {
        const { error } = await supabase
            .from('userz')
            .update({ token: key })
            .eq('id', userId);
        if (error) {
            console.error('Ошибка активации ключа:', error);
            return { success: false, message: 'Ошибка активации ключа' };
        }
        return { success: true, message: 'Ключ успешно активирован' };
    } catch (err) {
        console.error('Неожиданная ошибка:', err);
        return { success: false, message: 'Произошла ошибка' };
    }
}

async function setRam(userId, ram) {
    try {
        const { error } = await supabase
            .from('userz')
            .update({ ram: ram })
            .eq('id', userId);
        if (error) {
            console.error('Ошибка установки RAM:', error);
            return { success: false, message: 'Ошибка установки RAM' };
        }
        return { success: true, message: 'RAM успешно установлен' };
    } catch (err) {
        console.error('Неожиданная ошибка:', err);
        return { success: false, message: 'Произошла ошибка' };
    }
}

function displayError(message) {
    console.error('Ошибка:', message);
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = '#e63946';
        errorElement.style.marginTop = '10px';
        errorElement.style.opacity = '1';
        errorElement.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!window.location.pathname.includes('profile')) return;

    const content = document.getElementById('content');

    // Проверка авторизации
    const userData = await checkAuth();
    if (!userData) {
        console.log('Пользователь не авторизован, редирект на auth.html');
        window.location.href = '/auth.html';
        return;
    }

    try {
        // Загрузка данных пользователя
        const { data: user, error } = await supabase
            .from('userz')
            .select('id, username, access_level, created_at, last_login, hwid, expires, token, token_expires')
            .eq('id', userData.id)
            .single();

        if (error || !user) {
            console.error('Ошибка получения данных пользователя:', error || 'Пользователь не найден');
            logout();
            return;
        }

        // Показываем контент
        content.style.display = 'block';

        // Определение уровней доступа
        const accessLevels = {
            0: 'No access',
            1: 'Пользователь',
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
        document.getElementById('user-expires').textContent = user.expires ? new Date(user.expires).toLocaleString('ru-RU') : 'Нет подписки';
        document.getElementById('user-token').textContent = user.token || 'Нет ключа';
        document.getElementById('user-avatar').src = user.avatar_url || 'assets/avatar-placeholder.png';

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
            window.location.href = 'https://discord.gg/Xqyd6NJB5X';
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

        // Обработка модальных окон
        const ramModal = document.getElementById('ramModal');
        const keyModal = document.getElementById('keyModal');
        const closeButtons = document.querySelectorAll('.modal-close');

        document.getElementById('open-ram-modal').addEventListener('click', () => {
            ramModal.style.display = 'block';
        });

        document.getElementById('open-key-modal').addEventListener('click', () => {
            keyModal.style.display = 'block';
        });

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.modal').style.display = 'none';
            });
        });

        document.getElementById('set-ram-btn').addEventListener('click', async () => {
            const ramInput = document.getElementById('ram-input').value;
            const result = await setRam(userData.id, ramInput);
            if (result.success) {
                alert(result.message);
                ramModal.style.display = 'none';
            } else {
                displayError(result.message);
            }
        });

        document.getElementById('activate-key-btn').addEventListener('click', async () => {
            const keyInput = document.getElementById('key-input').value;
            const result = await activateKey(userData.id, keyInput);
            if (result.success) {
                alert(result.message);
                document.getElementById('user-token').textContent = keyInput;
                keyModal.style.display = 'none';
            } else {
                displayError(result.message);
            }
        });
    } catch (err) {
        console.error('Ошибка загрузки данных пользователя:', err);
        logout();
    }
});