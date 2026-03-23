import api from './axios';

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

    try {
        const res = await api.post('/auth/login', {
            email: credentials.email,
            password: credentials.password
        });
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Erro ao fazer login');
    }
}

export const logoutService = async () => {
    try {
        await api.post('/auth/logout');
    } catch {
        // Falha silenciosa no logout
    }
};

export const registerService = async (credentials) => {
    const { fullName, email, password, confirmPassword } = credentials;

    const nameParts = fullName?.trim().split(/\s+/).filter(Boolean);
    if (!nameParts || nameParts.length < 2)
        throw new Error('Introduz primeiro e último nome');

    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    if (firstName.length < 2) throw new Error('Nome deve ter pelo menos 2 caracteres');
    if (lastName.length < 2) throw new Error('Apelido deve ter pelo menos 2 caracteres');

    const emailValidation = validateEmail(email);
    if (emailValidation.error) throw new Error(emailValidation.error);

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) throw new Error(passwordValidation.errors[0]);

    if (password !== confirmPassword) throw new Error('Passwords não coincidem');

    try {
        const res = await api.post('/auth/register', {
            firstName,
            lastName,
            email,
            password
        });
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Erro ao registar');
    }
};

export const fetchProfile = async () => {
    try {
        const res = await api.get('/auth/profile');
        return res.data;
    } catch {
        throw new Error('Sessão inválida');
    }
};

export const forgotPassword = async (email) => {
    const validation = validateEmail(email);
    if (validation.error) throw new Error(validation.error);

    try {
        const res = await api.post('/auth/forgot-password', { email });
        return res.data;
    } catch {
        throw new Error('Erro de ligação ao servidor. Tenta novamente.');
    }
};

export const resetPassword = async (token, password) => {
    if (!token) throw new Error('Token inválido');

    const validation = validatePassword(password);
    if (!validation.isValid) throw new Error(validation.errors[0]);

    try {
        const res = await api.post('/auth/reset-password', { token, password });
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Erro ao alterar password');
    }
};