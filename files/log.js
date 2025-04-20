if (typeof window.supabase === 'undefined') {
    console.error('Supabase not loaded');
} else {
    console.log('Supabase library loaded');
}

const supabase = window.supabase.createClient(
    'https://ypfoeackdeyzkmrkytwz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZm9lYWNrZGV5emttcmt5dHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODc5OTQsImV4cCI6MjA1ODM2Mzk5NH0.WkCxdRT8sy6n9VH1owcDgnbCJzjgzm5P5OG1h86eRYg'
);

function generateToken(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
}

async function sha256(str) {
    if (!str) {
        throw new Error('Пустая строка для хеширования');
    }
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function sanitizeInput(input) {
    const dangerousChars = /[<>;'"`]/g;
    return input && !dangerousChars.test(input);
}

function validateInput({ username, password }) {
    const errors = [];
    if (username && (username.length < 3 || username.length > 20)) {
        errors.push('Имя пользователя должно быть от 3 до 20 символов');
    }
    if (password && (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))) {
        errors.push('Пароль должен быть минимум 8 символов, содержать заглавную букву и цифру');
    }
    return errors;
}

function validateLoginInput({ username, password }) {
    const errors = [];
    if (!username) {
        errors.push('Имя пользователя не может быть пустым');
    }
    if (!password) {
        errors.push('Пароль не может быть пустым');
    }
    return errors;
}

function displayError(message) {
    console.error('Ошибка:', message);
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = '#e63946';
        errorElement.style.marginTop = '10px';
        errorElement.style.opacity = '1';
    }
}

async function registerUser(username, password) {
    try {
        const errors = validateInput({ username, password });
        if (errors.length > 0) {
            return { success: false, message: errors.join('. ') };
        }
        if (!sanitizeInput(username) || !sanitizeInput(password)) {
            return { success: false, message: 'Недопустимые символы в полях' };
        }

        const { data: usernameCheck, error: usernameError } = await supabase
            .from('userz')
            .select('username')
            .eq('username', username)
            .single();

        if (usernameError && usernameError.code !== 'PGRST116') {
            console.error('Ошибка проверки имени:', usernameError);
            return { success: false, message: 'Ошибка проверки имени' };
        }
        if (usernameCheck) {
            return { success: false, message: 'Имя пользователя уже занято' };
        }

        const hashedPassword = await sha256(password);
        const userId = crypto.randomUUID();

        const { error: dbError } = await supabase
            .from('userz')
            .insert({
                id: userId,
                username,
                password: hashedPassword,
                access_level: 0,
                expires: null,
                created_at: new Date().toISOString(),
                last_login: null,
                token: null,
                hwid: null,
                avatar_url: 'https://via.placeholder.com/100',
                reset_code: null,
            });

        if (dbError) {
            console.error('Ошибка базы данных:', dbError);
            return { success: false, message: 'Ошибка регистрации' };
        }

        const sessionToken = generateToken(32);
        localStorage.setItem('session_token', sessionToken);
        localStorage.setItem('username', username);

        const { error: tokenError } = await supabase
            .from('userz')
            .update({ token: sessionToken })
            .eq('id', userId);

        if (tokenError) {
            console.error('Ошибка обновления session_token при регистрации:', tokenError);
            return { success: false, message: 'Ошибка сервера при регистрации' };
        }

        return { success: true, message: 'Регистрация успешна!' };
    } catch (error) {
        console.error('Неожиданная ошибка при регистрации:', error);
        return { success: false, message: 'Произошла ошибка' };
    }
}

async function loginUser(username, password) {
    try {
        const errors = validateLoginInput({ username, password });
        if (errors.length > 0) {
            return { success: false, message: errors.join('. ') };
        }
        if (!sanitizeInput(username) || !sanitizeInput(password)) {
            return { success: false, message: 'Недопустимые символы в полях' };
        }

        const hashedPasswordOnce = await sha256(password);
        const hashedPasswordTwice = await sha256(hashedPasswordOnce);

        const { data: user, error } = await supabase
            .from('userz')
            .select('id, username, password, access_level')
            .eq('username', username)
            .single();

        if (error || !user) {
            console.error('Ошибка поиска пользователя:', error);
            return { success: false, message: 'Неверное имя пользователя или пароль' };
        }

        let passwordMatches = false;
        if (user.password === hashedPasswordOnce) {
            console.log('Пароль совпал (хэширован 1 раз)');
            passwordMatches = true;
        } else if (user.password === hashedPasswordTwice) {
            console.log('Пароль совпал (хэширован 2 раза)');
            passwordMatches = true;
        }

        if (!passwordMatches) {
            console.log('Пароль не совпадает');
            return { success: false, message: 'Неверное имя пользователя или пароль' };
        }

        const sessionToken = generateToken(32);

        const { error: updateError } = await supabase
            .from('userz')
            .update({ last_login: new Date().toISOString(), token: sessionToken })
            .eq('id', user.id);

        if (updateError) {
            console.error('Ошибка обновления last_login или token:', updateError);
            return { success: false, message: 'Ошибка сервера при авторизации' };
        }

        localStorage.setItem('session_token', sessionToken);
        localStorage.setItem('username', user.username);

        console.log('session_token сохранён:', sessionToken);

        return { success: true, message: 'Вход успешен!', username: user.username };
    } catch (error) {
        console.error('Неожиданная ошибка при входе:', error);
        return { success: false, message: 'Произошла ошибка' };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return;
    }
    console.log('Supabase initialized successfully:', supabase);

    if (!navigator.onLine) {
        displayError('Нет подключения к интернету');
        return;
    }

    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    const loginLink = document.getElementById('login-link');

    if (registerBtn) {
        registerBtn.addEventListener('click', async () => {
            console.log('Клик по кнопке регистрации');
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            console.log('Данные:', { username, password });

            const result = await registerUser(username, password);
            console.log('Результат регистрации:', result);
            if (result.success) {
                window.location.href = '/userpanel.html';
            } else {
                displayError(result.message);
            }
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            console.log('Клик по кнопке входа');
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            console.log('Данные:', { username, password });

            const result = await loginUser(username, password);
            console.log('Результат входа:', result);
            if (result.success) {
                window.location.href = '/userpanel.html';
            } else {
                displayError(result.message);
            }
        });
    }

    if (loginLink) {
        loginLink.addEventListener('click', async (e) => {
            e.preventDefault();
            window.location.href = '/login.html';
        });
    }
});