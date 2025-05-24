const verifyTurnstileToken = async (req, res) => {
    const token = req.body['cf-turnstile-response'];
    const secretKey = '0x4AAAAAABecX1OLDEZCPxDH9LedJhBpR_Q';

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            secret: secretKey,
            response: token,
            remoteip: req.ip,
        }),
    });

    const result = await response.json();

    if (result.success) {
        // Капча пройдена, продолжай обработку формы
        res.status(200).json({ message: 'Капча пройдена успешно' });
    } else {
        res.status(403).json({ error: 'Ошибка проверки капчи' });
    }
};

export default verifyTurnstileToken;