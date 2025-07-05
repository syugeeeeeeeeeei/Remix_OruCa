// src/validators.ts
import { z } from 'zod';

// ログイン時のバリデーション
export const loginSchema = z.object({
  student_ID: z.string().min(1, 'IDは必須です'),
  password: z.string().min(1, 'パスワードは必須です'),
});

// ログ書き込み時のバリデーション
export const logWriteSchema = z.object({
  payload: z.object({
    content: z.object({
      student_ID: z.string().min(1, 'student_IDは必須です'),
    }),
  }),
});

// ユーザー名更新時のバリデーション
export const updateUserNameSchema = z.object({
  student_Name: z.string().min(1, '氏名は必須です'),
});

// WebSocketメッセージのバリデーション
export const wsMessageSchema = z.object({
  type: z.enum(["log/fetch"]), // 今は'log/fetch'のみだが、将来的に拡張可能
  payload: z.any().optional(), // payloadは内容が多岐にわたるのでany、またはより厳密なスキーマを定義
});