# LoftyWorks API Documentation

基于前端代码分析生成的完整API接口文档，使用Supabase作为后端解决方案。

## 目录
1. [认证接口](#认证接口)
2. [房产管理接口](#房产管理接口)
3. [租赁管理接口](#租赁管理接口)
4. [联系人管理接口](#联系人管理接口)
5. [任务管理接口](#任务管理接口)
6. [文档管理接口](#文档管理接口)
7. [日历管理接口](#日历管理接口)
8. [通用响应格式](#通用响应格式)
9. [错误处理](#错误处理)

---

## 认证接口

### 用户登录
```http
POST /auth/v1/token
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "用户名",
    "role": "admin"
  }
}
```

### 用户注册
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "用户名"
}
```

### 刷新令牌
```http
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "refresh_token_here"
}
```

---

## 房产管理接口

### 获取房产列表
```http
GET /rest/v1/properties?select=*
Authorization: Bearer {token}

# 查询参数
?page=1&limit=50&search=keyword&status=active&type=apartment&manager_id=uuid
```

**响应:**
```json
{
  "data": [
    {
      "id": "uuid",
      "address": "22141 Alizondo DR",
      "city": "London",
      "postcode": "SW7 5AG",
      "reference": "REF-001",
      "type": "Apartment Block",
      "status": "active",
      "manager_id": "uuid",
      "manager": {
        "name": "John Admin",
        "avatar": "https://example.com/avatar.jpg",
        "initials": "JA"
      },
      "image": "https://example.com/property.jpg",
      "created_at": "2025-01-07T00:00:00Z",
      "updated_at": "2025-01-07T00:00:00Z"
    }
  ],
  "count": 150,
  "page": 1,
  "limit": 50,
  "total_pages": 3
}
```

### 创建房产
```http
POST /rest/v1/properties
Authorization: Bearer {token}
Content-Type: application/json

{
  "address": "22141 Alizondo DR",
  "city": "London",
  "postcode": "SW7 5AG",
  "reference": "REF-001",
  "type": "Apartment Block",
  "status": "active",
  "manager_id": "uuid",
  "image": "https://example.com/property.jpg"
}
```

### 获取单个房产
```http
GET /rest/v1/properties?id=eq.{uuid}&select=*
Authorization: Bearer {token}
```

### 更新房产
```http
PATCH /rest/v1/properties?id=eq.{uuid}
Authorization: Bearer {token}
Content-Type: application/json

{
  "address": "Updated Address",
  "status": "instructed"
}
```

### 删除房产
```http
DELETE /rest/v1/properties?id=eq.{uuid}
Authorization: Bearer {token}
```

---

## 租赁管理接口

### 获取租赁列表
```http
GET /rest/v1/tenancies?select=*,property:properties(*)
Authorization: Bearer {token}

# 查询参数
?page=1&limit=50&search=keyword&status=active&type=contractual&start_date=gte.2025-01-01&end_date=lte.2025-12-31
```

**响应:**
```json
{
  "data": [
    {
      "id": "uuid",
      "property_id": "uuid",
      "reference": "TEN-001",
      "type": "Contractual",
      "status": "active",
      "start_date": "2025-01-01",
      "end_date": "2025-12-31",
      "amount": "£ 400.00",
      "property": {
        "address": "22141 Alizondo DR",
        "city": "London",
        "postcode": "SW7 5AG",
        "image": "https://example.com/property.jpg"
      },
      "created_at": "2025-01-07T00:00:00Z",
      "updated_at": "2025-01-07T00:00:00Z"
    }
  ],
  "count": 75,
  "page": 1,
  "limit": 50,
  "total_pages": 2
}
```

### 创建租赁
```http
POST /rest/v1/tenancies
Authorization: Bearer {token}
Content-Type: application/json

{
  "property_id": "uuid",
  "reference": "TEN-001",
  "type": "Contractual",
  "status": "active",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "amount": "£ 400.00"
}
```

### 更新租赁
```http
PATCH /rest/v1/tenancies?id=eq.{uuid}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "renewed",
  "end_date": "2026-12-31"
}
```

---

## 联系人管理接口

### 获取联系人列表
```http
GET /rest/v1/contacts?select=*
Authorization: Bearer {token}

# 查询参数
?page=1&limit=50&search=keyword&type=guarantor
```

**响应:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Guy Hawkins",
      "email": "sara.cruz@example.com",
      "phone": "+44 123-456-7890",
      "type": "Guarantor",
      "avatar": "https://example.com/avatar.jpg",
      "initials": "GH",
      "created_at": "2025-01-07T00:00:00Z",
      "updated_at": "2025-01-07T00:00:00Z"
    }
  ],
  "count": 4500,
  "page": 1,
  "limit": 50,
  "total_pages": 90
}
```

### 创建联系人
```http
POST /rest/v1/contacts
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Guy Hawkins",
  "email": "sara.cruz@example.com",
  "phone": "+44 123-456-7890",
  "type": "Guarantor",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 获取联系人统计
```http
GET /rest/v1/rpc/get_contact_stats
Authorization: Bearer {token}
```

**响应:**
```json
{
  "all_contacts": 4500,
  "guarantor": 567,
  "landlord": 861,
  "new": 43,
  "supplier": 100,
  "system": 54,
  "tenant": 20,
  "permitted_occupier": 6,
  "other": 23
}
```

---

## 任务管理接口

### 获取任务列表（看板视图）
```http
GET /rest/v1/tasks?select=*,assignees:task_assignees(user:users(*))
Authorization: Bearer {token}

# 查询参数
?view=kanban&status=todo&assignee_id=uuid&type=maintenance&date=gte.2025-01-01&priority=high
```

**响应:**
```json
{
  "columns": [
    {
      "id": "todo",
      "title": "To Do",
      "count": 32,
      "color": "#5D51E2",
      "tasks": [
        {
          "id": "uuid",
          "title": "Property Posted to RightMove",
          "type": "Workspace Order",
          "type_color": "#5D51E2",
          "date": "2025-08-12",
          "address": "22141 Alizondo DR, London, SW7 5AG",
          "task_number": "#T-30",
          "is_completed": false,
          "priority": "Medium",
          "status": "todo",
          "assignees": [
            {
              "user": {
                "name": "John Admin",
                "avatar": "https://example.com/avatar.jpg",
                "initials": "JA"
              }
            }
          ],
          "created_at": "2025-01-07T00:00:00Z",
          "updated_at": "2025-01-07T00:00:00Z"
        }
      ]
    }
  ]
}
```

### 创建任务
```http
POST /rest/v1/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Property Posted to RightMove",
  "type": "Workspace Order",
  "type_color": "#5D51E2",
  "date": "2025-08-12",
  "address": "22141 Alizondo DR, London, SW7 5AG",
  "task_number": "#T-30",
  "priority": "Medium",
  "status": "todo",
  "assignee_ids": ["uuid1", "uuid2"]
}
```

### 更新任务状态
```http
PATCH /rest/v1/tasks?id=eq.{uuid}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "inprogress",
  "priority": "high"
}
```

### 复制任务
```http
POST /rest/v1/rpc/duplicate_task
Authorization: Bearer {token}
Content-Type: application/json

{
  "task_id": "uuid"
}
```

### 批量更新任务
```http
POST /rest/v1/rpc/bulk_update_tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "task_ids": ["uuid1", "uuid2"],
  "updates": {
    "status": "done",
    "is_completed": true
  }
}
```

---

## 文档管理接口

### 获取文档列表
```http
GET /rest/v1/documents?select=*
Authorization: Bearer {token}

# 查询参数
?page=1&limit=50&search=filename&type=instructions&status=expiring&property_id=uuid&create_date=gte.2025-01-01
```

**响应:**
```json
{
  "data": [
    {
      "id": "uuid",
      "file_name": "online-Meeting.pdf",
      "file_type": "pdf",
      "property": "7 Northumberland Avenue",
      "document_type": "Instructions",
      "valid_until": "2025-01-30",
      "status": "Expiring",
      "sharing": {
        "type": "Team Member",
        "has_lock": true,
        "has_view": true
      },
      "create_date": "2025-01-21",
      "file_url": "https://supabase-storage-url/documents/uuid/filename.pdf",
      "file_size": 1024000,
      "created_at": "2025-01-07T00:00:00Z",
      "updated_at": "2025-01-07T00:00:00Z"
    }
  ],
  "count": 150,
  "page": 1,
  "limit": 50,
  "total_pages": 3
}
```

### 上传文档
```http
POST /storage/v1/object/documents/{folder}/{filename}
Authorization: Bearer {token}
Content-Type: multipart/form-data

# 然后创建文档记录
POST /rest/v1/documents
Authorization: Bearer {token}
Content-Type: application/json

{
  "file_name": "online-Meeting.pdf",
  "file_type": "pdf",
  "property": "7 Northumberland Avenue",
  "document_type": "Instructions",
  "valid_until": "2025-01-30",
  "status": "Valid",
  "sharing": {
    "type": "Team Member",
    "has_lock": true,
    "has_view": true
  },
  "file_url": "storage_url",
  "file_size": 1024000
}
```

### 下载文档
```http
GET /storage/v1/object/documents/{folder}/{filename}
Authorization: Bearer {token}
```

### 更新文档权限
```http
PATCH /rest/v1/documents?id=eq.{uuid}
Authorization: Bearer {token}
Content-Type: application/json

{
  "sharing": {
    "type": "Team Member, Tenants",
    "has_lock": false,
    "has_view": true
  }
}
```

### 获取文档统计
```http
GET /rest/v1/rpc/get_document_stats
Authorization: Bearer {token}
```

**响应:**
```json
{
  "all_documents": 150,
  "expiring": 30,
  "archive": 125,
  "by_type": {
    "instructions": 45,
    "certificates": 67,
    "inspections": 23,
    "other": 15
  }
}
```

---

## 日历管理接口

### 获取日历事件
```http
GET /rest/v1/calendar_events?select=*
Authorization: Bearer {token}

# 查询参数
?start_date=gte.2025-01-01&end_date=lte.2025-01-31&view=month
```

**响应:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Property Inspection",
      "type": "Schedule Showing",
      "date": "2025-01-15",
      "start_time": "10:00",
      "end_time": "11:00",
      "color": "#5D51E2",
      "border_color": "#4A3ED0",
      "address": "22141 Alizondo DR, London",
      "assignee_id": "uuid",
      "property_id": "uuid",
      "task_id": "uuid",
      "created_at": "2025-01-07T00:00:00Z",
      "updated_at": "2025-01-07T00:00:00Z"
    }
  ]
}
```

### 创建日历事件
```http
POST /rest/v1/calendar_events
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Property Inspection",
  "type": "Schedule Showing",
  "date": "2025-01-15",
  "start_time": "10:00",
  "end_time": "11:00",
  "color": "#5D51E2",
  "border_color": "#4A3ED0",
  "address": "22141 Alizondo DR, London",
  "assignee_id": "uuid",
  "property_id": "uuid"
}
```

### 更新日历事件
```http
PATCH /rest/v1/calendar_events?id=eq.{uuid}
Authorization: Bearer {token}
Content-Type: application/json

{
  "date": "2025-01-16",
  "start_time": "14:00",
  "end_time": "15:00"
}
```

---

## 通用响应格式

### 成功响应
```json
{
  "data": [...], // 数据数组或对象
  "count": 100,  // 总记录数（分页时）
  "page": 1,     // 当前页码
  "limit": 50,   // 每页记录数
  "total_pages": 2, // 总页数
  "status": "success",
  "message": "操作成功"
}
```

### 分页参数
- `page`: 页码（从1开始）
- `limit`: 每页记录数（默认50，最大100）
- `offset`: 偏移量（可选，优先级低于page）

### 过滤参数
- `search`: 全文搜索
- `status`: 状态过滤
- `type`: 类型过滤
- `date_gte`: 日期大于等于
- `date_lte`: 日期小于等于
- `order`: 排序字段
- `sort`: 排序方向（asc/desc）

---

## 错误处理

### 错误响应格式
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      }
    ]
  },
  "status": "error",
  "timestamp": "2025-01-07T00:00:00Z"
}
```

### 常见错误码
- `400 BAD_REQUEST`: 请求参数错误
- `401 UNAUTHORIZED`: 未授权访问
- `403 FORBIDDEN`: 权限不足
- `404 NOT_FOUND`: 资源不存在
- `409 CONFLICT`: 资源冲突
- `422 VALIDATION_ERROR`: 数据验证失败
- `429 RATE_LIMIT`: 请求频率限制
- `500 INTERNAL_ERROR`: 服务器内部错误

### 实时订阅（Supabase Realtime）

#### 订阅任务更新
```javascript
const channel = supabase
  .channel('tasks')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks'
  }, (payload) => {
    console.log('Task updated:', payload)
  })
  .subscribe()
```

#### 订阅文档状态变化
```javascript
const channel = supabase
  .channel('documents')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'documents',
    filter: 'status=eq.Expiring'
  }, (payload) => {
    console.log('Document expiring:', payload)
  })
  .subscribe()
```

---

## 备注

1. 所有接口都需要Bearer Token认证
2. 使用Supabase Row Level Security (RLS) 确保数据安全
3. 文件上传使用Supabase Storage
4. 实时功能使用Supabase Realtime
5. 所有日期时间使用ISO 8601格式
6. 货币金额统一使用字符串格式存储
7. 支持批量操作以提高性能
8. 实现乐观锁定防止并发更新冲突