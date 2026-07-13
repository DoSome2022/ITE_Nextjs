


"use client";

import { CreateUserSchema } from "@/app/actions/Create/Create_user/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateUserAction } from "@/app/actions/Create/Create_user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";           // ← 新增這行

const CreateUserForm_client = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const user_create_form = useForm<z.infer<typeof CreateUserSchema>>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      username: "",
      password: "",
      phone: "",
      name: "",
      role: "USER",
    },
  });

const user_create_form_onSubmit = async (
    values: z.infer<typeof CreateUserSchema>
  ) => {
    startTransition(async () => {
      try {
        const result = await CreateUserAction(values);

        if (!result.error) {
          // 顯示成功提示
          toast.success("用戶建立成功！即將跳轉至登入頁面", {
            duration: 2000,           // 顯示 3 秒
          });

          // 3 秒後跳轉
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          console.error("提交失敗:", result.error);
          user_create_form.setError("root", {
            type: "manual",
            message: result.error || "提交失敗，請重試",
          });
        }
      } catch (error) {
        console.error("提交時發生錯誤:", error);
        user_create_form.setError("root", {
          type: "manual",
          message: "提交失敗，請重試",
        });
      }
    });
  };

  return (
    <div className="text-black shadow-lg m-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">學生註冊</h1>
        {/* 報讀流程 */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm my-8">
            <h3 className="font-medium text-gray-800 text-lg mb-5">報讀課程流程</h3>
            
            <ol className="space-y-4">
              {/* Step 1 */}
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-xs font-medium">
                  1
                </div>
                <p className="text-gray-600">
                  註冊學生帳號
                </p>
              </li>
              
              {/* Step 2 */}
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-xs font-medium">
                  2
                </div>
                <p className="text-gray-600">
                  登錄學生帳號
                </p>
              </li>
              
              {/* Step 3 */}
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-xs font-medium">
                  3
                </div>
                <p className="text-gray-600">
                  選擇課程後，按「報名及付款」
                </p>
              </li>
              
              {/* Step 4 */}
              <li className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-xs font-medium">
                  4
                </div>
                <p className="text-gray-600">
                  完成付款程序，就能夠報讀該課程。
                </p>
              </li>
            </ol>
          </div>
        <Form {...user_create_form}>
          <form
            onSubmit={user_create_form.handleSubmit(user_create_form_onSubmit)}
            className="space-y-6"
          >
            {user_create_form.formState.errors.root && (
              <div className="text-red-500 text-sm font-medium">
                {user_create_form.formState.errors.root.message}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={user_create_form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=" font-medium">
                      登入帳號
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="輸入用戶名稱"
                        className=" border-gray-200  placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500 rounded-md px-3 py-2"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={user_create_form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=" font-medium">
                      學生姓名
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                        placeholder="輸入姓名"
                        className=" border-gray-200  placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500 rounded-md px-3 py-2"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={user_create_form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=" font-medium">
                      密碼
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="輸入密碼"
                        type="password"
                        className=" border-gray-200  placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500 rounded-md px-3 py-2"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={user_create_form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className=" font-medium">
                      電話
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                        placeholder="輸入電話"
                        className=" border-gray-200  placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500 rounded-md px-3 py-2"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full   hover:bg-gray-600 font-medium rounded-md px-3 py-2"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 "
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                    />
                  </svg>
                  提交中...
                </span>
              ) : (
                "提交"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateUserForm_client;