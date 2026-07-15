// app/(admin)/admin/UserLists/page.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface UserDataLists {
  id: string;
  username: string;
  phone: string | null;
  name: string | null;
  email: string | null;
  role: string;
}

const UserListsPage = () => {
  const [getUserDataLists, setGetUserDataLists] = useState<UserDataLists[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null); // 正在刪除的 ID
  const [showConfirm, setShowConfirm] = useState<string | null>(null); // 確認視窗
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);



  const usersPerPage = 10;

  useEffect(() => {
    const fetchUserDataLists = async () => {
      try {
        const response = await fetch("/api/user/Get_User_Lists");
        if (!response.ok) throw new Error(`API 錯誤: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setGetUserDataLists(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "無法獲取用戶數據");
      }
    };
    fetchUserDataLists();
  }, []);

  // 刪除用戶函式
  const handleDelete = async (userId: string) => {
    setDeletingId(userId);
    try {
      const res = await fetch(`/api/user/delete/${userId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "刪除失敗");
      }

      // 成功刪除後，從狀態中移除
      setGetUserDataLists((prev) => prev.filter((user) => user.id !== userId));
      alert("用戶已成功刪除");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "刪除失敗，請稍後再試");
    } finally {
      setDeletingId(null);
      setShowConfirm(null);
    }
  };

  // 匯出功能
const handleExport = async () => {
  try {
    const response = await fetch("/api/user/Export_Users");
    if (!response.ok) throw new Error("匯出失敗");
    
    // 建立下載連結
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert("匯出失敗，請稍後再試");
  }
};

// 匯入功能

const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setImporting(true);
  setImportResult(null);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/user/Import_Users", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "匯入失敗");
    }

    setImportResult(result);

    // 重新載入用戶列表
    const refreshResponse = await fetch("/api/user/Get_User_Lists");
    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      setGetUserDataLists(data);
    }
  } catch (error) {
    alert(error instanceof Error ? error.message : "匯入失敗");
  } finally {
    setImporting(false);
    // 重置 file input，讓用戶可以再次上傳同一個檔案
    e.target.value = "";
  }
};


  // 過濾與分頁邏輯（不變）
  const filteredUsers = getUserDataLists.filter(
    (user) =>
      (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.username?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.role?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
<div className="flex justify-between items-center mb-6">
  <h1 className="text-2xl font-bold">用戶列表</h1>
  <div className="flex gap-2">
    {/* 匯入按鈕 */}
    <button
      onClick={() => document.getElementById("importFileInput")?.click()}
      className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition"
    >
      匯入 CSV
    </button>
    <input
      id="importFileInput"
      type="file"
      accept=".csv"
      style={{ display: "none" }}
      onChange={handleImport}
    />
    
    {/* 匯出按鈕 */}
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition"
    >
      匯出 CSV
    </button>
    
    <Link
      href="/admin/UserLists/createUser"
      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
    >
      建立用戶
    </Link>
  </div>
</div>


        {error && (
          <div className="mb-4 text-red-500 p-4 bg-red-900/50 rounded-md">
            {error}
          </div>
        )}

{/* 匯入結果提示 */}
{importResult && (
  <div className={`mb-4 p-4 rounded-md ${
    importResult.failed > 0 ? "bg-yellow-900/50 text-yellow-300" : "bg-green-900/50 text-green-300"
  }`}>
    <p>匯入完成：成功 {importResult.success} 筆，失敗 {importResult.failed} 筆</p>
    {importResult.errors.length > 0 && (
      <details className="mt-2">
        <summary className="cursor-pointer text-sm">查看錯誤詳情</summary>
        <ul className="list-disc pl-5 mt-1 text-sm space-y-1">
          {importResult.errors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      </details>
    )}
  </div>
)}

{importing && (
  <div className="mb-4 p-4 bg-blue-900/50 text-blue-300 rounded-md">
    正在匯入資料，請稍候...
  </div>
)}


        <div className="mb-4">
          <input
            type="text"
            placeholder="搜尋用戶名稱、用戶名、電郵或角色..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden mb-6">
          {paginatedUsers.length === 0 ? (
            <p className="p-4 text-gray-400">無用戶數據或正在加載...</p>
          ) : (
            <div className="divide-y divide-gray-700">
              {paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-3 hover:bg-gray-700 transition flex items-center justify-between"
                >
                  <Link
                    href={`/admin/UserLists/${user.id}`}
                    className="flex-1 block"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-base font-medium">
                          {user.name || "無名稱"}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user.username}
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 text-right">
                        <div>{user.email || "無電郵"}</div>
                        <div>角色: {user.role}</div>
                        <div>電話: {user.phone || "無"}</div>
                      </div>
                    </div>
                  </Link>

                  {/* 刪除按鈕 */}
{/* 操作按鈕群組 */}
<div className="flex gap-2 ml-4">
  <Link
    href={`/admin/UserLists/${user.id}/edit`}
    onClick={(e) => {
      e.stopPropagation();
    }}
    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition"
  >
    編輯
  </Link>
  <button
    onClick={(e) => {
      e.stopPropagation();
      e.preventDefault();
      setShowConfirm(user.id);
    }}
    disabled={deletingId === user.id}
    className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm rounded transition"
  >
    {deletingId === user.id ? "刪除中..." : "刪除"}
  </button>
</div>
</div>
              ))}
            </div>
          )}
        </div>

        {/* 確認刪除視窗 */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4">確認刪除</h3>
              <p className="text-gray-300 mb-6">
                確定要永久刪除此用戶嗎？此操作無法復原。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirm(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(showConfirm)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white"
                >
                  確認刪除
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 分頁 */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2 mb-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 hover:bg-gray-600 transition"
            >
              上一頁
            </button>
            <span className="px-3 py-2 text-gray-400">
              第 {currentPage} 頁 / 共 {totalPages} 頁
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 hover:bg-gray-600 transition"
            >
              下一頁
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListsPage;