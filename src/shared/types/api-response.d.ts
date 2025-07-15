// types/global.d.ts
declare global {
  type StandardApiResp<T = any> = {
    success: boolean;
    data?: T;
    error?: Record<string, string>;
    total?: number;
  };
}

export {};
