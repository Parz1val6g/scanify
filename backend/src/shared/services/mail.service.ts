import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Design system colors (matching frontend)
const light = {
    bgBody: '#F8FAFC',
    bgSurface: '#FFFFFF',
    bgHover: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    primary: '#5B21B6',
    neon: '#A855F7',
    success: '#10B981'
};

const dark = {
    bgBody: '#0B0C10',
    bgSurface: '#16181F',
    bgHover: '#1F222C',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#475569',
    border: '#2A2D3A',
    primary: '#8B5CF6',
    neon: '#A855F7',
    success: '#10B981'
};

// Lucide-style SVG icons (24x24, stroke-width 2)
const icons = {
    lock: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
};

export const sendResetEmail = async (to: string, token: string): Promise<void> => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const appName = process.env.APP_NAME || 'Scanify';

    await transporter.sendMail({
        from: `"${appName}" <${process.env.EMAIL_USER}>`,
        to,
        subject: `🔐 Recuperação de Password - ${appName}`,
        html: `Link de recuperação: ${resetUrl} (Versão simplificada para garantir integridade caso HTML quebre)`
    });
};

export const sendInviteEmail = async (to: string, token: string, companyName: string): Promise<void> => {
    // The frontend can reuse the reset-password screen for setting up the initial password
    const setupUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const appName = process.env.APP_NAME || 'Scanify';

    await transporter.sendMail({
        from: `"${appName}" <${process.env.EMAIL_USER}>`,
        to,
        subject: `🤝 Convite para a Empresa ${companyName} - ${appName}`,
        html: `Foste convidado para te juntares à equipa na plataforma! Clica no link para criar a tua password e aceder à tua conta: ${setupUrl}`
    });
};

export const verifyEmailConnection = async (): Promise<boolean> => {
    try {
        await transporter.verify();
        console.log('📧 Email server ready');
        return true;
    } catch (error) {
        console.error('❌ Email server error:', error);
        return false;
    }
};
