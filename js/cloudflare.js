window.onLoginCaptchaSuccess = function(token) {
    // Активируем кнопку авторизации
    document.getElementById("login-btn").disabled = false;
    
    // Добавляем токен в форму как скрытое поле
    const form = document.querySelector("#login-form form");
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "cf-turnstile-response";
    input.value = token;
    form.appendChild(input);
};

window.onRegisterCaptchaSuccess = function(token) {
    // Активируем кнопку регистрации
    document.getElementById("register-btn").disabled = false;
    
    // Добавляем токен в форму как скрытое поле
    const form = document.querySelector("#register-form form");
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "cf-turnstile-response";
    input.value = token;
    form.appendChild(input);
};