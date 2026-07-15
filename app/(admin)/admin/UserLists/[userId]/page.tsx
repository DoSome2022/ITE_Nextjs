"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface UserDetail {
  id: string;
  username: string;
  password: string;
  email: string | null;
  emailVerified: string | null;
  phone: string | null;
  phoneVerified: string | null;
  name: string | null;
  role: string;
  teacherholidaysDateTime: string[];
  createdAt: string;
  updatedAt: string;
}

const UserDetailbyIdPage = () => {
  const params = useParams();
  const userId = params.userId as string;

  const [getUserDetail, setGetUserDetail] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user/Get_User_Lists_by_Id/${userId}`);
        if (!response.ok) {
          throw new Error(`API 錯誤: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setGetUserDetail(data);
      } catch (error) {
        console.error("fetchUserDataLists error:", error);
        setError(error instanceof Error ? error.message : "無法獲取用戶數據");
      }
    };
    fetchUserData();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">用戶詳情</h1>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {getUserDetail ? (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">用戶ID</p>
                <p className="text-lg">{getUserDetail.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">用戶名</p>
                <p className="text-lg">{getUserDetail.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">姓名</p>
                <p className="text-lg">{getUserDetail.name || "未提供"}</p>
              </div>
              {/* <div>
                <p className="text-sm text-gray-400">電子郵件</p>
                <p className="text-lg">{getUserDetail.email || "未提供"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">電話</p>
                <p className="text-lg">{getUserDetail.phone || "未提供"}</p>
              </div> */}
              <div>
                <p className="text-sm text-gray-400">角色</p>
                <p className="text-lg">{getUserDetail.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">創建時間</p>
                <p className="text-lg">
                  {new Date(getUserDetail.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">更新時間</p>
                <p className="text-lg">
                  {new Date(getUserDetail.updatedAt).toLocaleString()}
                </p>
              </div>
              {/* <div>
                <p className="text-sm text-gray-400">教師假期</p>
                <p className="text-lg">
                  {getUserDetail.teacherholidaysDateTime.length > 0
                    ? getUserDetail.teacherholidaysDateTime.join(", ")
                    : "無"}
                </p>
              </div> */}
              {/* <div>
                <p className="text-sm text-gray-400">電子郵件驗證</p>
                <p className="text-lg">
                  {getUserDetail.emailVerified
                    ? new Date(getUserDetail.emailVerified).toLocaleString()
                    : "未驗證"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">電話驗證</p>
                <p className="text-lg">
                  {getUserDetail.phoneVerified
                    ? new Date(getUserDetail.phoneVerified).toLocaleString()
                    : "未驗證"}
                </p>
              </div> */}
            </div>
<div className="mt-6 flex gap-3">
  <button
    onClick={() => window.history.back()}
    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
  >
    返回
  </button>
  <Link
    href={`/admin/UserLists/${userId}/edit`}
    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
  >
    編輯用戶資料
  </Link>
</div>
          </div>
        ) : (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <p>正在加載用戶數據...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailbyIdPage;