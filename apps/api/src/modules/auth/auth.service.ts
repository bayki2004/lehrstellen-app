import bcrypt from 'bcryptjs';
import { prisma, type UserRole } from '@lehrstellen/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../services/token.service';
import { ApiError } from '../../utils/ApiError';

export async function register(email: string, password: string, role: UserRole) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.conflict('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, role },
    include: { studentProfile: true, companyProfile: true },
  });

  const tokens = generateTokens(user.id, user.role);
  await storeRefreshToken(user.id, tokens.refreshToken);

  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      hasProfile: !!(user.studentProfile || user.companyProfile),
      hasCompletedQuiz: !!user.studentProfile?.quizCompletedAt,
    },
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { studentProfile: true, companyProfile: true },
  });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const tokens = generateTokens(user.id, user.role);
  await storeRefreshToken(user.id, tokens.refreshToken);

  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      hasProfile: !!(user.studentProfile || user.companyProfile),
      hasCompletedQuiz: !!user.studentProfile?.quizCompletedAt,
    },
  };
}

export async function refreshTokens(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!stored || stored.revokedAt) {
    throw ApiError.unauthorized('Refresh token revoked');
  }

  // Revoke old token
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { studentProfile: true, companyProfile: true },
  });
  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  const tokens = generateTokens(user.id, user.role);
  await storeRefreshToken(user.id, tokens.refreshToken);

  return {
    ...tokens,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      hasProfile: !!(user.studentProfile || user.companyProfile),
      hasCompletedQuiz: !!user.studentProfile?.quizCompletedAt,
    },
  };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

function generateTokens(userId: string, role: string) {
  return {
    accessToken: signAccessToken({ userId, role }),
    refreshToken: signRefreshToken({ userId, role }),
  };
}

async function storeRefreshToken(userId: string, token: string) {
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });
}
