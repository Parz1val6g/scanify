export class AppError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public code?: string // ex: 'INVOICE_NOT_FOUND', para o frontend filtrar
    ) {
        super(message);
        this.name = 'AppError';
    }
}
