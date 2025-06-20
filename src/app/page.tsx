"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { UserPlus, Users, GraduationCap, BookOpen, MailCheck } from "lucide-react"
import { PieChart, Pie, Cell, Legend } from "recharts"

export default function HomePage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [teacherData] = useState([
    { name: "张老师", avatar: "https://via.placeholder.com/40", course: "数学", email: "zhang@example.com", status: "在职" },
    { name: "李老师", avatar: "https://via.placeholder.com/40", course: "英语", email: "li@example.com", status: "在职" },
    { name: "王老师", avatar: "https://via.placeholder.com/40", course: "物理", email: "wang@example.com", status: "休假中" },
    { name: "赵老师", avatar: "https://via.placeholder.com/40", course: "历史", email: "zhao@example.com", status: "在职" },
  ])

  const statistics = [
    { title: "在职教师总数", value: teacherData.filter(t => t.status === "在职").length, icon: <Users className="w-6 h-6" /> },
    { title: "管理学生总数", value: 120, icon: <GraduationCap className="w-6 h-6" /> },
    { title: "本学期课程", value: 10, icon: <BookOpen className="w-6 h-6" /> },
    { title: "待处理审批", value: 3, icon: <MailCheck className="w-6 h-6 text-orange-500" /> },
  ]
  
  const pieChartData = [
    { name: '数学', value: 400 },
    { name: '英语', value: 300 },
    { name: '物理', value: 300 },
    { name: '历史', value: 200 },
  ]

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold">教师信息中心</h1>
        <Button variant="outline" onClick={() => alert("添加教师功能待实现")}>
          <UserPlus className="w-5 h-5 mr-2" /> 添加新教师
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-4 p-4">
        {statistics.map(stat => (
          <div key={stat.title} className="p-4 bg-white rounded-lg shadow-md flex items-center">
            <div className="mr-4">{stat.icon}</div>
            <div>
              <h3 className="text-lg font-bold">{stat.title}</h3>
              <p className="text-gray-600">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex p-4">
        <div className="w-2/3 mr-4">
          <h2 className="text-xl font-bold mb-2">教师名册</h2>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">头像</th>
                <th className="px-4 py-2 border-b">姓名</th>
                <th className="px-4 py-2 border-b">课程</th>
                <th className="px-4 py-2 border-b">邮箱</th>
                <th className="px-4 py-2 border-b">状态</th>
                <th className="px-4 py-2 border-b">操作</th>
              </tr>
            </thead>
            <tbody>
              {teacherData.map(teacher => (
                <tr key={teacher.email} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border-b">
                    <img src={teacher.avatar} alt={teacher.name} className="rounded-full" />
                  </td>
                  <td className="px-4 py-2 border-b">{teacher.name}</td>
                  <td className="px-4 py-2 border-b">{teacher.course}</td>
                  <td className="px-4 py-2 border-b">{teacher.email}</td>
                  <td className="px-4 py-2 border-b">
                    <span className={`inline-block px-2 py-1 rounded-full ${teacher.status === "在职" ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"}`}>
                      {teacher.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b">
                    <Button variant="link" onClick={() => alert("查看档案功能待实现")}>查看档案</Button>
                    <Button variant="link" onClick={() => alert("编辑功能待实现")} className="ml-2">编辑</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-1/3">
          <h2 className="text-xl font-bold mb-2">各科教师分布</h2>
          <PieChart width={300} height={300}>
            <Pie data={pieChartData} cx={150} cy={150} labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
          <h2 className="text-xl font-bold mt-4 mb-2">近期重要日程</h2>
          <ul>
            <li>10月1日 09:00 - 全校教师会议</li>
            <li>10月10日 14:00 - 教师培训班</li>
            <li>10月15日 10:00 - 学校开放日</li>
          </ul>
        </div>
      </div>
    </div>
  )
}