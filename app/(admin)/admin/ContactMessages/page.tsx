"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  productTypes: string[];
  contactType: string;
  details: string;
  status: string;
  adminReply: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待處理", color: "bg-yellow-100 text-yellow-800" },
  REPLIED: { label: "已回覆", color: "bg-green-100 text-green-800" },
  CLOSED: { label: "已關閉", color: "bg-gray-100 text-gray-800" },
};

const AdminContactMessagesPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, replied: 0 });

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);
      params.append("page", currentPage.toString());
      params.append("limit", "20");

      const res = await fetch(`/api/contact-admin?${params}`);
      if (!res.ok) throw new Error("無法載入資料");
      const data = await res.json();
      setMessages(data.messages);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "載入失敗");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [totalRes, pendingRes, repliedRes] = await Promise.all([
        fetch("/api/contact-admin"),
        fetch("/api/contact-admin?status=PENDING"),
        fetch("/api/contact-admin?status=REPLIED"),
      ]);
      const total = await totalRes.json();
      const pending = await pendingRes.json();
      const replied = await repliedRes.json();
      setStats({
        total: total.pagination?.total || 0,
        pending: pending.pagination?.total || 0,
        replied: replied.pagination?.total || 0,
      });
    } catch {}
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [statusFilter, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMessages();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("刪除失敗");
      setMessages((prev) => prev.filter((m) => m.id !== id));
      fetchStats();
    } catch (err) {
      alert("刪除失敗");
    } finally {
      setDeletingId(null);
      setShowConfirm(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">聯絡表單管理</h1>

        {/* 統計卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-gray-400 text-sm">全部表單</div>
          </div>
          <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-700">
            <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-yellow-400 text-sm">待處理</div>
          </div>
          <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
            <div className="text-3xl font-bold text-green-400">{stats.replied}</div>
            <div className="text-green-400 text-sm">已回覆</div>
          </div>
        </div>

        {/* 搜尋與篩選 */}
        <div className="flex gap-4 mb-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋姓名、電郵或電話..."
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
            >
              搜尋
            </button>
          </form>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          >
            <option value="">全部狀態</option>
            <option value="PENDING">待處理</option>
            <option value="REPLIED">已回覆</option>
            <option value="CLOSED">已關閉</option>
          </select>
        </div>

        {/* 列表 */}
        {error && <div className="text-red-500 mb-4">{error}</div>}

        {loading ? (
          <div className="text-center py-8">載入中...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">暫無聯絡表單</div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700 text-left">
                  <th className="px-4 py-3">狀態</th>
                  <th className="px-4 py-3">稱名</th>
                  <th className="px-4 py-3">電話</th>
                  <th className="px-4 py-3">電郵</th>
                  <th className="px-4 py-3">類型</th>
                  <th className="px-4 py-3">商品類型</th>
                  <th className="px-4 py-3">提交時間</th>
                  <th className="px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        STATUS_MAP[msg.status]?.color || "bg-gray-500"
                      }`}>
                        {STATUS_MAP[msg.status]?.label || msg.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/ContactMessages/${msg.id}`}
                        className="text-blue-400 hover:underline"
                      >
                        {msg.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{msg.phone}</td>
                    <td className="px-4 py-3">{msg.email}</td>
                    <td className="px-4 py-3">{msg.contactType}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {msg.productTypes.map((type, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-600 rounded text-xs">
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDate(msg.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/ContactMessages/${msg.id}`}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          查看
                        </Link>
                        <button
                          onClick={() => setShowConfirm(msg.id)}
                          disabled={deletingId === msg.id}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          {deletingId === msg.id ? "刪除中..." : "刪除"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 分頁 */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-700 rounded disabled:opacity-50"
            >
              上一頁
            </button>
            <span className="px-3 py-2 text-gray-400">
              第 {pagination.page} / {pagination.totalPages} 頁
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-2 bg-gray-700 rounded disabled:opacity-50"
            >
              下一頁
            </button>
          </div>
        )}

        {/* 刪除確認對話框 */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-sm">
              <h3 className="text-lg font-bold mb-2">確認刪除</h3>
              <p className="text-gray-300 mb-4">確定要永久刪除此表單嗎？</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(null)}
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(showConfirm)}
                  className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                >
                  確認刪除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContactMessagesPage;
