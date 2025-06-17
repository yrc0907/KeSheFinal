export const systemContent = {
  rental: {
    title: "欢迎来到房屋租赁平台",
    description: "在这里找到您理想的家。我们提供最新、最全的房源信息，助您轻松开启新生活。",
    primaryButton: {
      text: "开始浏览房源",
      link: "/houses"
    },
    secondaryButton: {
      text: "进入社区论坛",
      link: "/forum"
    }
  },
  book: {
    title: "欢迎来到图书管理系统",
    description: "查找、借阅和管理图书馆的藏书。我们提供高效、便捷的图书管理服务。",
    primaryButton: {
      text: "浏览书目",
      link: "/houses" // Reusing the houses route for books
    },
    secondaryButton: {
      text: "读者论坛",
      link: "/forum"
    }
  },
  teacher: {
    title: "欢迎来到教师管理系统",
    description: "管理和查询教师信息、课程安排和教学评价。为学校提供全面的教师资源管理。",
    primaryButton: {
      text: "浏览教师",
      link: "/houses" // Reusing the houses route for teachers
    },
    secondaryButton: {
      text: "教师论坛",
      link: "/forum"
    }
  }
}

export interface RegisterField {
  id: string;
  label: string;
  placeholder: string;
  type: "text" | "email" | "password" | "number";
}

export interface RegisterConfig {
  title: string;
  description: string;
  fields: RegisterField[];
  submitButton: string;
  backButton: string;
}

export interface SystemDetails {
  label: string;
  entity: string;
  register: RegisterConfig;
}

export const systemConfig: Record<string, SystemDetails> = {
  book: {
    label: "图书管理系统",
    entity: "book",
    register: {
      title: "添加新图书",
      description: "输入图书信息",
      fields: [
        {
          id: "name",
          label: "书名",
          placeholder: "输入书名",
          type: "text",
        },
        {
          id: "author",
          label: "作者",
          placeholder: "输入作者",
          type: "text",
        },
        {
          id: "publisher",
          label: "出版社",
          placeholder: "输入出版社",
          type: "text",
        },
      ],
      submitButton: "添加图书",
      backButton: "返回",
    },
  },
  teacher: {
    label: "教师管理系统",
    entity: "teacher",
    register: {
      title: "注册新教师",
      description: "创建新教师账户",
      fields: [
        {
          id: "name",
          label: "姓名",
          placeholder: "输入姓名",
          type: "text",
        },
        {
          id: "email",
          label: "邮箱",
          placeholder: "输入邮箱",
          type: "email",
        },
        {
          id: "password",
          label: "密码",
          placeholder: "输入密码",
          type: "password",
        },
      ],
      submitButton: "注册",
      backButton: "登录",
    },
  },
  rental: {
    label: "租房管理系统",
    entity: "rental",
    register: {
      title: "发布新房源",
      description: "输入房源信息",
      fields: [
        {
          id: "address",
          label: "地址",
          placeholder: "输入地址",
          type: "text",
        },
        {
          id: "rent",
          label: "租金",
          placeholder: "输入月租金",
          type: "number",
        },
        {
          id: "contact",
          label: "联系方式",
          placeholder: "输入联系方式",
          type: "text",
        },
      ],
      submitButton: "发布房源",
      backButton: "返回",
    },
  },
}

export type SystemKey = keyof typeof systemConfig 