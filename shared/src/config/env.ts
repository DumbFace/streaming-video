// src/config/env.ts

export const APP_ENV = process.env.APP_ENV as 'dev' | 'stage' | 'prod';

export const isDevelopment = APP_ENV === 'dev';
export const isStaging = APP_ENV === 'stage';
export const isProduction = APP_ENV === 'prod';
