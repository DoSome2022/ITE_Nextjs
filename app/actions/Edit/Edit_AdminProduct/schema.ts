// app/actions/Edit/Edit_AdminProduct/schema.ts
import { z } from "zod";

// 移除 File 檢查！改用型別守衛在 Action 內處理
export const EditProductSchema = z.object({
  productId: z.string().uuid({ message: "無效的產品 ID" }),
  title: z.string().min(1, { message: "標題不能為空" }),
  description: z.string().min(1, { message: "描述不能為空" }),
  price: z.number().min(0, { message: "價格必須大於等於 0" }),
  real_price: z.number().min(0, { message: "實際價格必須大於等於 0" }),
  IsPublic: z.boolean(),
  CoursePorductTypeArray: z.array(z.string()),
  CoursePorductStatueArray: z.array(z.string()),
  images: z.array(z.any()).optional(), // 先用 any，後續用守衛

  video_urls: z
    .array(
      z.string().trim().refine(
        (val) => val === "" || z.string().url().safeParse(val).success,
        { message: "必須是有效的 URL" }
      )
    )
    .transform((urls) => urls.filter((url) => url !== ""))
    .optional(),
});