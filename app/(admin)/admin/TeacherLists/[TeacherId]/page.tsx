// "use client";

// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";

// interface TeacherDatabyId {
//   id: string;
//   username: string;
//   password: string;
//   phone: string;
//   phoneVerified: boolean | null;
//   name: string;
//   role: string;
//   teacherholidaysDateTime: string[];
//   CourseModul:string[];
//   createdAt: string;
//   updatedAt: string;
// }

// const TeacherDatabyIdPage = () => {
//   const params = useParams();
//   const TeacherId = params.TeacherId as string;

//   const [GetTeacherData, setGetTeacherData] = useState<TeacherDatabyId | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchTeacherData = async () => {
//       try {
//         const res = await fetch(`/api/user/Get_User_Lists_by_Id/${TeacherId}`);
//         if (!res.ok) {
//           throw new Error(`API 錯誤: ${res.status} ${res.statusText}`);
//         }
//         const data = await res.json();
//         setGetTeacherData(data);
//       } catch (error) {
//         setError(error instanceof Error ? error.message : "無法載入老師數據");
//       }
//     };
//     fetchTeacherData();
//   }, [TeacherId]);

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
//         <div className="bg-red-600 px-4 py-2 rounded-md">{error}</div>
//       </div>
//     );
//   }

//   if (!GetTeacherData) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
//         <div className="text-lg">載入中...</div>
//       </div>
//     );
//   }

//   console.log("GetTeacherData : ",GetTeacherData)

//   return (
//     <div className="min-h-screen bg-gray-900 text-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="bg-gray-800 shadow-lg rounded-md p-6">
//           <h1 className="text-2xl font-bold mb-6">教師資料</h1>
//           <div className="space-y-4">
//             <div>
//               <span className="font-medium">教師 ID:</span> {GetTeacherData.id}
//             </div>
//             <div>
//               <span className="font-medium">用戶名:</span> {GetTeacherData.username}
//             </div>
//             <div>
//               <span className="font-medium">姓名:</span> {GetTeacherData.name}
//             </div>
//             <div>
//               <span className="font-medium">電話:</span> {GetTeacherData.phone}
//             </div>
//             <div>
//               <span className="font-medium">角色:</span> {GetTeacherData.role}
//             </div>
//             <div>
//               <span className="font-medium">創建時間:</span>{" "}
//               {new Date(GetTeacherData.createdAt).toLocaleString()}
//             </div>
//             <div>
//               <span className="font-medium">更新時間:</span>{" "}
//               {new Date(GetTeacherData.updatedAt).toLocaleString()}
//             </div>
//             <div>
//               <span className="font-medium">假期:</span>{" "}
//               {GetTeacherData.teacherholidaysDateTime.length > 0
//                 ? GetTeacherData.teacherholidaysDateTime.join(", ")
//                 : "無假期"}
//             </div>

//                         <div>
//               <span className="font-medium">教材:</span>{" "}
//               {GetTeacherData.CourseModul.length > 0
//                 ? GetTeacherData.CourseModul.join(", ")
//                 : "無教材"}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TeacherDatabyIdPage;


// app/(admin)/admin/TeacherLists/[TeacherId]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation"; // ← 加入 useRouter
import { useEffect, useState } from "react";

interface CourseModule {
  id: string;
  title: string;
  description: string;
  Teaching_Materials: string;
  originalFileName: string;
  createdAt: string;
  updatedAt: string;
  TeacherId: string;
}

interface TeacherDatabyId {
  id: string;
  username: string;
  password: string;
  phone: string;
  phoneVerified: boolean | null;
  name: string;
  role: string;
  address: string | null;       // ← 加入
  hourlyRate: number | null;    // ← 加入（時薪）
  teacherholidaysDateTime: string[];
  CourseModul: CourseModule[];
  createdAt: string;
  updatedAt: string;
}

const TeacherDatabyIdPage = () => {
  const params = useParams();
  const router = useRouter(); // ← 加入
  const TeacherId = params.TeacherId as string;

  const [GetTeacherData, setGetTeacherData] = useState<TeacherDatabyId | null>(null);
  const [error, setError] = useState<string | null>(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const res = await fetch(`/api/user/Get_User_Lists_by_Id/${TeacherId}`);
        if (!res.ok) {
          throw new Error(`API 錯誤: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        setGetTeacherData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "無法載入老師數據");
      }
    };
    fetchTeacherData();
  }, [TeacherId]);

    // ← 加入刪除處理函數
  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/user/Delete_User/${TeacherId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "刪除失敗");
      }

      // 刪除成功，跳轉回列表頁
      router.push("/admin/TeacherLists");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "刪除失敗");
    } finally {
      setIsDeleting(false);
    }
  };

// useEffect(() => {
//   const fetchTeacherData = async () => {
//     try {
//       const res = await fetch(`/api/user/Get_User_Lists_by_Id/${TeacherId}`);
//       if (!res.ok) {
//         throw new Error(`API 錯誤: ${res.status} ${res.statusText}`);
//       }
//       const data = await res.json();

//       // 為每個 CourseModule 的 Teaching_Materials 生成簽名 URL
//       const updatedCourseModules = await Promise.all(
//         data.CourseModul.map(async (module: CourseModule) => {
//           if (!module.Teaching_Materials) return module;
//           const objectKey = module.Teaching_Materials.split(
//             "ite-teacher-fold.oss-cn-hongkong.aliyuncs.com/"
//           )[1];
//           const ossRes = await fetch("/api/oss/get-signed-url", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               objectKey,
//               fileName: module.originalFileName,
//             }),
//           });
//           if (!ossRes.ok) throw new Error("無法獲取簽名 URL");
//           const ossData = await ossRes.json();
//           return { ...module, Teaching_Materials: ossData.url };
//         })
//       );

//       setGetTeacherData({ ...data, CourseModul: updatedCourseModules });
//     } catch (error) {
//       setError(error instanceof Error ? error.message : "無法載入老師數據");
//     }
//   };
//   fetchTeacherData();
// }, [TeacherId]);


  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-red-600 px-4 py-2 rounded-md">{error}</div>
      </div>
    );
  }

  if (!GetTeacherData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/admin/TeacherLists">
          返回
        </Link>
        <div className="bg-gray-800 shadow-lg rounded-md p-6">
          <h1 className="text-2xl font-bold mb-6">教師資料</h1>
          <div className="space-y-4">
            <div>
              <span className="font-medium">教師 ID:</span> {GetTeacherData.id}
            </div>
            <div>
              <span className="font-medium">用戶名:</span> {GetTeacherData.username}
            </div>
            <div>
              <span className="font-medium">姓名:</span> {GetTeacherData.name}
            </div>
            <div>
              <span className="font-medium">電話:</span> {GetTeacherData.phone}
            </div>
            <div>
              <span className="font-medium">角色:</span> {GetTeacherData.role}
            </div>
            <div>
              <span className="font-medium">創建時間:</span>{" "}
              {new Date(GetTeacherData.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">更新時間:</span>{" "}
              {new Date(GetTeacherData.updatedAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">假期:</span>{" "}
              {GetTeacherData.teacherholidaysDateTime.length > 0
                ? GetTeacherData.teacherholidaysDateTime.join(", ")
                : "無假期"}
            </div>
            <div>
              <span className="font-medium">教材:</span>{" "}
              {GetTeacherData.CourseModul.length > 0 ? (
                <ul className="list-disc pl-5">
                  {GetTeacherData.CourseModul.map((module) => (
                    <li key={module.id}>
                      {module.title} -{" "}
                      <a
                        href={module.Teaching_Materials}
                        download={module.originalFileName}
                        className="text-blue-400 hover:underline"
                      >
                        下載 ({module.originalFileName})
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                "無教材"
              )}
            </div>
            <div>
  <span className="font-medium">地址:</span>{" "}
  {GetTeacherData.address || "未設定"}
</div>
<div>
  <span className="font-medium">時薪:</span>{" "}
  {GetTeacherData.hourlyRate
    ? `HKD ${GetTeacherData.hourlyRate.toFixed(2)}/小時`
    : "未設定"}
</div>

{/* 在「教材」之後、整個 container 結束前加入編輯按鈕 */}
{/* 動作按鈕區域 */}
<div className="mt-6 pt-4 border-t border-gray-700 flex gap-3">
  <Link
    href={`/admin/TeacherLists/${TeacherId}/edit`}
    className="inline-block px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition"
  >
    編輯教師資料
  </Link>
  
  {/* 刪除按鈕 */}
  <button
    onClick={() => setShowDeleteConfirm(true)}
    className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition"
  >
    刪除教師
  </button>
</div>

{/* 刪除確認對話框 */}
{showDeleteConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl">
      <h3 className="text-xl font-bold mb-4">確認刪除</h3>
      <p className="text-gray-300 mb-2">
        您確定要刪除教師 <strong>{GetTeacherData.name}</strong> 嗎？
      </p>
      <p className="text-red-400 text-sm mb-4">
        ⚠️ 此操作將一併刪除該教師的所有關聯資料（課程、教材、訂單等），且無法復原。
      </p>

      {/* 刪除錯誤提示 */}
      {deleteError && (
        <div className="bg-red-600 text-white px-3 py-2 rounded-md mb-4 text-sm">
          {deleteError}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          onClick={() => {
            setShowDeleteConfirm(false);
            setDeleteError(null);
          }}
          disabled={isDeleting}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition disabled:opacity-50"
        >
          取消
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {isDeleting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              刪除中...
            </>
          ) : (
            "確認刪除"
          )}
        </button>
      </div>
    </div>
  </div>
)}

          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDatabyIdPage;