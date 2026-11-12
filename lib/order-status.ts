// lib/order-status.ts
// 訂單狀態正規化與 UI metadata（學員購買記錄頁共用）

export function isPaidStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return status.toUpperCase() === "PAID";
}

export interface OrderStatusMeta {
  label: string;
  className: string; // badge 背景色
}

export function getOrderStatusMeta(
  status: string | null | undefined
): OrderStatusMeta {
  const s = (status || "").toUpperCase();
  switch (s) {
    case "PAID":
      return { label: "已付款", className: "bg-green-600" };
    case "PENDING":
      return { label: "待付款", className: "bg-yellow-600" };
    case "FAILED":
      return { label: "失敗", className: "bg-red-600" };
    case "CANCELLED":
    case "CANCELED":
      return { label: "已取消", className: "bg-red-600" };
    default:
      return { label: status || "未知", className: "bg-gray-600" };
  }
}
