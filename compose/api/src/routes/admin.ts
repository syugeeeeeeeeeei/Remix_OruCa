import { handleDeleteUser, handleGetUsers, handleUpdateUserName } from '@/handlers/adminHandler.js';
import { authMiddleware } from '@/middleware/auth.js';
import type { AppContext } from '@ShardTypes/UserDefTypes/api/types.js';
import { Hono } from 'hono';

const adminRoutes = new Hono<AppContext>();

// このルートグループ全体に認証ミドルウェアを適用
adminRoutes.use('*', authMiddleware);

// 保護されたエンドポイント
adminRoutes.get('/users', handleGetUsers); // ★追加
adminRoutes.put('/users/:id/name', handleUpdateUserName);
adminRoutes.delete('/users/:id', handleDeleteUser);

export { adminRoutes };
