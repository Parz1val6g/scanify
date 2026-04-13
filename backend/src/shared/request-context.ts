// backend/src/shared/request-context.ts
import { AsyncLocalStorage } from 'async_hooks';

type ContextType = { companyId?: string; role?: string };

export const requestContext = new AsyncLocalStorage<ContextType>();

export function getContext() {
  return requestContext.getStore();
}