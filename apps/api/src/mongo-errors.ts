import { BadRequestException, ConflictException } from '@nestjs/common';
import { Error as MongooseError } from 'mongoose';

function mongoErrorCode(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined;
  }
  const code = (error as { code: unknown }).code;
  return typeof code === 'number' ? code : undefined;
}

export function rethrowPersistError(error: unknown, context: string): never {
  const code = mongoErrorCode(error);
  if (code === 11000) {
    throw new ConflictException('An account with this email already exists');
  }
  if (code === 121) {
    throw new BadRequestException(
      `${context}: database validation failed. If you recently changed user fields, update or drop old MongoDB collection validators.`,
    );
  }

  if (error instanceof MongooseError.ValidationError) {
    const messages = Object.values(error.errors).map((entry) => entry.message);
    throw new BadRequestException(messages.join(' '));
  }

  throw error;
}
