import { createClient } from '@supabase/supabase-js'

// 使用环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 联系人数据
const contactsData = [
  {
    name: "张伟",
    email: "zhangwei@example.com",
    phone: "+86 138 0013 8000",
    type: "Tenant",
    avatar_url: null,
    initials: "ZW",
    address: "北京市朝阳区建国门外大街1号",
    company: "北京科技有限公司",
    notes: "优质租户，按时缴费",
    is_active: true
  },
  {
    name: "李娜",
    email: "lina@example.com",
    phone: "+86 139 0013 9000",
    type: "Landlord",
    avatar_url: null,
    initials: "LN",
    address: "上海市浦东新区陆家嘴环路1000号",
    company: "上海房地产投资公司",
    notes: "拥有多套物业的房东",
    is_active: true
  },
  {
    name: "王强",
    email: "wangqiang@example.com",
    phone: "+86 137 0013 7000",
    type: "Supplier",
    avatar_url: null,
    initials: "WQ",
    address: "广州市天河区珠江新城花城大道85号",
    company: "广州维修服务公司",
    notes: "专业水电维修服务",
    is_active: true
  },
  {
    name: "刘芳",
    email: "liufang@example.com",
    phone: "+86 136 0013 6000",
    type: "Guarantor",
    avatar_url: null,
    initials: "LF",
    address: "深圳市南山区科技园南区深南大道9988号",
    company: "深圳金融担保公司",
    notes: "信誉良好的担保人",
    is_active: true
  },
  {
    name: "陈明",
    email: "chenming@example.com",
    phone: "+86 135 0013 5000",
    type: "Tenant",
    avatar_url: null,
    initials: "CM",
    address: "杭州市西湖区文三路259号",
    company: "杭州互联网公司",
    notes: "年轻专业人士",
    is_active: true
  },
  {
    name: "赵丽",
    email: "zhaoli@example.com",
    phone: "+86 134 0013 4000",
    type: "System",
    avatar_url: null,
    initials: "ZL",
    address: "南京市鼓楼区中山路1号",
    company: "南京物业管理公司",
    notes: "系统管理员",
    is_active: true
  },
  {
    name: "孙涛",
    email: "suntao@example.com",
    phone: "+86 133 0013 3000",
    type: "Supplier",
    avatar_url: null,
    initials: "ST",
    address: "武汉市武昌区中南路99号",
    company: "武汉清洁服务公司",
    notes: "专业清洁服务提供商",
    is_active: true
  },
  {
    name: "周敏",
    email: "zhoumin@example.com",
    phone: "+86 132 0013 2000",
    type: "Permitted Occupier",
    avatar_url: null,
    initials: "ZM",
    address: "成都市锦江区春熙路168号",
    company: null,
    notes: "租户家属",
    is_active: true
  },
  {
    name: "吴刚",
    email: "wugang@example.com",
    phone: "+86 131 0013 1000",
    type: "Other",
    avatar_url: null,
    initials: "WG",
    address: "西安市雁塔区高新路88号",
    company: "西安咨询公司",
    notes: "房地产顾问",
    is_active: true
  },
  {
    name: "郑红",
    email: "zhenghong@example.com",
    phone: "+86 130 0013 0000",
    type: "New",
    avatar_url: null,
    initials: "ZH",
    address: "重庆市渝中区解放碑步行街1号",
    company: null,
    notes: "新注册联系人",
    is_active: true
  }
]

// 任务数据
const tasksData = [
  {
    title: "空调维修",
    description: "客厅空调制冷效果不佳，需要专业维修",
    type: "Maintenance",
    type_color: "#ef4444",
    date: "2024-01-15",
    due_time: "14:00",
    address: "北京市朝阳区建国门外大街1号 101室",
    task_number: "T2024001",
    priority: "High",
    status: "In Progress",
    is_completed: false,
    property_id: null,
    tenancy_id: null,
    created_by: null
  },
  {
    title: "房屋检查",
    description: "定期房屋状况检查，确保设施正常运行",
    type: "Inspection",
    type_color: "#3b82f6",
    date: "2024-01-16",
    due_time: "10:00",
    address: "上海市浦东新区陆家嘴环路1000号 2A",
    task_number: "T2024002",
    priority: "Medium",
    status: "Pending",
    is_completed: false,
    property_id: null,
    tenancy_id: null,
    created_by: null
  },
  {
    title: "租金收取",
    description: "收取1月份房租，确认付款状态",
    type: "Financial",
    type_color: "#10b981",
    date: "2024-01-17",
    due_time: "09:00",
    address: "广州市天河区珠江新城花城大道85号",
    task_number: "T2024003",
    priority: "High",
    status: "Completed",
    is_completed: true,
    property_id: null,
    tenancy_id: null,
    created_by: null,
    completed_at: "2024-01-17T09:30:00Z"
  },
  {
    title: "水管漏水修复",
    description: "厨房水管出现漏水，需要紧急处理",
    type: "Emergency",
    type_color: "#f59e0b",
    date: "2024-01-18",
    due_time: "08:00",
    address: "深圳市南山区科技园南区深南大道9988号",
    task_number: "T2024004",
    priority: "Urgent",
    status: "In Progress",
    is_completed: false,
    property_id: null,
    tenancy_id: null,
    created_by: null
  },
  {
    title: "新租户入住",
    description: "协助新租户办理入住手续，交接钥匙",
    type: "Administrative",
    type_color: "#8b5cf6",
    date: "2024-01-19",
    due_time: "15:00",
    address: "杭州市西湖区文三路259号",
    task_number: "T2024005",
    priority: "Medium",
    status: "Pending",
    is_completed: false,
    property_id: null,
    tenancy_id: null,
    created_by: null
  },
  {
    title: "清洁服务",
    description: "深度清洁服务，为新租户准备房屋",
    type: "Cleaning",
    type_color: "#06b6d4",
    date: "2024-01-20",
    due_time: "11:00",
    address: "南京市鼓楼区中山路1号",
    task_number: "T2024006",
    priority: "Low",
    status: "Pending",
    is_completed: false,
    property_id: null,
    tenancy_id: null,
    created_by: null
  },
  {
    title: "合同续签",
    description: "与租户讨论合同续签事宜",
    type: "Legal",
    type_color: "#84cc16",
    date: "2024-01-21",
    due_time: "16:00",
    address: "武汉市武昌区中南路99号",
    task_number: "T2024007",
    priority: "Medium",
    status: "Pending",
    is_completed: false,
    property_id: null,
    tenancy_id: null,
    created_by: null
  },
  {
    title: "电梯维护",
    description: "电梯年度维护保养",
    type: "Maintenance",
    type_color: "#ef4444",
    date: "2024-01-22",
    due_time: "13:00",
    address: "成都市锦江区春熙路168号",
    task_number: "T2024008",
    priority: "Medium",
    status: "Completed",
    is_completed: true,
    property_id: null,
    tenancy_id: null,
    created_by: null,
    completed_at: "2024-01-22T14:30:00Z"
  }
]

// 文档数据
const documentsData = [
  {
    file_name: "租赁合同_张伟.pdf",
    file_type: "application/pdf",
    file_size: 2048576,
    file_url: "https://example.com/documents/lease_zhangwei.pdf",
    property: "北京市朝阳区建国门外大街1号 101室",
    property_id: null,
    document_type: "Lease Agreement",
    valid_until: "2024-12-31",
    status: "Active",
    sharing: { "public": false, "tenants": true, "landlords": true },
    create_date: "2024-01-01",
    uploaded_by: null,
    folder_path: "/contracts/2024/",
    is_archived: false
  },
  {
    file_name: "房屋检查报告_2024Q1.pdf",
    file_type: "application/pdf",
    file_size: 1536000,
    file_url: "https://example.com/documents/inspection_2024q1.pdf",
    property: "上海市浦东新区陆家嘴环路1000号 2A",
    property_id: null,
    document_type: "Inspection Report",
    valid_until: "2024-06-30",
    status: "Active",
    sharing: { "public": false, "tenants": false, "landlords": true },
    create_date: "2024-01-15",
    uploaded_by: null,
    folder_path: "/inspections/2024/",
    is_archived: false
  },
  {
    file_name: "保险单_物业综合险.pdf",
    file_type: "application/pdf",
    file_size: 1024000,
    file_url: "https://example.com/documents/insurance_policy.pdf",
    property: "广州市天河区珠江新城花城大道85号",
    property_id: null,
    document_type: "Insurance",
    valid_until: "2024-12-31",
    status: "Active",
    sharing: { "public": false, "tenants": false, "landlords": true },
    create_date: "2024-01-01",
    uploaded_by: null,
    folder_path: "/insurance/2024/",
    is_archived: false
  },
  {
    file_name: "维修记录_空调维修.docx",
    file_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    file_size: 512000,
    file_url: "https://example.com/documents/maintenance_ac.docx",
    property: "深圳市南山区科技园南区深南大道9988号",
    property_id: null,
    document_type: "Maintenance Record",
    valid_until: null,
    status: "Active",
    sharing: { "public": false, "tenants": true, "landlords": true },
    create_date: "2024-01-15",
    uploaded_by: null,
    folder_path: "/maintenance/2024/",
    is_archived: false
  },
  {
    file_name: "租金收据_2024年1月.pdf",
    file_type: "application/pdf",
    file_size: 256000,
    file_url: "https://example.com/documents/rent_receipt_202401.pdf",
    property: "杭州市西湖区文三路259号",
    property_id: null,
    document_type: "Receipt",
    valid_until: null,
    status: "Active",
    sharing: { "public": false, "tenants": true, "landlords": true },
    create_date: "2024-01-31",
    uploaded_by: null,
    folder_path: "/receipts/2024/",
    is_archived: false
  },
  {
    file_name: "房屋照片_入住前.jpg",
    file_type: "image/jpeg",
    file_size: 3072000,
    file_url: "https://example.com/documents/photos_before_move_in.jpg",
    property: "南京市鼓楼区中山路1号",
    property_id: null,
    document_type: "Photo",
    valid_until: null,
    status: "Active",
    sharing: { "public": false, "tenants": true, "landlords": true },
    create_date: "2024-01-10",
    uploaded_by: null,
    folder_path: "/photos/2024/",
    is_archived: false
  }
]

// 执行数据插入函数
async function seedData() {
  try {
    console.log('🌱 开始插入测试数据...')

    // 插入联系人数据
    console.log('📞 插入联系人数据...')
    const { data: contactsResult, error: contactsError } = await supabase
      .from('contacts')
      .insert(contactsData)
      .select()

    if (contactsError) {
      console.error('❌ 联系人数据插入失败:', contactsError)
    } else {
      console.log(`✅ 成功插入 ${contactsResult.length} 条联系人数据`)
    }

    // 插入任务数据
    console.log('📋 插入任务数据...')
    const { data: tasksResult, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasksData)
      .select()

    if (tasksError) {
      console.error('❌ 任务数据插入失败:', tasksError)
    } else {
      console.log(`✅ 成功插入 ${tasksResult.length} 条任务数据`)
    }

    // 插入文档数据
    console.log('📄 插入文档数据...')
    const { data: documentsResult, error: documentsError } = await supabase
      .from('documents')
      .insert(documentsData)
      .select()

    if (documentsError) {
      console.error('❌ 文档数据插入失败:', documentsError)
    } else {
      console.log(`✅ 成功插入 ${documentsResult.length} 条文档数据`)
    }

    console.log('🎉 所有测试数据插入完成!')

  } catch (error) {
    console.error('💥 数据插入过程中发生错误:', error)
  }
}

// 清空数据函数（可选）
async function clearData() {
  try {
    console.log('🧹 开始清空数据...')

    // 清空文档数据
    const { error: documentsError } = await supabase
      .from('documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 删除所有记录

    if (documentsError) {
      console.error('❌ 清空文档数据失败:', documentsError)
    } else {
      console.log('✅ 文档数据已清空')
    }

    // 清空任务数据
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (tasksError) {
      console.error('❌ 清空任务数据失败:', tasksError)
    } else {
      console.log('✅ 任务数据已清空')
    }

    // 清空联系人数据
    const { error: contactsError } = await supabase
      .from('contacts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (contactsError) {
      console.error('❌ 清空联系人数据失败:', contactsError)
    } else {
      console.log('✅ 联系人数据已清空')
    }

    console.log('🎉 所有数据清空完成!')

  } catch (error) {
    console.error('💥 数据清空过程中发生错误:', error)
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--clear')) {
    await clearData()
  } else {
    await seedData()
  }

  process.exit(0)
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}

export { seedData, clearData }
