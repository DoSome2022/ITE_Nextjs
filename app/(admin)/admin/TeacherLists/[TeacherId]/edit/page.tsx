"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface TeacherFormData {
  username: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  hourlyRate: string;
}

const EditTeacherPage = () => {
  const params = useParams();
  const router = useRouter();
  const TeacherId = params.TeacherId as string;

  const [formData, setFormData] = useState<TeacherFormData>({
    username: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    hourlyRate: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 載入原始資料
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const res = await fetch(`/api/user/Get_User_Lists_by_Id/${TeacherId}`);
        if (!res.ok) throw new Error("無法載入教師資料");
        const data = await res.json();
        setFormData({
          username: data.username || "",
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          hourlyRate: data.hourlyRate?.toString() || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "載入失敗");
      } finally {
        setLoading(false);
      }
    };
    fetchTeacherData();
  }, [TeacherId]);

  // 處理輸入變更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/user/Edit_User/${TeacherId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "更新失敗");
      }

      setSuccess(true);
      // 3 秒後返回詳情頁
      setTimeout(() => {
        router.push(`/admin/TeacherLists/${TeacherId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失敗");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回連結 */}
        <Link
          href={`/admin/TeacherLists/${TeacherId}`}
          className="text-blue-400 hover:underline mb-4 inline-block"
        >
          ← 返回教師資料
        </Link>

        <div className="bg-gray-800 shadow-lg rounded-md p-6">
          <h1 className="text-2xl font-bold mb-6">編輯教師資料</h1>

          {/* 成功提示 */}
          {success && (
            <div className="bg-green-600 text-white px-4 py-2 rounded-md mb-4">
              更新成功！即將返回詳情頁...
            </div>
          )}

          {/* 錯誤提示 */}
          {error && (
            <div className="bg-red-600 text-white px-4 py-2 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 用戶名 */}
            <div>
              <label className="block text-sm font-medium mb-1">用戶名</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
            </div>

            {/* 姓名 */}
            <div>
              <label className="block text-sm font-medium mb-1">姓名</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
            </div>

            {/* 電話 */}
            <div>
              <label className="block text-sm font-medium mb-1">電話</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                required
              />
            </div>

            {/* 地址 */}
            <div>
              <label className="block text-sm font-medium mb-1">地址</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>

            {/* ⭐ 時薪（新欄位） */}
            <div>
              <label className="block text-sm font-medium mb-1">
                時薪 (HKD)
              </label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="例如：150.00"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                用於計算教師薪資，如不設定可留空
              </p>
            </div>

            {/* 按鈕 */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "儲存中..." : "儲存變更"}
              </button>
              <Link
                href={`/admin/TeacherLists/${TeacherId}`}
                className="px-6 py-2 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition text-center"
              >
                取消
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTeacherPage;
