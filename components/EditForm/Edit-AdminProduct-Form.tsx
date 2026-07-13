
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EditProductSchema } from "@/app/actions/Edit/Edit_AdminProduct/schema";
import { EditProductAction } from "@/app/actions/Edit/Edit_AdminProduct";
import { z } from "zod";

interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  real_price: number;
  IsPublic: boolean;
  CourseProductTypeArray: string[];
  CourseProductStatusArray: string[];
  Product_Img: { id: string; img_url: string }[];
  Product_video: { id: string; video_url: string }[];
}

interface ProductType {
  id: string;
  typename: string;
}

interface ProductStatus {
  id: string;
  statuename: string;
}

const EditProductPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const productId = params.ProductId as string;
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [productStatuses, setProductStatuses] = useState<ProductStatus[]>([]);
  const [productdata, setproductdata] = useState<ProductData | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);

  console.log(" productId : ", productId, "-- End --");

  const form = useForm<z.infer<typeof EditProductSchema>>({
    resolver: zodResolver(EditProductSchema),
    defaultValues: {
      productId,
      title: "",
      description: "",
      price: 0,
      real_price: 0,
      IsPublic: false,
      CoursePorductTypeArray: [],
      CoursePorductStatueArray: [],
      images: [],
      video_urls: [],
    },
  });

  // 獲取產品數據和類型/狀態
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch(`/api/product/Get_Product_Lists_by_ID/${productId}`);
        if (!response.ok) {
          throw new Error(`請求失敗: ${response.status}`);
        }
        const data: ProductData = await response.json();

        console.log("in useEffect data :", data, "-- End --");
        
        // 根據實際 API 響應數據設置表單值
        form.reset({
          productId: data.id,
          title: data.title,
          description: data.description,
          price: data.price,
          real_price: data.real_price,
          IsPublic: data.IsPublic,
          CoursePorductTypeArray: data.CourseProductTypeArray || [],
          CoursePorductStatueArray: data.CourseProductStatusArray || [],
          images: [],
          video_urls: data.Product_video?.map((video) => video.video_url) || [],
        });
        
        setExistingImages(data.Product_Img?.map((img) => img.img_url) || []);
        setExistingVideos(data.Product_video?.map((video) => video.video_url) || []);
        setproductdata(data);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "無法獲取產品數據");
      }
    };

    const fetchProductTypesAndStatuses = async () => {
      try {
        const [typesRes, statusesRes] = await Promise.all([
          fetch("/api/Type/Get_Type_Lists"),
          fetch("/api/Status/Get_Status_Lists"),
        ]);
        if (!typesRes.ok || !statusesRes.ok) {
          throw new Error("無法獲取產品類型或狀態");
        }
        const typesData: ProductType[] = await typesRes.json();
        const statusesData: ProductStatus[] = await statusesRes.json();
        setProductTypes(typesData);
        setProductStatuses(statusesData);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "無法獲取產品類型或狀態");
      }
    };

    if (productId) {
      fetchProductData();
      fetchProductTypesAndStatuses();
    }
  }, [productId, form]);

  // 處理圖片選擇
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = files.filter((file) => {
      if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        toast.error(`無效的圖片類型：${file.name}`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`圖片 ${file.name} 大小超過 5MB`);
        return false;
      }
      return true;
    });

    form.setValue("images", validFiles, { shouldValidate: true });
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // 清理圖片預覽
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // 處理表單提交
  const onSubmit: SubmitHandler<z.infer<typeof EditProductSchema>> = async (values) => {
    if (status !== "authenticated" || session?.user?.role !== "ADMIN") {
      toast.error("未授權：僅限管理員操作");
      return;
    }

    const formData = new FormData();
    formData.append("productId", values.productId);
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("price", values.price.toString());
    formData.append("real_price", values.real_price.toString());
    formData.append("IsPublic", values.IsPublic.toString());
    formData.append("CoursePorductTypeArray", JSON.stringify(values.CoursePorductTypeArray));
    formData.append("CoursePorductStatueArray", JSON.stringify(values.CoursePorductStatueArray));
    // 檢查 images 是否存在，若不存在則不執行 forEach
    (values.images || []).forEach((image) => formData.append("images", image));
    formData.append("video_urls", JSON.stringify(values.video_urls || []));

    try {
      const result = await EditProductAction(formData);
      if (result.success) {
        toast.success("產品更新成功");
        router.push("/admin/ProductLists");
      } else {
        toast.error(result.error || "更新產品失敗");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "更新產品失敗");
    }
  };

  console.log("productdata : ", productdata, "-- End --");
  
  // 檢查表單是否已加載數據
  console.log("form values:", form.watch());

  console.log(" Error Check : ", form.formState.errors, "-- End --");

  return (
    <div className="bg-gray-800 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">編輯產品</h1>
          <Link
            href="/admin/ProductLists"
            className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium hover:bg-blue-700"
          >
            返回產品列表
          </Link>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 標題欄位 */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>標題</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="輸入產品標題"
                      className="w-full p-2 rounded-md bg-gray-800 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 描述欄位 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="輸入產品描述"
                      className="w-full p-2 rounded-md bg-gray-800 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      rows={5}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 價格欄位 */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>價格</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="輸入價格"
                      className="w-full p-2 rounded-md bg-gray-800 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      min="0"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 實際價格欄位 */}
            <FormField
              control={form.control}
              name="real_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>實際價格</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      placeholder="輸入實際價格"
                      className="w-full p-2 rounded-md bg-gray-800 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      min="0"
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 公開產品 Checkbox */}
            <FormField
              control={form.control}
              name="IsPublic"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-600 rounded"
                    />
                  </FormControl>
                  <FormLabel>公開產品</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 產品類型 Checkboxes */}
            <FormField
              control={form.control}
              name="CoursePorductTypeArray"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>產品類型</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4">
                      {productTypes.map((type) => (
                        <div key={type.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type.id}`}
                            checked={value.includes(type.id)} // 使用 type.id 而不是 typename
                            onCheckedChange={(checked) => {
                              const updatedTypes = checked
                                ? [...value, type.id]
                                : value.filter((t) => t !== type.id);
                              onChange(updatedTypes);
                            }}
                            disabled={form.formState.isSubmitting}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-600 rounded"
                          />
                          <label htmlFor={`type-${type.id}`} className="text-sm text-white">
                            {type.typename}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 產品狀態 Checkboxes */}
            <FormField
              control={form.control}
              name="CoursePorductStatueArray"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>產品狀態</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-4">
                      {productStatuses.map((status) => (
                        <div key={status.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status.id}`}
                            checked={value.includes(status.id)} // 使用 status.id 而不是 statuename
                            onCheckedChange={(checked) => {
                              const updatedStatuses = checked
                                ? [...value, status.id]
                                : value.filter((s) => s !== status.id);
                              onChange(updatedStatuses);
                            }}
                            disabled={form.formState.isSubmitting}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-600 rounded"
                          />
                          <label htmlFor={`status-${status.id}`} className="text-sm text-white">
                            {status.statuename}
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 影片 URL 欄位 */}
<FormField
  control={form.control}
  name="video_urls"
  render={({ field }) => (
    <FormItem>
      <FormLabel>影片 URL（多個以逗號分隔）</FormLabel>
      <FormControl>
        <Textarea
          // 直接將陣列用逗號組合顯示
          value={field.value?.join(",") || ""}
          onChange={(e) => {
            // 只用逗號切割，保留所有空白，讓 Zod 去處理後續的清理
            field.onChange(e.target.value.split(","));
          }}
          placeholder="輸入影片 URL，例如 https://www.youtube.com/watch?v=example1, https://www.youtube.com/watch?v=example2"
          className="w-full p-2 rounded-md bg-gray-800 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          rows={3}
          disabled={form.formState.isSubmitting}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>


            
            {/* 圖片上傳欄位 */}
            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>上傳圖片</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      multiple
                      onChange={handleImageChange}
                      disabled={form.formState.isSubmitting}
                      className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white file:hover:bg-blue-700"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* 現有圖片顯示 */}
            {existingImages.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">現有圖片</h3>
                <div className="grid grid-cols-3 gap-4">
                  {existingImages.map((url, index) => (
                    <Image
                      key={index}
                      src={url}
                      alt={`現有圖片 ${index + 1}`}
                      width={200}
                      height={128}
                      className="w-full h-32 object-cover rounded-md"
                      onError={() => toast.error(`無法載入圖片 ${index + 1}`)}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* 新圖片預覽 */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">新圖片預覽</h3>
                <div className="grid grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <Image
                      key={index}
                      src={preview}
                      alt={`預覽 ${index + 1}`}
                      width={200}
                      height={128}
                      className="w-full h-32 object-cover rounded-md"
                      unoptimized
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* 現有影片 URL 顯示 */}
            {existingVideos.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">現有影片 URL</h3>
                <ul className="list-disc pl-5">
                  {existingVideos.map((url, index) => (
                    <li key={index}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/ProductLists")}
                disabled={form.formState.isSubmitting}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {form.formState.isSubmitting ? "正在更新..." : "確定"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditProductPage;