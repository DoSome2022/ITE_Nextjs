"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ← 加入

interface TeacherData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const TeacherListsPage = () => {
  const [getTeacherDataLists, setGetTeacherDataLists] = useState<TeacherData[]>([]);
  const router = useRouter(); // ← 加入
  const [deleteTarget, setDeleteTarget] = useState<TeacherData | null>(null); // ← 加入
  const [isDeleting, setIsDeleting] = useState(false); // ← 加入


  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const response = await fetch("/api/user/Get_User_Lists");
        if (!response.ok) {
          throw new Error("Failed to fetch teacher data");
        }
        const data = await response.json();
        setGetTeacherDataLists(data);
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      }
    };
    fetchTeacherData();
  }, []);

    // ← 加入刪除處理
  const handleDelete = async (teacherId: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/user/Delete_User/${teacherId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("刪除失敗");
      
      // 從列表中移除
      setGetTeacherDataLists((prev) => prev.filter((t) => t.id !== teacherId));
      setDeleteTarget(null);
    } catch (error) {
      console.error("刪除失敗：", error);
      alert("刪除失敗，請稍後再試");
    } finally {
      setIsDeleting(false);
    }
  };

  console.log("getTeacherDataLists:", getTeacherDataLists, "-- End --");

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 標題與創建按鈕 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">教師列表</h1>
          <Link
            href="/admin/TeacherLists/CreateTeacher"
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
          >
            建立老師
          </Link>
        </div>

        {/* 教師列表 */}
        <div className="bg-gray-800 shadow-lg rounded-lg overflow-hidden">
          {getTeacherDataLists.length === 0 ? (
            <p className="p-4 text-gray-400">正在加載或無教師數據...</p>
          ) : (
            <div className="divide-y divide-gray-700">
{getTeacherDataLists.map(
  (teacher) =>
    teacher.role === "TEACHER" && (
      <div
        key={teacher.id}
        className="flex items-center justify-between px-4 py-3 hover:bg-gray-700 transition"
      >
        <Link
          href={`/admin/TeacherLists/${teacher.id}`}
          className="flex-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-base font-medium">{teacher.name}</span>
            <span className="text-sm text-gray-400">{teacher.email}</span>
          </div>
        </Link>
        <div className="flex gap-2 ml-4">
          <Link
            href={`/admin/TeacherLists/${teacher.id}/edit`}
            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
          >
            編輯
          </Link>
          <button
            onClick={() => setDeleteTarget(teacher)}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
          >
            刪除
          </button>
        </div>
      </div>
    )
)}

{/* 刪除確認對話框（列表頁版本） */}
{deleteTarget && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
      <h3 className="text-xl font-bold mb-4">確認刪除</h3>
      <p className="text-gray-300 mb-2">
        您確定要刪除教師 <strong>{deleteTarget.name}</strong> 嗎？
      </p>
      <p className="text-red-400 text-sm mb-4">
        ⚠️ 此操作將一併刪除該教師的所有關聯資料。
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={() => setDeleteTarget(null)}
          disabled={isDeleting}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition disabled:opacity-50"
        >
          取消
        </button>
        <button
          onClick={() => handleDelete(deleteTarget.id)}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
        >
          {isDeleting ? "刪除中..." : "確認刪除"}
        </button>
      </div>
    </div>
  </div>
)}


            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherListsPage;