'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { updateType } from '@/app/actions/Update/Update_type';

export default function EditTypePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [typename, setTypename] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchType() {
      try {
        const res = await fetch(`/api/Type/Get_Type_ById/${id}`);
        if (!res.ok) throw new Error('找不到該類型');
        const data = await res.json();
        setTypename(data.typename);
        setAuthor(data.author);
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入失敗');
      } finally {
        setLoading(false);
      }
    }
    fetchType();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typename.trim()) {
      setError('類型名稱不能為空');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateType({ id, typename: typename.trim(), author: author.trim() });
      alert('類型已成功更新！');
      router.push('/admin/TypeLists');
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失敗');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-xl">載入中...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">編輯類型</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-600 text-red-400 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">類型名稱</label>
            <input
              type="text"
              value={typename}
              onChange={(e) => setTypename(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="輸入類型名稱"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">作者</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="輸入作者名稱"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? '儲存中...' : '儲存變更'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/TypeLists')}
              className="px-6 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
