"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface AccountsData {
  id: string;
  client_name: string;
  title: string;
  description: string;
  price: number;
  total: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  title: string;
  timeHours: number;
  Coursedates: string[];
  teacherId: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
  role: string;
  hourlyRate: number | null;  // 🔥 加入時薪
  Course: Course[];
}

const AccountsListsPage = () => {
  const [accountsData, setAccountsData] = useState<AccountsData[]>([]);
  const [teachersData, setTeachersData] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const accountsResponse = await fetch("/api/Accounts/Get_Accounts_Lists");
        const accountsData = await accountsResponse.json();
        setAccountsData(accountsData);

        const teachersResponse = await fetch("/api/user/Get_Teachers_With_Course");
        const teachersData = await teachersResponse.json();
        setTeachersData(teachersData);
        setFilteredTeachers(teachersData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = teachersData;

    if (selectedTeacher) {
      result = result.filter((teacher) => teacher.id === selectedTeacher);
    }

    if (selectedMonth) {
      result = result
        .map((teacher) => ({
          ...teacher,
          Course: teacher.Course.map((course) => ({
            ...course,
            Coursedates: course.Coursedates.filter((date) => {
              const dateObj = new Date(date);
              return dateObj.getMonth() + 1 === parseInt(selectedMonth);
            }),
          })).filter((course) => course.Coursedates.length > 0),
        }))
        .filter((teacher) => teacher.Course.length > 0);
    }

    if (selectedYear) {
      result = result
        .map((teacher) => ({
          ...teacher,
          Course: teacher.Course.map((course) => ({
            ...course,
            Coursedates: course.Coursedates.filter((date) => {
              const dateObj = new Date(date);
              return dateObj.getFullYear() === parseInt(selectedYear);
            }),
          })).filter((course) => course.Coursedates.length > 0),
        }))
        .filter((teacher) => teacher.Course.length > 0);
    }

    setFilteredTeachers(result);
  }, [selectedTeacher, selectedMonth, selectedYear, teachersData]);

  // ───────────────────────────────────────────
  // 導出為 TXT
  // ───────────────────────────────────────────

  const exportAccountsToTxt = () => {
    const headers = ["標題", "客戶", "金額", "日期"];
    const rows = accountsData.map((account) => [
      account.title,
      account.client_name,
      `$${account.total}`,
      new Date(account.date).toLocaleDateString("zh-TW"),
    ]);
    const content = [headers.join("\t"), ...rows.map((row) => row.join("\t"))].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Accounts_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ───────────────────────────────────────────
  // 導出為 Excel
  // ───────────────────────────────────────────

  const exportAccountsToExcel = () => {
    const worksheetData = accountsData.map((account) => ({
      標題: account.title,
      客戶: account.client_name,
      金額: account.total,
      日期: new Date(account.date).toLocaleDateString("zh-TW"),
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");
    XLSX.writeFile(workbook, `Accounts_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ───────────────────────────────────────────
  // 導出為 PDF（html2canvas 方式，完美支援中文）
  // ───────────────────────────────────────────

  const exportAccountsToPdf = async () => {
    const tableHtml = `
      <div style="font-family: 'Microsoft JhengHei', 'Noto Sans TC', 'PingFang TC', sans-serif; padding: 30px; width: 750px;">
        <h1 style="font-size: 24px; color: #1f2937; margin-bottom: 8px;">帳目記錄</h1>
        <p style="font-size: 12px; color: #6b7280; margin-bottom: 20px;">匯出日期：${new Date().toLocaleDateString("zh-TW")}</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #3b82f6; color: white;">
              <th style="padding: 10px 12px; border: 1px solid #d1d5db; text-align: left;">標題</th>
              <th style="padding: 10px 12px; border: 1px solid #d1d5db; text-align: left;">客戶</th>
              <th style="padding: 10px 12px; border: 1px solid #d1d5db; text-align: right;">金額</th>
              <th style="padding: 10px 12px; border: 1px solid #d1d5db; text-align: center;">日期</th>
            </tr>
          </thead>
          <tbody>
            ${accountsData
              .map(
                (account, index) => `
              <tr style="background: ${index % 2 === 0 ? "#ffffff" : "#f3f4f6"};">
                <td style="padding: 8px 12px; border: 1px solid #d1d5db;">${account.title}</td>
                <td style="padding: 8px 12px; border: 1px solid #d1d5db;">${account.client_name}</td>
                <td style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: right;">$${account.total}</td>
                <td style="padding: 8px 12px; border: 1px solid #d1d5db; text-align: center;">${new Date(account.date).toLocaleDateString("zh-TW")}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    const container = document.createElement("div");
    container.innerHTML = tableHtml;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF("p", "mm", "a4");

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      doc.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        doc.addPage();
        doc.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      doc.save(`Accounts_${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  };

  // ───────────────────────────────────────────
  // 教師課程：導出為 TXT
  // ───────────────────────────────────────────

  const exportTeachersToTxt = () => {
    const content = filteredTeachers
      .map((teacher) => {
        const teacherHeader = `教師: ${teacher.name} (${teacher.email})`;
        const hourlyInfo = teacher.hourlyRate
          ? `  時薪: HK$${teacher.hourlyRate}/小時`
          : `  時薪: 未設定`;
        const courses = teacher.Course.map((course) => {
          const totalHours = course.timeHours * course.Coursedates.length;
          const courseSalary = teacher.hourlyRate ? totalHours * teacher.hourlyRate : 0;
          const courseHeader = `  課程: ${course.title}`;
          const hoursInfo = `  總時數: ${totalHours} 小時 → HK$${courseSalary.toLocaleString()}`;
          const dates = course.Coursedates.map((date) =>
            `    - ${new Date(date).toLocaleDateString("zh-TW", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
            })}`
          ).join("\n");
          return [courseHeader, hoursInfo, dates].join("\n");
        }).join("\n\n");
        return [teacherHeader, hourlyInfo, courses].join("\n");
      })
      .join("\n\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Teachers_Courses_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ───────────────────────────────────────────
  // 教師課程：導出為 Excel
  // ───────────────────────────────────────────

  const exportTeachersToExcel = () => {
    const worksheetData = filteredTeachers.flatMap((teacher) =>
      teacher.Course.map((course) => {
        const totalHours = course.timeHours * course.Coursedates.length;
        const courseSalary = teacher.hourlyRate ? totalHours * teacher.hourlyRate : 0;
        return {
          教師姓名: teacher.name,
          教師電郵: teacher.email,
          時薪: teacher.hourlyRate ? `HK$${teacher.hourlyRate}` : "未設定",
          課程標題: course.title,
          總時數: totalHours,
          課程薪資: courseSalary,
          上課日期: course.Coursedates
            .map((date) =>
              new Date(date).toLocaleDateString("zh-TW", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "short",
              })
            )
            .join("; "),
        };
      })
    );
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers_Courses");
    XLSX.writeFile(workbook, `Teachers_Courses_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ───────────────────────────────────────────
  // 教師課程：導出為 PDF
  // ───────────────────────────────────────────

  const exportTeachersToPdf = async () => {
    let filterText = `匯出日期：${new Date().toLocaleDateString("zh-TW")}`;
    if (selectedTeacher) {
      const teacher = teachersData.find((t) => t.id === selectedTeacher);
      filterText += ` | 教師：${teacher?.name || selectedTeacher}`;
    }
    if (selectedMonth) filterText += ` | ${selectedMonth}月`;
    if (selectedYear) filterText += ` | ${selectedYear}年`;

    const tableHtml = `
      <div style="font-family: 'Microsoft JhengHei', 'Noto Sans TC', 'PingFang TC', sans-serif; padding: 30px; width: 750px;">
        <h1 style="font-size: 24px; color: #1f2937; margin-bottom: 8px;">教師課程時間 - 薪資結算</h1>
        <p style="font-size: 12px; color: #6b7280; margin-bottom: 20px;">${filterText}</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #10b981; color: white;">
              <th style="padding: 8px 10px; border: 1px solid #d1d5db; text-align: left;">教師</th>
              <th style="padding: 8px 10px; border: 1px solid #d1d5db; text-align: left;">時薪</th>
              <th style="padding: 8px 10px; border: 1px solid #d1d5db; text-align: left;">課程</th>
              <th style="padding: 8px 10px; border: 1px solid #d1d5db; text-align: center;">總時數</th>
              <th style="padding: 8px 10px; border: 1px solid #d1d5db; text-align: right;">薪資</th>
              <th style="padding: 8px 10px; border: 1px solid #d1d5db; text-align: left;">上課日期</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTeachers
              .flatMap((teacher) =>
                teacher.Course.map((course) => {
                  const totalHours = course.timeHours * course.Coursedates.length;
                  const courseSalary = teacher.hourlyRate ? totalHours * teacher.hourlyRate : 0;
                  return {
                    name: teacher.name,
                    hourlyRate: teacher.hourlyRate ? `HK$${teacher.hourlyRate}` : "-",
                    courseTitle: course.title,
                    totalHours,
                    salary: courseSalary,
                    dates: course.Coursedates
                      .map((date) =>
                        new Date(date).toLocaleDateString("zh-TW", { month: "numeric", day: "numeric" })
                      )
                      .join("、"),
                  };
                })
              )
              .map(
                (row, index) => `
              <tr style="background: ${index % 2 === 0 ? "#ffffff" : "#ecfdf5"};">
                <td style="padding: 6px 10px; border: 1px solid #d1d5db;">${row.name}</td>
                <td style="padding: 6px 10px; border: 1px solid #d1d5db; text-align: center;">${row.hourlyRate}</td>
                <td style="padding: 6px 10px; border: 1px solid #d1d5db;">${row.courseTitle}</td>
                <td style="padding: 6px 10px; border: 1px solid #d1d5db; text-align: center;">${row.totalHours}</td>
                <td style="padding: 6px 10px; border: 1px solid #d1d5db; text-align: right; font-weight: bold; color: #059669;">
                  HK$${row.salary.toLocaleString()}
                </td>
                <td style="padding: 6px 10px; border: 1px solid #d1d5db; font-size: 10px;">${row.dates}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    const container = document.createElement("div");
    container.innerHTML = tableHtml;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF("p", "mm", "a4");

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      doc.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        doc.addPage();
        doc.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      doc.save(`Teachers_Courses_${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  };

  // ───────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">帳目與教師課程薪資管理</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左側：帳目數據 */}
          <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">帳目記錄</h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={exportAccountsToTxt} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm">TXT</button>
                <button onClick={exportAccountsToExcel} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm">Excel</button>
                <button onClick={exportAccountsToPdf} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm">PDF</button>
              </div>
            </div>
            <Link href={"/admin/Accounts/createBill"} className="block mb-4">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">新增帳目</button>
            </Link>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">標題</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客戶</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accountsData.map((account) => (
                    <tr key={account.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{account.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.client_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${account.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(account.date).toLocaleDateString("zh-TW")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 右側：教師課程薪資 */}
          <div className="w-full lg:w-1/2 bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">📊 教師課程薪資結算</h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={exportTeachersToTxt} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm">TXT</button>
                <button onClick={exportTeachersToExcel} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm">Excel</button>
                <button onClick={exportTeachersToPdf} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm">PDF</button>
              </div>
            </div>

            {/* 篩選條件 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">教師</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部教師</option>
                  {teachersData.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} {teacher.hourlyRate ? `(HK$${teacher.hourlyRate}/hr)` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">月份</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部月份</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>{month}月</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年份</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">全部年份</option>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 教師列表 + 薪資 */}
            <div className="space-y-6">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => {
                  // 計算該教師的總薪資
                  const teacherTotalHours = teacher.Course.reduce(
                    (sum, course) => sum + course.timeHours * course.Coursedates.length, 0
                  );
                  const teacherTotalSalary = teacher.hourlyRate
                    ? teacherTotalHours * teacher.hourlyRate
                    : 0;

                  return (
                    <div key={teacher.id} className="border border-gray-200 rounded-lg p-4">
                      {/* 教師標題 + 時薪 + 薪資小計 */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-lg text-gray-800">{teacher.name}</h3>
                          {teacher.hourlyRate ? (
                            <p className="text-xs text-gray-400 mt-1">時薪: HK${teacher.hourlyRate}/小時</p>
                          ) : (
                            <p className="text-xs text-orange-400 mt-1">⚠️ 尚未設定時薪</p>
                          )}
                        </div>

                        {/* 薪資總計區塊 */}
                        {teacher.hourlyRate ? (
                          <div className="text-right bg-blue-50 px-4 py-2 rounded-lg">
                            <p className="text-xs text-blue-500">薪資小計</p>
                            <p className="text-lg font-bold text-blue-700">HK${teacherTotalSalary.toLocaleString()}</p>
                            <p className="text-xs text-blue-400">({teacherTotalHours} 小時)</p>
                          </div>
                        ) : (
                          <div className="text-right bg-gray-50 px-4 py-2 rounded-lg">
                            <p className="text-xs text-gray-400">薪資</p>
                            <p className="text-lg font-bold text-gray-400">-</p>
                          </div>
                        )}
                      </div>

                      {/* 課程列表 */}
                      {teacher.Course.length > 0 ? (
                        teacher.Course.map((course) => {
                          const totalHours = course.timeHours * course.Coursedates.length;
                          const courseSalary = teacher.hourlyRate ? totalHours * teacher.hourlyRate : 0;

                          return (
                            <div key={course.id} className="ml-4 mb-4 border-l-2 border-blue-100 pl-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-700 mb-1">{course.title}</h4>
                                  <p className="text-sm text-gray-600 mb-2">
                                    時數: {totalHours} 小時
                                    {teacher.hourlyRate && (
                                      <span className="text-green-600 font-medium ml-2">
                                        → HK${courseSalary.toLocaleString()}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              {course.Coursedates.length > 0 && (
                                <div className="ml-2">
                                  <p className="text-sm font-medium text-gray-600 mb-1">上課日期:</p>
                                  <ul className="list-disc pl-5 text-sm text-gray-500">
                                    {course.Coursedates.map((date, index) => (
                                      <li key={index}>
                                        {new Date(date).toLocaleDateString("zh-TW", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                          weekday: "short",
                                        })}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500 ml-4">沒有符合條件的課程</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-8">沒有符合條件的教師課程</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsListsPage;
