import type { Request, Response } from 'express';
import * as chatService from './chat.service';

export async function getMessages(req: Request, res: Response) {
  const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 50;
  const before = typeof req.query.before === 'string' ? req.query.before : undefined;
  const messages = await chatService.getMessages(
    req.user!.userId,
    req.params.matchId as string,
    limit,
    before,
  );
  res.json({ data: messages });
}

export async function sendMessage(req: Request, res: Response) {
  const { content, type } = req.body;
  const message = await chatService.sendMessage(
    req.user!.userId,
    req.params.matchId as string,
    content,
    type,
  );
  res.status(201).json(message);
}

export async function markRead(req: Request, res: Response) {
  await chatService.markMessagesRead(req.user!.userId, req.params.matchId as string);
  res.json({ message: 'Messages marked as read' });
}
