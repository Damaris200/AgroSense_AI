import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { ConflictError, UnauthorizedError, ValidationError } from '../errors';
import type { CreateUserDto } from '../models/user.model';
import { registerSchema, loginSchema } from '../schemas/auth.schemas';

// Re-export schemas so routes can import from one place
export { registerSchema, loginSchema };

// ── Public user select (never exposes passwordHash) ───────────────────────────

const publicUserSelect = {
  id: true, name: true, email: true, phone: true,
  role: true, locale: true, isActive: true,
  createdAt: true, updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export function signAuthToken(user: Pick<PublicUser, 'id' | 'role' | 'email'>) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn } as jwt.SignOptions,
  );
}

// ── Service functions ─────────────────────────────────────────────────────────

export async function registerUser(input: CreateUserDto): Promise<PublicUser> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0]?.message ?? 'Validation failed');
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) throw new ConflictError('Email already in use');

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  return prisma.user.create({
    data: {
      name:         parsed.data.name,
      email:        parsed.data.email,
      phone:        parsed.data.phone ?? null,
      passwordHash,
      locale:       parsed.data.locale ?? 'en',
    },
    select: publicUserSelect,
  });
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: PublicUser; token: string }> {
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    throw new ValidationError(parsed.error.errors[0]?.message ?? 'Validation failed');
  }

  const user = await prisma.user.findUnique({ where: { email, isActive: true } });
  if (!user) throw new UnauthorizedError('Invalid credentials');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new UnauthorizedError('Invalid credentials');

  const token = signAuthToken(user);
  const { passwordHash: _ph, ...safeUser } = user;
  return { user: safeUser as PublicUser, token };
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
}
