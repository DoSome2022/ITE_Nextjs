"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  productTypes: string[];
  contactType: string;
  otherType: string | null;
  details: string;
  status: string;
  adminReply: string | null;
  readAt: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待處理", color: "bg-yellow-100 text-yellow-800" },
  REPLIED: { label: "已回覆", color: "bg-green-100 text-green-800" },
  CLOSED: { label: "已關閉", color: "bg-gray-100 text-gray-800" },
};

const ContactMessageDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const messageId = params.messageId as string;

  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const res = await fetch(`/api/contact/${messageId}`);
        if (!res.ok) throw new Error("無法載入資料");
        const data = await res.json();
        setMessage(data);
        setAdminReply(data.adminReply || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "載入失敗");
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [messageId]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleReply = async () => {
    if (!adminReply.trim()) return;
    setIsReplying(true);
    try {
      const res = await fetch(`/api/contact/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: adminReply.trim() }),
      });
      if (!res.ok) throw new Error("回覆失敗");
      const updated = await res.json();
      setMessage(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("回覆失敗");
    } finally {
      setIsReplying(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/contact/${messageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("更新狀態失敗");
      const updated = await res.json();
      setMessage(updated);
    } catch (err) {
      alert("更新狀態失敗");
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white p-6 text-center">載入中...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-white p-6 text-red-500">{error}</div>;
  if (!message) return <div className="min-h-screen bg-gray-900 text-white p-6 text-center">找不到表單</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* 返回按鈕 */}
        <Link href="/admin/ContactMessages" className="text-blue-400 hover:underline mb-4 inline-block">
          ← 返回列表
        </Link>

        {/* 成功提示 */}
        {success && (
          <div className="bg-green-600 text-white px-4 py-2 rounded-md mb-4">
            回覆已儲存！
          </div>
        )}

        {/* 主內容 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl font-bold">聯絡表單詳情</h1>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                STATUS_MAP[message.status]?.color || "bg-gray-500"
              }`}>
                {STATUS_MAP[message.status]?.label || message.status}
              </span>
              <select
                value={message.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
              >
                <option value="PENDING">待處理</option>
                <option value="REPLIED">已回覆</option>
                <option value="CLOSED">已關閉</option>
              </select>
            </div>
          </div>

          {/* 基本資料 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm text-gray-400">稱名</label>
              <p className="text-lg font-medium">{message.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">電話</label>
              <p className="text-lg font-medium">{message.phone}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">電郵</label>
              <p className="text-lg font-medium">{message.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">類型</label>
              <p className="text-lg font-medium">
                {message.contactType}
                {message.contactType === "其他" && message.otherType && (
                  <span className="text-gray-400 ml-2">({message.otherType})</span>
                )}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-400">提交時間</label>
              <p className="text-lg">{formatDate(message.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-400">已讀時間</label>
              <p className="text-lg">{formatDate(message.readAt)}</p>
            </div>
          </div>

          {/* 感興趣的產品類型 */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 block mb-2">感興趣的產品 / 服務類型</label>
            <div className="flex flex-wrap gap-2">
              {message.productTypes.length > 0 ? (
                message.productTypes.map((type, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">未選擇</span>
              )}
            </div>
          </div>

          {/* 詳細內容 */}
          <div className="mb-6">
            <label className="text-sm text-gray-400 block mb-2">詳細內容</label>
            <div className="bg-gray-700/50 p-4 rounded-lg whitespace-pre-wrap">
              {message.details}
            </div>
          </div>

          {/* 管理員回覆 */}
          <div className="border-t border-gray-700 pt-6">
            <h2 className="text-lg font-bold mb-4">管理員回覆</h2>
            
            {message.adminReply && (
              <div className="bg-green-900/30 border border-green-700 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-green-400 font-medium">您的回覆</span>
                  <span className="text-xs text-gray-400">{formatDate(message.repliedAt)}</span>
                </div>
                <p className="text-gray-200 whitespace-pre-wrap">{message.adminReply}</p>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">回覆內容</label>
              <textarea
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                rows={4}
                placeholder="輸入回覆內容..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white resize-y"
              />
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleReply}
                  disabled={isReplying || !adminReply.trim()}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isReplying ? "儲存中..." : "儲存回覆"}
                </button>
                <Link
                  href={`/admin/ContactMessages/${messageId}/edit`}
                  className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
                >
                  編輯
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMessageDetailPage;
