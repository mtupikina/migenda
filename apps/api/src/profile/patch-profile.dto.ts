import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class PatchProfilePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(1)
  newPassword!: string;

  @IsString()
  @MinLength(1)
  confirmPassword!: string;
}

export class PatchProfileNotificationsDto {
  @IsBoolean()
  emailShiftChanges!: boolean;

  @IsBoolean()
  emailSchedulingConflicts!: boolean;

  @IsBoolean()
  weeklySummaryDigest!: boolean;
}

export class PatchProfileDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsEmail()
  email?: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PatchProfileNotificationsDto)
  notifications?: PatchProfileNotificationsDto;

  @IsOptional()
  @IsString()
  @MaxLength(400_000)
  avatarUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PatchProfilePasswordDto)
  password?: PatchProfilePasswordDto;
}
