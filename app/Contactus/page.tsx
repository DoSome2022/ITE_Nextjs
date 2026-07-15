//app/contact/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// 預定義的商品類型選項（可從 API 獲取或直接定義）
const DEFAULT_PRODUCT_TYPES = [
  "課程諮詢",
  "教材購買",
  "培訓服務",
  "合作提案",
  "技術支援",
  "其他產品",
];

interface ProductTypeOption {
  value: string;
  label: string;
}

const ContactPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productTypes, setProductTypes] = useState<ProductTypeOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 表單資料
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    selectedProductTypes: [] as string[],
    contactType: "",
    otherType: "",
    details: "",
  });

  // 載入商品類型選項
  useEffect(() => {
    async function fetchProductTypes() {
      try {
        // 嘗試從資料庫中取得所有的 CourseProductType 值
        const res = await fetch("/api/product/types");
        if (res.ok) {
          const data = await res.json();
          if (data.types && data.types.length > 0) {
            setProductTypes(data.types.map((t: string) => ({ value: t, label: t })));
            return;
          }
        }
      } catch {
        // 如果 API 不存在，使用預設值
      }
      // 預設選項
      setProductTypes(DEFAULT_PRODUCT_TYPES.map((t) => ({ value: t, label: t })));
    }
    fetchProductTypes();
  }, []);

  // 處理輸入變更
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 處理多選商品類型
  const handleProductTypeToggle = (type: string) => {
    setFormData((prev) => {
      const selected = prev.selectedProductTypes.includes(type)
        ? prev.selectedProductTypes.filter((t) => t !== type)
        : [...prev.selectedProductTypes, type];
      return { ...prev, selectedProductTypes: selected };
    });
  };

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          productTypes: formData.selectedProductTypes,
          contactType: formData.contactType,
          otherType: formData.otherType,
          details: formData.details,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "提交失敗");
      }

      setSuccess(true);
      toast.success("感謝您的聯絡，我們將盡快回覆您！");

      // 3 秒後回到首頁
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "提交失敗";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">已收到您的訊息</h2>
          <p className="text-gray-600 mb-4">感謝您的聯絡，我們將盡快回覆您！</p>
          <p className="text-sm text-gray-400">即將返回首頁...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* 頁面標題 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">聯絡我們</h1>
          <p className="mt-2 text-gray-600">
            有任何問題或需求，歡迎填寫以下表單，我們將儘快與您聯繫
          </p>
        </div>

        {/* 表單 */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 稱名 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                稱名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="請輸入您的姓名"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 電話 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="請輸入您的聯絡電話"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 電郵 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電郵 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="請輸入您的電子郵件"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 商品類型（可多選） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                感興趣的產品 / 服務類型（可多選）
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {productTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`
                      flex items-center p-3 border rounded-lg cursor-pointer transition
                      ${
                        formData.selectedProductTypes.includes(type.value)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedProductTypes.includes(type.value)}
                      onChange={() => handleProductTypeToggle(type.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 聯絡類型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                類型 <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {["個人", "團體", "公司", "其他"].map((type) => (
                  <label
                    key={type}
                    className={`
                      flex items-center px-4 py-2 border rounded-lg cursor-pointer transition
                      ${
                        formData.contactType === type
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="contactType"
                      value={type}
                      checked={formData.contactType === type}
                      onChange={handleChange}
                      className="mr-2"
                      required
                    />
                    {type}
                  </label>
                ))}
              </div>

              {/* 如果選擇「其他」，顯示自訂輸入 */}
              {formData.contactType === "其他" && (
                <div className="mt-2">
                  <input
                    type="text"
                    name="otherType"
                    value={formData.otherType}
                    onChange={handleChange}
                    placeholder="請說明您的類型"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* 細節內容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                詳細內容 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="details"
                value={formData.details}
                onChange={handleChange}
                rows={6}
                placeholder="請詳細描述您的需求或問題..."
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              />
            </div>

            {/* 提交按鈕 */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "提交中..." : "提交表單"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                返回
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
