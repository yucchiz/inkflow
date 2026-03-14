import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';

import { documentRepository, resetDB } from '@/lib/db';
import { createDocument } from '@/lib/document';

beforeEach(() => {
  resetDB();
  globalThis.indexedDB = new IDBFactory();
});

describe('DocumentRepository', () => {
  describe('getAll', () => {
    it('ドキュメントが0件のとき空配列を返すこと', async () => {
      const all = await documentRepository.getAll();

      expect(all).toEqual([]);
    });

    it('保存したドキュメントを全件取得できること', async () => {
      const doc1 = createDocument({ title: 'ドキュメント1', body: '本文1' });
      const doc2 = createDocument({ title: 'ドキュメント2', body: '本文2' });
      await documentRepository.save(doc1);
      await documentRepository.save(doc2);

      const all = await documentRepository.getAll();

      expect(all).toHaveLength(2);
      expect(all.map((d) => d.title)).toContain('ドキュメント1');
      expect(all.map((d) => d.title)).toContain('ドキュメント2');
    });

    it('updatedAtの降順（新しい順）でソートされること', async () => {
      const old = createDocument({ title: '古い', updatedAt: '2024-01-01T00:00:00.000Z' });
      const mid = createDocument({ title: '中間', updatedAt: '2024-06-01T00:00:00.000Z' });
      const recent = createDocument({ title: '新しい', updatedAt: '2025-01-01T00:00:00.000Z' });

      // 意図的にバラバラの順で保存
      await documentRepository.save(mid);
      await documentRepository.save(old);
      await documentRepository.save(recent);

      const all = await documentRepository.getAll();
      expect(all[0].title).toBe('新しい');
      expect(all[1].title).toBe('中間');
      expect(all[2].title).toBe('古い');
    });
  });

  describe('getById', () => {
    it('存在するIDでドキュメントを取得できること', async () => {
      const doc = createDocument({ title: 'テスト', body: '本文' });
      await documentRepository.save(doc);

      const found = await documentRepository.getById(doc.id);

      expect(found).toBeDefined();
      expect(found!.id).toBe(doc.id);
      expect(found!.title).toBe('テスト');
      expect(found!.body).toBe('本文');
    });

    it('存在しないIDでundefinedを返すこと', async () => {
      const found = await documentRepository.getById('non-existent-id');

      expect(found).toBeUndefined();
    });
  });

  describe('save', () => {
    it('新規ドキュメントを保存できること', async () => {
      const doc = createDocument({ title: '新規', body: '新規本文' });

      await documentRepository.save(doc);

      const saved = await documentRepository.getById(doc.id);
      expect(saved).toBeDefined();
      expect(saved!.title).toBe('新規');
      expect(saved!.body).toBe('新規本文');
      expect(saved!.createdAt).toBe(doc.createdAt);
      expect(saved!.updatedAt).toBe(doc.updatedAt);
    });

    it('既存ドキュメントを上書き更新（upsert）できること', async () => {
      const doc = createDocument({ title: '初期タイトル', body: '初期本文' });
      await documentRepository.save(doc);

      const updated = { ...doc, title: '更新タイトル', body: '更新本文' };
      await documentRepository.save(updated);

      const found = await documentRepository.getById(doc.id);
      expect(found).toBeDefined();
      expect(found!.title).toBe('更新タイトル');
      expect(found!.body).toBe('更新本文');

      const all = await documentRepository.getAll();
      expect(all).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('指定したIDのドキュメントを削除できること', async () => {
      const doc = createDocument({ title: '削除対象', body: '本文' });
      await documentRepository.save(doc);

      await documentRepository.remove(doc.id);

      const found = await documentRepository.getById(doc.id);
      expect(found).toBeUndefined();
    });

    it('削除後にgetAllから除外されること', async () => {
      const doc1 = createDocument({ title: '残る', body: '本文1' });
      const doc2 = createDocument({ title: '削除される', body: '本文2' });
      await documentRepository.save(doc1);
      await documentRepository.save(doc2);

      await documentRepository.remove(doc2.id);

      const all = await documentRepository.getAll();
      expect(all).toHaveLength(1);
      expect(all[0].title).toBe('残る');
    });

    it('存在しないIDで削除してもエラーにならないこと', async () => {
      await expect(documentRepository.remove('non-existent-id')).resolves.not.toThrow();
    });
  });
});
