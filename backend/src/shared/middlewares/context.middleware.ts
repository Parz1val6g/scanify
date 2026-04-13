import { Request, Response, NextFunction } from 'express';
import { requestContext } from '../request-context';
import { AuthRequest } from './auth.middleware';

export function contextMiddleware(req: Request, res: Response, next: NextFunction) {
  
  const { companyId, role } = req as AuthRequest;
  
  requestContext.run({ companyId, role }, () => next());
}