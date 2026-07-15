"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const EditContactMessagePage = () => {
  const params = useParams();
  const router = useRouter();
  const messageId = params.messageId as string;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    productTypes: [] as string[],
    contactType: "",
    otherType: "",
    details: "",
    adminReply: "",
    status: "PENDING",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/contact/${messageId}`);
        if (!res.ok) throw new Error("無法載入資料");
        const data = await res.json();
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          productTypes: data.productTypes || [],
          contactType: data.contactType || "",
          otherType: data.otherType || "",
          details: data.details || "",
          adminReply: data.adminReply || "",
          status: data.status || "PENDING",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "載入失敗");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [messageId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/contact/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("更新失敗");
      setSuccess(true);
      setTimeout(() => router.push(`/admin/ContactMessages/${messageId}`), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失敗");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-6 text-center">載入中...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <Link href={`/admin/ContactMessages/${messageId}`} className="text-blue-400 hover:underline mb-4 inline-block">
          ← 返回詳情
        </Link>

        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">編輯聯絡表單</h1>

          {error && <div className="bg-red-600 text-white px-4 py-2 rounded-md mb-4">{error}</div>}
          {success && <div className="bg-green-600 text-white px-4 py-2 rounded-md mb-4">更新成功！即將返回...</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">稱名</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">電話</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">電郵</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">類型</label>
              <select name="contactType" value={formData.contactType} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md">
                <option value="個人">個人</option>
                <option value="團體">團體</option>
                <option value="公司">公司</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">狀態</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md">
                <option value="PENDING">待處理</option>
                <option value="REPLIED">已回覆</option>
                <option value="CLOSED">已關閉</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">詳細內容</label>
              <textarea name="details" value={formData.details} onChange={handleChange} rows={4} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">管理員回覆</label>
              <textarea name="adminReply" value={formData.adminReply} onChange={handleChange} rows={3} placeholder="輸入回覆..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md resize-y" />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                {saving ? "儲存中..." : "儲存變更"}
              </button>
              <Link href={`/admin/ContactMessages/${messageId}`} className="px-6 py-2 bg-gray-600 rounded-md hover:bg-gray-700 text-center">
                取消
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditContactMessagePage;
