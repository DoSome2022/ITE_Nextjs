// app/(admin)/admin/TeacherLists/CreateTeacher/page.tsx

"use client";

import Create_Teacher_Form from "@/components/CreateForm/Create-Teacher-Form";
import Link from "next/link";

const CreateTeacherPage = () => {
  return (
    <div className="bg-gray-800 text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">建立教師</h1>
          <Link
            href="/admin/TeacherLists"
            className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
          >
            返回
          </Link>
        </div>
        <Create_Teacher_Form />
      </div>
    </div>
  );
};

export default CreateTeacherPage;