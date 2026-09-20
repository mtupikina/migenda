import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile() {
  const envPath = [
    resolve(process.cwd(), '.env'),
    resolve(__dirname, '..', '.env'),
  ].find((path) => existsSync(path));

  if (envPath) {
    process.loadEnvFile(envPath);
  }
}

function readRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

function readOptional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

loadEnvFile();

export const env = {
  port: Number(process.env.PORT ?? 3000),
  mongodbUri: readRequired('MONGODB_URI'),
  webOrigin: readRequired('WEB_ORIGIN'),
  cookieSecure:
    process.env.COOKIE_SECURE === 'true' ||
    (process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false'),
  googleClientId: readOptional('GOOGLE_CLIENT_ID'),
  googleClientSecret: readOptional('GOOGLE_CLIENT_SECRET'),
  githubClientId: readOptional('GITHUB_CLIENT_ID'),
  githubClientSecret: readOptional('GITHUB_CLIENT_SECRET'),
};
