if (typeof window.supabase === 'undefined') {
    console.error('Supabase not loaded');
} else {
    console.log('Supabase library loaded');
}

// Функция ожидания загрузки Supabase
function waitForSupabase(callback, maxAttempts = 30, interval = 1000) {
    let attempts = 0;

    // Проверяем, готов ли window.supabase
    const checkSupabase = () => {
        if (typeof window.supabase !== 'undefined' && typeof window.supabase.from === 'function') {
            console.log('Supabase загружен');
            callback();
        } else if (attempts < maxAttempts) {
            attempts++;
            console.log(`Supabase еще не загружен, попытка ${attempts}/${maxAttempts}`);
            setTimeout(checkSupabase, interval);
        } else {
            console.error('Ошибка: Supabase не загружен после максимального количества попыток');
        }
    };

    // Слушаем событие supabase:ready от user.js
    window.addEventListener('supabase:ready', () => {
        console.log('Получено событие supabase:ready');
        checkSupabase();
    }, { once: true });

    // На всякий случай сразу проверяем
    checkSupabase();
}

// Инициализация Supabase
function initializeSupabase() {
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.from === 'function') {
        console.log('Используется существующий Supabase клиент');
        return true;
    }
    console.error('Supabase клиент не инициализирован');
    return false;
}

async function sha256(str) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function initializeActivation() {
    waitForSupabase(() => {
        if (!initializeSupabase()) {
            console.error('Supabase не инициализирован, активация невозможна');
            return;
        }
        console.log('Supabase library loaded in activate.js');

        document.addEventListener('DOMContentLoaded', () => {
            const modal = document.getElementById('key-activation-modal');
            const openModalBtn = document.getElementById('activate-key');
            const resetHwidBtn = document.getElementById('reset-hwid');
            const closeModalBtn = document.querySelector('.modal-close');
            const keyInput = document.getElementById('key-input');
            const confirmBtn = document.getElementById('confirm-key');
            const errorMessage = document.getElementById('key-error');

            if (!modal || !openModalBtn || !resetHwidBtn || !closeModalBtn || !keyInput || !confirmBtn || !errorMessage) {
                console.error('Ошибка: Элементы DOM не найдены', {
                    modal, openModalBtn, resetHwidBtn, closeModalBtn, keyInput, confirmBtn, errorMessage
                });
                return;
            }

            console.log('Все элементы DOM найдены, инициализация обработчиков');

            keyInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
                if (value.length <= 8) {
                    value = value.match(/.{1,4}/g)?.join('-') || '';
                    e.target.value = value.slice(0, 9);
                } else {
                    value = value.match(/.{1,4}/g)?.join('-') || '';
                    e.target.value = value.slice(0, 19);
                }
            });

            openModalBtn.addEventListener('click', () => {
                console.log('Открытие модального окна через activate-key');
                modal.style.display = 'block';
                keyInput.value = '';
                errorMessage.textContent = '';
                errorMessage.classList.remove('active');
                errorMessage.style.color = '#e63946';
            });

            resetHwidBtn.addEventListener('click', () => {
                console.log('Открытие модального окна через reset-hwid');
                modal.style.display = 'block';
                keyInput.value = '';
                errorMessage.textContent = '';
                errorMessage.classList.remove('active');
                errorMessage.style.color = '#e63946';
            });

            closeModalBtn.addEventListener('click', () => {
                console.log('Закрытие модального окна');
                modal.style.display = 'none';
            });

            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    console.log('Закрытие модального окна по клику вне области');
                    modal.style.display = 'none';
                }
            });

            const getAttempts = () => JSON.parse(localStorage.getItem('key_attempts') || '{}');
            const saveAttempts = (count, timestamp, blockedUntil = 0) =>
                localStorage.setItem('key_attempts', JSON.stringify({ count, timestamp, blockedUntil }));

            const checkBruteforce = () => {
                const { count = 0, timestamp = 0, blockedUntil = 0 } = getAttempts();
                const now = Date.now();
                if (blockedUntil && now < blockedUntil) {
                    errorMessage.textContent = `Попробуй через ${Math.ceil((blockedUntil - now) / 60000)} мин.`;
                    errorMessage.classList.add('active');
                    return false;
                }
                if (now - timestamp > 5 * 60 * 1000) {
                    saveAttempts(0, now);
                    return true;
                }
                if (count >= 5) {
                    saveAttempts(count, timestamp, now + 30 * 60 * 1000);
                    errorMessage.textContent = 'Слишком много попыток, блокировка!';
                    errorMessage.classList.add('active');
                    return false;
                }
                return true;
            };

            confirmBtn.addEventListener('click', async () => {
                console.log('Нажата кнопка подтверждения ключа');
                if (!checkBruteforce()) return;

                const sessionToken = localStorage.getItem('session_token');
                const username = localStorage.getItem('username');
                if (!sessionToken || !username) {
                    errorMessage.textContent = 'Ошибка авторизации: пользователь не авторизован';
                    errorMessage.classList.add('active');
                    console.error('Ошибка: session_token или username отсутствуют');
                    modal.style.display = 'none';
                    window.location.href = '/login.html';
                    return;
                }

                try {
                    const { data: user, error: userError } = await window.supabase
                        .from('userz')
                        .select('id, access_level')
                        .eq('token', sessionToken)
                        .eq('username', username)
                        .single();

                    if (userError || !user) {
                        errorMessage.textContent = 'Ошибка авторизации: пользователь не найден';
                        errorMessage.classList.add('active');
                        console.error('Ошибка получения пользователя:', userError);
                        modal.style.display = 'none';
                        window.location.href = '/login.html';
                        return;
                    }

                    const key = keyInput.value.trim();
                    if (!key) {
                        errorMessage.textContent = 'Введите ключ';
                        errorMessage.classList.add('active');
                        const { count = 0, timestamp = Date.now() } = getAttempts();
                        saveAttempts(count + 1, timestamp);
                        return;
                    }

                    const isHwidReset = key.length === 9;
                    const keyHash = await sha256(key);

                    if (isHwidReset) {
                        const { data: hwidKey, error: hwidError } = await window.supabase
                            .from('keyz')
                            .select('id, used')
                            .eq('key_hash', keyHash)
                            .eq('type', 'hwid_reset')
                            .single();

                        if (hwidError || !hwidKey) {
                            errorMessage.textContent = 'Недействительный ключ сброса HWID';
                            errorMessage.classList.add('active');
                            const { count = 0, timestamp = Date.now() } = getAttempts();
                            saveAttempts(count + 1, timestamp);
                            return;
                        }

                        if (hwidKey.used) {
                            errorMessage.textContent = 'Ключ уже использован';
                            errorMessage.classList.add('active');
                            const { count = 0, timestamp = Date.now() } = getAttempts();
                            saveAttempts(count + 1, timestamp);
                            return;
                        }

                        const { error: updateError } = await window.supabase
                            .from('userz')
                            .update({ hwid: null })
                            .eq('id', user.id);

                        if (updateError) {
                            errorMessage.textContent = 'Ошибка сброса HWID';
                            errorMessage.classList.add('active');
                            console.error('Ошибка обновления HWID:', updateError);
                            return;
                        }

                        const { error: markUsedError } = await window.supabase
                            .from('keyz')
                            .update({ used: true })
                            .eq('id', hwidKey.id);

                        if (markUsedError) {
                            errorMessage.textContent = 'Ошибка пометки ключа';
                            errorMessage.classList.add('active');
                            console.error('Ошибка пометки ключа:', markUsedError);
                            return;
                        }

                        errorMessage.textContent = 'HWID успешно сброшен!';
                        errorMessage.style.color = '#00cc00';
                        errorMessage.classList.add('active');
                        setTimeout(() => {
                            modal.style.display = 'none';
                            window.location.reload();
                        }, 2000);
                        return;
                    }

                    const { data: activationKey, error: keyError } = await window.supabase
                        .from('keyz')
                        .select('id, duration, used')
                        .eq('key_hash', keyHash)
                        .eq('type', 'activation')
                        .single();

                    if (keyError || !activationKey) {
                        errorMessage.textContent = 'Недействительный ключ активации';
                        errorMessage.classList.add('active');
                        const { count = 0, timestamp = Date.now() } = getAttempts();
                        saveAttempts(count + 1, timestamp);
                        return;
                    }

                    if (activationKey.used) {
                        errorMessage.textContent = 'Ключ уже использован';
                        errorMessage.classList.add('active');
                        const { count = 0, timestamp = Date.now() } = getAttempts();
                        saveAttempts(count + 1, timestamp);
                        return;
                    }

                    const durationMs = activationKey.duration * 24 * 60 * 60 * 1000;
                    const expiryDate = new Date(Date.now() + durationMs).toISOString();

                    const { error: updateUserError } = await window.supabase
                        .from('userz')
                        .update({
                            access_level: user.access_level === 0 ? 1 : user.access_level,
                            subscription_expiry: expiryDate
                        })
                        .eq('id', user.id);

                    if (updateUserError) {
                        errorMessage.textContent = 'Ошибка активации подписки';
                        errorMessage.classList.add('active');
                        console.error('Ошибка обновления пользователя:', updateUserError);
                        return;
                    }

                    const { error: markUsedError } = await window.supabase
                        .from('keyz')
                        .update({ used: true })
                        .eq('id', activationKey.id);

                    if (markUsedError) {
                        errorMessage.textContent = 'Ошибка пометки ключа';
                        errorMessage.classList.add('active');
                        console.error('Ошибка пометки ключа:', markUsedError);
                        return;
                    }

                    errorMessage.textContent = 'Ключ успешно активирован!';
                    errorMessage.style.color = '#00cc00';
                    errorMessage.classList.add('active');
                    setTimeout(() => {
                        modal.style.display = 'none';
                        window.location.reload();
                    }, 2000);
                } catch (error) {
                    errorMessage.textContent = 'Произошла ошибка при активации';
                    errorMessage.classList.add('active');
                    console.error('Ошибка:', error);
                    const { count = 0, timestamp = Date.now() } = getAttempts();
                    saveAttempts(count + 1, timestamp);
                }
            });
        });
    });
}

initializeActivation();