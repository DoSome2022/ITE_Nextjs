// "use client";

// import Link from "next/link";
// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import FullCalendar from "@fullcalendar/react";
// import dayGridPlugin from "@fullcalendar/daygrid";

// interface UserHoliday {
//   id: string;
//   teacherholidaysDateTime: string[];
// }

// const TeacherCalendarPage = () => {
//   const params = useParams();
//   console.log("params : ", params, "-- End --");
//   const TeacherId = params.Teacherid as string;

//   const [GetHolidaysData, setGetHolidaysData] = useState<UserHoliday | null>(null);
//   const [ GetTeacherCourses , setGetTeacherCourses ] = useState([]);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchHolidays = async () => {
//       try {
//         const res = await fetch(`/api/user/Get_User_Lists_by_Id/${TeacherId}`);
//         if (!res.ok) {
//           throw new Error(`API 錯誤: ${res.status} ${res.statusText}`);
//         }
//         const data = await res.json();
//         if (data.error) {
//           throw new Error(data.error);
//         }
//         setGetHolidaysData({
//           id: data.id,
//           teacherholidaysDateTime: data.teacherholidaysDateTime || [],
//         });
//       } catch (error) {
//         console.error("fetchHolidays error:", error);
//         setError(error instanceof Error ? error.message : "無法獲取假期數據");
//       }
//     };
 

//     const fetchTeacherCourse = async () => {
//       try { 
//         const res = await fetch(`/api/user/teacher/${TeacherId}/CourseLists`);
//         if (!res.ok) {
//           throw new Error(`API 錯誤: ${res.status} ${res.statusText}`);
//         }
//         const data = await res.json();
//         if (data.error) {
//           throw new Error(data.error);
//         }
//         setGetTeacherCourses(data);

//       } catch (error) {
//         console.error("fetchTeacherCourse error:", error);
//         setError(error instanceof Error ? error.message : "無法獲取課程數據");
//       }

//     }
//    if (TeacherId) {
//       fetchHolidays();
//       fetchTeacherCourse();
//     }

//   }, [TeacherId]);

//   console.log("GetHolidaysData :", GetHolidaysData, "-- End --");
//   console.log("GetTeacherCourses :", GetTeacherCourses, "-- End --");

//   // 將日期轉為包含星期的格式
//   const formatDateWithDay = (dateString: string) => {
//     const date = new Date(dateString);
//     const options: Intl.DateTimeFormatOptions = {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     };
//     return date.toLocaleDateString("zh-TW", options);
//   };

//   // 將假期數據轉為 FullCalendar 事件格式
//   const calendarEvents = GetHolidaysData?.teacherholidaysDateTime.map((date) => ({
//     title: "假期",
//     date: date,
//     allDay: true,
//   })) || [];

//   if (error) {
//     return <div className="text-red-500">{error}</div>;
//   }

//   if (!GetHolidaysData) {
//     return <div>載入中...</div>;
//   }

//   return (
//     <>
//       <Link href={`/teacher/${TeacherId}/calendar/AddHolidays`}>
//         加入假期
//       </Link>
//       <div>TeacherCalendarPage</div>

//       {GetHolidaysData.teacherholidaysDateTime.length > 0 ? (
//         GetHolidaysData.teacherholidaysDateTime.map((date, index) => (
//           <Link
//             key={`${GetHolidaysData.id}-${index}`}
//             href={`/teacher/${TeacherId}/calendar/${GetHolidaysData.id}/EditHolidays`}
//           >
//             <div>
//               <div>{formatDateWithDay(date)}</div>
//             </div>
//           </Link>
//         ))
//       ) : (
//         <div>無假期數據</div>
//       )}

//       <div style={{ height: "600px", marginTop: "20px" }}>
//         <FullCalendar
//           plugins={[dayGridPlugin]}
//           initialView="dayGridMonth"
//           events={calendarEvents}
//           locale="zh-tw"
//           height="100%"
//         />
//       </div>
//     </>
//   );
// };

// export default TeacherCalendarPage;

// app/(teacher)/teacher/[Teacherid]/calendar/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // ← 加入互動插件
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { DeleteHolidayAction } from "@/app/actions/Delete/Delete_Holiday";

interface UserHoliday {
  id: string;
  teacherholidaysDateTime: string[];
}

interface Course {
  id: string;
  title: string;
  Coursedates: string[];
  teacher: string[];
}

// 出席記錄 Map（key: courseId_date）
interface AttendanceMap {
  [key: string]: {
    id: string;
    status: string;
  };
}

const TeacherCalendarPage = () => {
  const params = useParams();
  const TeacherId = params.Teacherid as string;

  const [GetHolidaysData, setGetHolidaysData] = useState<UserHoliday | null>(null);
  const [GetTeacherCourses, setGetTeacherCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  // ← 新增：出席狀態 Map
  const [attendanceMap, setAttendanceMap] = useState<AttendanceMap>({});
  // ← 新增：正在標記中的 key
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await fetch(`/api/user/Get_User_Lists_by_Id/${TeacherId}`);
        if (!res.ok) throw new Error(`API 錯誤: ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setGetHolidaysData({
          id: data.id,
          teacherholidaysDateTime: data.teacherholidaysDateTime || [],
        });
      } catch (error) {
        console.error("fetchHolidays error:", error);
        setError(error instanceof Error ? error.message : "無法獲取假期數據");
      }
    };

    const fetchTeacherCourse = async () => {
      try {
        const res = await fetch(`/api/user/teacher/${TeacherId}/CourseLists`);
        if (!res.ok) throw new Error(`API 錯誤: ${res.status}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setGetTeacherCourses(data);
      } catch (error) {
        console.error("fetchTeacherCourse error:", error);
        setError(error instanceof Error ? error.message : "無法獲取課程數據");
      }
    };

    if (TeacherId) {
      fetchHolidays();
      fetchTeacherCourse();
    }
  }, [TeacherId]);

  // ← 新增：載入出席狀態
  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      if (!GetTeacherCourses.length || !TeacherId) return;

      // 建立所有(課程,日期)的組合
      const dateEntries: { courseId: string; date: string }[] = [];
      GetTeacherCourses.forEach((course) => {
        course.Coursedates.forEach((date) => {
          dateEntries.push({ courseId: course.id, date });
        });
      });

      if (dateEntries.length === 0) return;

      try {
        const res = await fetch(`/api/user/teacher/${TeacherId}/attendance/batch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ teacherId: TeacherId, dates: dateEntries }),
        });
        if (!res.ok) throw new Error("批次查詢失敗");
        const data = await res.json();
        setAttendanceMap(data.attendances || {});
      } catch (error) {
        console.error("載入出席狀態失敗:", error);
      }
    };

    fetchAttendanceStatus();
  }, [GetTeacherCourses, TeacherId]);

  // ← 新增：切換出席狀態
  const handleToggleAttendance = useCallback(
    async (courseId: string, date: string, courseTitle: string) => {
      const key = `${courseId}_${date}`;
      const isCurrentlyAttended = attendanceMap[key];

      setTogglingKey(key);

      try {
        const action = isCurrentlyAttended ? "unmark" : "mark";
        const res = await fetch(`/api/user/teacher/${TeacherId}/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teacherId: TeacherId,
            courseId,
            date,
            action,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "操作失敗");
        }

        const result = await res.json();

        // 更新本地狀態
        if (result.attended) {
          setAttendanceMap((prev) => ({
            ...prev,
            [key]: { id: result.attendance.id, status: "PRESENT" },
          }));
          toast.success(`已標記「${courseTitle}」為出席`);
        } else {
          setAttendanceMap((prev) => {
            const newMap = { ...prev };
            delete newMap[key];
            return newMap;
          });
          toast.success(`已取消「${courseTitle}」的出席標記`);
        }
      } catch (error) {
        console.error("Toggle attendance error:", error);
        toast.error(error instanceof Error ? error.message : "操作失敗");
      } finally {
        setTogglingKey(null);
      }
    },
    [TeacherId, attendanceMap]
  );

  // 刪除假期日期的函數
  const handleDeleteHoliday = async (date: string) => {
    try {
      const result = await DeleteHolidayAction({
        teacherId: TeacherId,
        date,
      });

      if (result.error) throw new Error(result.error);

      if (result.data) {
        setGetHolidaysData({
          id: result.data.id,
          teacherholidaysDateTime: result.data.teacherholidaysDateTime,
        });
        toast.success("假期日期已刪除");
      }
    } catch (error) {
      console.error("Delete holiday error:", error);
      toast.error(error instanceof Error ? error.message : "無法刪除假期日期");
    }
  };

  // 將日期轉為包含星期的格式
  const formatDateWithDay = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("zh-TW", options);
  };

  // ← 修改：將課程和出席數據轉為 FullCalendar 事件格式
  const calendarEvents = [
    // 假期事件
    ...(GetHolidaysData?.teacherholidaysDateTime.map((date) => ({
      title: "假期",
      date: date,
      allDay: true,
      backgroundColor: "red",
      borderColor: "red",
      textColor: "white",
      classNames: ["holiday-event"],
    })) || []),
    // 課程事件（根據出席狀態顯示不同顏色）
    ...GetTeacherCourses.flatMap((course) =>
      course.Coursedates.map((date) => {
        const key = `${course.id}_${date}`;
        const isAttended = !!attendanceMap[key];
        return {
          id: `${course.id}_${date}`,
          title: `📚 ${course.title}${isAttended ? " ✅" : ""}`,
          date: date,
          allDay: true,
          backgroundColor: isAttended ? "green" : "blue",
          borderColor: isAttended ? "green" : "blue",
          textColor: "white",
          classNames: ["course-event"],
          extendedProps: {
            courseId: course.id,
            courseTitle: course.title,
            teacherNames: course.teacher.join(", "),
            isAttended,
          },
        };
      })
    ),
  ];

  // ← 新增：點擊事件處理
// 修改後（正確的寫法）
const handleEventClick = (info: any) => {
  const { extendedProps } = info.event;
  // 使用 startStr 來取得日期（因為 allDay 事件只有日期沒有時間）
  const dateStr = info.event.startStr || info.event.dateStr;
  
  // 如果是假期，不做任何事
  if (info.event.classNames.includes("holiday-event")) return;

  const { courseId, courseTitle } = extendedProps;
  if (courseId && dateStr) {
    handleToggleAttendance(courseId, dateStr, courseTitle);
  }
};


  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (!GetHolidaysData || !GetTeacherCourses) {
    return <div className="p-4">載入中...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Link
        href={`/teacher/${TeacherId}/calendar/AddHolidays`}
        className="text-blue-500 hover:underline"
      >
        加入假期
      </Link>
      <h1 className="text-2xl font-bold my-4">教師日曆</h1>

      {/* 圖例 */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>未出席</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>已出席 ✅</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>假期</span>
        </div>
      </div>

      {/* 假期列表（保持原樣） */}
      <div className="grid gap-2 mb-6">
        <h2 className="text-lg font-semibold">假期列表</h2>
        {GetHolidaysData.teacherholidaysDateTime.length > 0 ? (
          GetHolidaysData.teacherholidaysDateTime.map((date, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-100 rounded"
            >
              <span>{formatDateWithDay(date)}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteHoliday(date)}
                className="ml-2"
              >
                刪除
              </Button>
            </div>
          ))
        ) : (
          <div className="text-gray-500">無假期數據</div>
        )}
      </div>

      {/* 課程出席列表 */}
      <div className="grid gap-2 mb-6">
        <h2 className="text-lg font-semibold">課程出席狀態</h2>
        {GetTeacherCourses.flatMap((course) =>
          course.Coursedates.map((date) => {
            const key = `${course.id}_${date}`;
            const isAttended = !!attendanceMap[key];
            return (
              <div
                key={key}
                className={`flex items-center justify-between p-2 rounded ${
                  isAttended ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <div>
                  <span className="font-medium">{course.title}</span>
                  <span className="text-gray-500 ml-2">
                    {formatDateWithDay(date)}
                  </span>
                  <span className="ml-2">
                    {isAttended ? "✅ 已出席" : "⏳ 未出席"}
                  </span>
                </div>
                <Button
                  variant={isAttended ? "outline" : "default"}
                  size="sm"
                  onClick={() =>
                    handleToggleAttendance(course.id, date, course.title)
                  }
                  disabled={togglingKey === key}
                  className={
                    isAttended
                      ? "border-green-500 text-green-600"
                      : "bg-blue-600"
                  }
                >
                  {togglingKey === key
                    ? "處理中..."
                    : isAttended
                    ? "取消出席"
                    : "標記出席"}
                </Button>
              </div>
            );
          })
        )}
      </div>

      {/* FullCalendar */}
      <div className="mt-6" style={{ height: "600px" }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]} // ← 加入 interactionPlugin
          initialView="dayGridMonth"
          events={calendarEvents}
          locale="zh-tw"
          height="100%"
          eventClick={handleEventClick} // ← 加入點擊事件
          eventDidMount={(info) => {
            // 加入自訂游標樣式
            if (!info.event.classNames.includes("holiday-event")) {
              info.el.style.cursor = "pointer";
              info.el.title = "點擊切換出席狀態";
            }
          }}
        />
      </div>
    </div>
  );
};

export default TeacherCalendarPage;
