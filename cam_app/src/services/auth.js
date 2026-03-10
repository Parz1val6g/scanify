// Email validation (matching backend Zod rules)
export const validateEmail = (email = "") => {
    const error = (!email) ? 'Email é obrigatório'
        : (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ? 'Email inválido'
            : (email.length > 255) ? 'Email muito longo'
                : null;
    return { error };
};

// Password validation rules (matching backend)
export const validatePassword = (password = "") => {
    const criteria = [
        { label: '8+ caracteres', met: password.length >= 8 },
        { label: 'Maiúscula', met: /[A-Z]/.test(password) },
        { label: 'Minúscula', met: /[a-z]/.test(password) },
        { label: 'Número', met: /\d/.test(password) },
        { label: 'Especial', met: /[@$!%*?&#+\-_]/.test(password) }
    ];

    const errors = criteria.filter(c => !c.met).map(c => `Falta: ${c.label}`);

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const loginService = async (credentials) => {

    const validation = validateEmail(credentials.email);
    if (validation.error)
        throw new Error(validation.error);

    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email, password: credentials.password })
    });

    const data = await res.json();

    if (!res.ok)
        throw new Error(data.error || 'Erro ao fazer login');

    return data;
}

export const logoutService = async () => {
    
};

export const registerService = async (credentials) => {
    const { fullName, email, password, confirmPassword } = credentials;

    const nameParts = fullName?.trim().split(/\s+/).filter(Boolean);

    if (!nameParts || nameParts.length < 2)
        throw new Error('Introduz primeiro e último nome');

    // Primeiro nome = primeira palavra, Apelido = resto junto
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    if (firstName.length < 2)
        throw new Error('Nome deve ter pelo menos 2 caracteres');
    if (lastName.length < 2)
        throw new Error('Apelido deve ter pelo menos 2 caracteres');

    const emailValidation = validateEmail(email);
    if (emailValidation.error)
        throw new Error(emailValidation.error);

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid)
        throw new Error(passwordValidation.errors[0]);

    if (password !== confirmPassword)
        throw new Error('Passwords não coincidem');

    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password })
    });

    const data = await res.json();

    if (!res.ok)
        throw new Error(data.error || 'Erro ao registar');

    return data;
};

export const fetchProfile = async (token) => {
    const res = await fetch('/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok)
        throw new Error('Token inválido');

    return res.json();
};

export const forgotPassword = async (email) => {

    const validation = validateEmail(email);
    if (validation.error)
        throw new Error(validation.error);

    const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });

    // Backend sempre retorna 200 (por segurança - não revela se email existe)
    // Só falha em caso de erro de rede ou servidor
    if (!response.ok) {
        throw new Error('Erro de ligação ao servidor. Tenta novamente.');
    }

    return response;
}

export const resetPassword = async (token, password) => {
    // Validação com regras fortes
    if (!token) {
        throw new Error('Token inválido');
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
        throw new Error(validation.errors[0]);
    }

    const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao alterar password');
    }

    return response.json();
}