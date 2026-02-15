


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
    <div className="bg-gray-800 text-white shadow-lg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <FormLabel className="text-white font-medium">
                      用戶名稱
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="輸入用戶名稱"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500 rounded-md px-3 py-2"
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
                    <FormLabel className="text-white font-medium">
                      姓名
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                        placeholder="輸入姓名"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500 rounded-md px-3 py-2"
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
                    <FormLabel className="text-white font-medium">
                      密碼
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="輸入密碼"
                        type="password"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500 rounded-md px-3 py-2"
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
                    <FormLabel className="text-white font-medium">
                      電話
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                        placeholder="輸入電話"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-gray-500 focus:border-gray-500 rounded-md px-3 py-2"
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
              className="w-full bg-gray-700 text-white hover:bg-gray-600 font-medium rounded-md px-3 py-2"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
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