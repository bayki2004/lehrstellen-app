import { prisma } from '@lehrstellen/database';
import type { MessageDTO } from '@lehrstellen/shared';
import { ApiError } from '../../utils/ApiError';

export async function getMessages(
  userId: string,
  matchId: string,
  limit = 50,
  before?: string,
): Promise<MessageDTO[]> {
  // Verify user is part of this match
  await verifyMatchAccess(userId, matchId);

  const messages = await prisma.message.findMany({
    where: {
      matchId,
      ...(before && { createdAt: { lt: new Date(before) } }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return messages.reverse().map(mapToDTO);
}

export async function sendMessage(
  userId: string,
  matchId: string,
  content: string,
  type: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT',
): Promise<MessageDTO> {
  await verifyMatchAccess(userId, matchId);

  const message = await prisma.message.create({
    data: {
      matchId,
      senderId: userId,
      content,
      type,
    },
  });

  // Update match's updatedAt to sort matches by recent activity
  await prisma.match.update({
    where: { id: matchId },
    data: { updatedAt: new Date() },
  });

  return mapToDTO(message);
}

export async function markMessagesRead(userId: string, matchId: string): Promise<void> {
  await verifyMatchAccess(userId, matchId);

  await prisma.message.updateMany({
    where: {
      matchId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });
}

async function verifyMatchAccess(userId: string, matchId: string): Promise<void> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      student: true,
      listing: { include: { company: true } },
    },
  });

  if (!match) {
    throw ApiError.notFound('Match not found');
  }

  const isStudent = match.student.userId === userId;
  const isCompany = match.listing.company.userId === userId;

  if (!isStudent && !isCompany) {
    throw ApiError.forbidden('Not authorized to access this chat');
  }
}

function mapToDTO(message: any): MessageDTO {
  return {
    id: message.id,
    matchId: message.matchId,
    senderId: message.senderId,
    content: message.content,
    type: message.type,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
  };
}
