//app/(user)/user/[userId]/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserData {
  id: string;
  username: string;
  name: string;
  email: string | null;
  emailVerified: string | null;
  phone: string | null;
  phoneVerified: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
  teacherholidaysDateTime: string[];
}

interface Account {
  id: string;
  cilent_name: string;
  title: string;
  description: string;
  price: number;
  total: number;
  date: string;
  client_id: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log("userId:",userId,"--end--")

  useEffect(() => {
async function fetchAccountsData() {
  try {
    setIsLoading(true);
    const response = await fetch(`/api/Accounts/Get_Accounts_Lists_by_User/${userId}`);
    if (!response.ok) {
      if (response.status === 404) {
        // 404 表示無匹配記錄，返回空陣列
        setAccounts([]);
        setFilteredAccounts([]);
        return;
      }
      throw new Error(`請求失敗: ${response.status}`);
    }
    const data = await response.json();
    setAccounts(data);
    setFilteredAccounts(data); // 初始化時顯示所有帳目
  } catch (error) {
    console.error("Error fetching accounts data:", error);
    setError("無法獲取帳目數據");
  } finally {
    setIsLoading(false);
  }
}
    async function fetchUserData() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/user/Get_User_Lists_by_Id/${userId}`);
        if (!response.ok) {
          throw new Error(`請求失敗: ${response.status}`);
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("無法獲取用戶數據");
      }
    }
    
    if (status === "authenticated") {
      fetchUserData();
      fetchAccountsData();
    }
  }, [status, userId]);

  // 應用日期篩選
  useEffect(() => {
    let result = accounts;
    
    if (startDate) {
      result = result.filter(account => 
        new Date(account.date) >= new Date(startDate)
  )}
    
    if (endDate) {
      // 結束日期加一天以包含當天的所有記錄
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      
      result = result.filter(account => 
        new Date(account.date) < end)
    }
    
    setFilteredAccounts(result);
  }, [startDate, endDate, accounts]);

  // 檢查登錄狀態和用戶ID
  useEffect(() => {
    if (status === "authenticated" && session?.user.id !== userId) {
      router.push("/login");
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, session, userId, router]);

  if (isLoading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
          </svg>
          載入中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "USER") {
    return null;
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 上方：用戶資料部分 */}
        <div className="bg-gray-800 shadow-lg rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">歡迎，{session.user.name}</h1>
          <h2 className="text-xl font-semibold mb-4">學生資料</h2>
          
          {userData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">學生 ID</p>
                <p className="text-base">{userData.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">登入帳號</p>
                <p className="text-base">{userData.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">學生姓名</p>
                <p className="text-base">{userData.name || "未設置"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">電子郵件</p>
                <p className="text-base">{userData.email || "未設置"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">電話</p>
                <p className="text-base">{userData.phone || "未設置"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">角色</p>
                <p className="text-base">{userData.role}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">無用戶數據</p>
          )}
        </div>

        {/* 下方：帳目數據部分 */}
        <div className="bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold mb-4 sm:mb-0">帳目記錄</h2>
            
            {/* 日期篩選器 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">開始日期</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-gray-700 text-white rounded px-3 py-2 w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">結束日期</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-gray-700 text-white rounded px-3 py-2 w-full"
                />
              </div>
              
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="mt-6 sm:mt-auto px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition"
              >
                清除篩選
              </button>
            </div>
          </div>

          {/* 帳目表格 */}
          {filteredAccounts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">標題</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">客戶名稱</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">描述</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">單價</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">總價</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">日期</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredAccounts.map((account) => (
                    <tr key={account.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{account.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{account.cilent_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{account.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${account.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${account.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(account.date).toLocaleDateString('zh-TW')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">沒有找到符合條件的帳目記錄</p>
            </div>
          )}
        </div>

        {/* 導航鏈接 */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-6">
          <Link
            href={`/user/${userId}/Calendar`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
          >
            查看我的日曆
          </Link>
          <Link
            href={`/user/${userId}/CourseLists`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition"
          >
            查看我的課程
          </Link>
        </div>
      </div>
    </div>
  );
}