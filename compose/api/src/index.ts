// compose/api/src/index.ts
import { serve } from '@hono/node-server';
import { PrismaClient } from '@PrismaClient/index.js'; // ★追加: 生成されたPrismaClientをインポート
import { Hono } from 'hono';

const app = new Hono()
const prisma = new PrismaClient() // ★追加: PrismaClientのインスタンスを作成

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// ★ここから追加
app.get('/test-items', async (c) => {
  try {
    const testItems = await prisma.testItem.findMany();
    return c.json(testItems);
  } catch (error) {
    console.error('Failed to fetch test items:', error);
    return c.json({ error: 'Failed to fetch test items' }, 500);
  }
});

app.post('/test-items', async (c) => {
  try {
    const { name } = await c.req.json();
    if (typeof name !== 'string' || name.trim() === '') {
      return c.json({ error: 'Name is required and must be a string' }, 400);
    }
    const newTestItem = await prisma.testItem.create({
      data: { name },
    });
    return c.json(newTestItem, 201);
  } catch (error) {
    console.error('Failed to create test item:', error);
    return c.json({ error: 'Failed to create test item' }, 500);
  }
});
// ★ここまで追加

serve({
  fetch: app.fetch,
  port: 3000,
  hostname: "0.0.0.0"
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})