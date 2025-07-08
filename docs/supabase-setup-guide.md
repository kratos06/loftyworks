# LoftyWorks Supabase 设置指南

本指南将帮助您完成 LoftyWorks 项目的 Supabase 后端配置，包括数据库设置、认证配置、存储设置和实时功能配置。

## 目录
1. [Supabase 项目创建](#supabase-项目创建)
2. [环境变量配置](#环境变量配置)
3. [数据库架构部署](#数据库架构部署)
4. [认证设置](#认证设置)
5. [存储配置](#存储配置)
6. [实时功能配置](#实时功能配置)
7. [API 配置](#api-配置)
8. [前端集成](#前端集成)
9. [部署配置](#部署配置)
10. [监控和日志](#监控和日志)

---

## Supabase 项目创建

### 1. 创建新项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project"
3. 选择组织或创建新组织
4. 填写项目信息：
   - **Name**: `loftyworks`
   - **Database Password**: 生成强密码并保存
   - **Region**: 选择最近的区域
   - **Pricing Plan**: 根据需求选择

### 2. 获取项目凭据

项目创建完成后，在 Settings > API 中获取：
- **Project URL**: `https://your-project-id.supabase.co`
- **Project API Key (anon public)**: 用于客户端
- **Project API Key (service_role)**: 用于服务端操作

---

## 环境变量配置

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 数据库连接（可选，用于直接连接）
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=LoftyWorks

# 文件上传配置
NEXT_PUBLIC_MAX_FILE_SIZE=52428800
NEXT_PUBLIC_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,png,xlsx

# 邮件配置（可选）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. 更新 .gitignore

确保 `.env.local` 被忽略：

```gitignore
# 环境变量
.env.local
.env.development.local
.env.test.local
.env.production.local
```

---

## 数据库架构部署

### 1. 执行 SQL 架构

1. 在 Supabase Dashboard 中进入 SQL Editor
2. 复制 `docs/supabase-schema.sql` 的内容
3. 执行 SQL 脚本创建所有表、索引、触发器和策略

### 2. 验证表创建

在 Table Editor 中验证以下表已创建：
- `user_profiles`
- `properties`
- `tenancies`
- `contacts`
- `tasks`
- `documents`
- `calendar_events`
- 其他辅助表

### 3. 启用扩展

在 Database > Extensions 中启用以下扩展：
- `uuid-ossp`: UUID 生成
- `pg_trgm`: 模糊搜索
- `btree_gin`: 复合索引优化

---

## 认证设置

### 1. 基本认证配置

在 Authentication > Settings 中配置：

```json
{
  "site_url": "http://localhost:3000",
  "additional_redirect_urls": [
    "http://localhost:3000/auth/callback",
    "https://your-domain.com/auth/callback"
  ],
  "jwt_expiry": 3600,
  "refresh_token_rotation_enabled": true,
  "security_captcha_enabled": false
}
```

### 2. 邮件模板配置

在 Authentication > Email Templates 中自定义：

#### 确认邮件模板
```html
<h2>Welcome to LoftyWorks</h2>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

#### 密码重置模板
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
```

### 3. 社交登录配置（可选）

如需支持 Google/GitHub 登录，在 Authentication > Providers 中配置相应的 OAuth 应用。

---

## 存储配置

### 1. 创建存储桶

在 Storage 中创建以下桶：

```sql
-- 文档存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- 头像存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 房产图片存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('properties', 'properties', true);
```

### 2. 存储策略配置

```sql
-- 文档存储策略
CREATE POLICY "Users can upload documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can view documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'documents' AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update documents" ON storage.objects FOR UPDATE USING (
  bucket_id = 'documents' AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete documents" ON storage.objects FOR DELETE USING (
  bucket_id = 'documents' AND auth.role() = 'authenticated'
);

-- 头像存储策略
CREATE POLICY "Public avatars are viewable" ON storage.objects FOR SELECT USING (
  bucket_id = 'avatars'
);

CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);

-- 房产图片策略
CREATE POLICY "Public property images are viewable" ON storage.objects FOR SELECT USING (
  bucket_id = 'properties'
);

CREATE POLICY "Users can upload property images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'properties' AND auth.role() = 'authenticated'
);
```

### 3. 文件大小和类型限制

在项目设置中配置：
- 最大文件大小: 50MB
- 允许的 MIME 类型: `application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png`

---

## 实时功能配置

### 1. 启用实时复制

在 Database > Replication 中为以下表启用实时复制：
- `tasks`
- `documents`
- `calendar_events`
- `user_notifications`

### 2. 实时策略配置

```sql
-- 任务实时策略
ALTER publication supabase_realtime ADD TABLE public.tasks;

-- 文档实时策略
ALTER publication supabase_realtime ADD TABLE public.documents;

-- 日历事件实时策略
ALTER publication supabase_realtime ADD TABLE public.calendar_events;

-- 通知实时策略
ALTER publication supabase_realtime ADD TABLE public.user_notifications;
```

---

## API 配置

### 1. API 设置

在 Settings > API 中配置：
- **Max Rows**: 1000
- **Request Timeout**: 10000ms
- **Enable CORS**: true

### 2. 创建 API 密钥

为不同环境创建不同的 API 密钥：
- 开发环境: anon key
- 生产环境: 独立的 anon key
- 服务端操作: service_role key

### 3. 速率限制配置

```json
{
  "anonymous": {
    "requests_per_hour": 1000
  },
  "authenticated": {
    "requests_per_hour": 10000
  }
}
```

---

## 前端集成

### 1. 安装 Supabase 客户端

```bash
npm install @supabase/supabase-js
```

### 2. 创建 Supabase 客户端

创建 `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// 服务端客户端（仅在服务端使用）
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### 3. 创建认证上下文

创建 `contexts/AuthContext.tsx`:

```typescript
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, name: string) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取当前会话
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 4. 创建数据库操作 Hooks

创建 `hooks/useProperties.ts`:

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Property {
  id: string
  address: string
  city: string
  postcode: string
  reference: string
  type: string
  status: string
  manager: {
    name: string
    avatar?: string
    initials: string
  }
  image: string
}

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = async (filters?: {
    search?: string
    status?: string
    type?: string
    page?: number
    limit?: number
  }) => {
    try {
      setLoading(true)
      let query = supabase
        .from('properties')
        .select(`
          *,
          manager:user_profiles(name, avatar_url, initials)
        `)

      // 应用过滤器
      if (filters?.search) {
        query = query.textSearch('address', filters.search)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }

      // 分页
      const page = filters?.page || 1
      const limit = filters?.limit || 50
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      setProperties(data || [])
      return { data, count }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }

  const createProperty = async (property: Omit<Property, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([property])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  return {
    properties,
    loading,
    error,
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty
  }
}
```

---

## 部署配置

### 1. 生产环境变量

为生产环境设置环境变量：

```bash
# Vercel 部署示例
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### 2. 域名配置

在 Supabase Authentication > URL Configuration 中添加生产域名：
- Site URL: `https://your-domain.com`
- Redirect URLs: `https://your-domain.com/auth/callback`

### 3. 安全设置

1. **启用 RLS**: 确保所有表都启用了 Row Level Security
2. **API 密钥轮换**: 定期轮换 API 密钥
3. **域名白名单**: 在 CORS 设置中只允许信任的域名
4. **SSL/TLS**: 确保所有连接都使用 HTTPS

---

## 监控和日志

### 1. 启用日志记录

在 Supabase Dashboard > Logs 中查看：
- API 请求日志
- 数据库日志
- 认证日志
- 实时连接日志

### 2. 性能监控

监控以下指标：
- 数据库连接数
- API 响应时间
- 存储使用情况
- 带宽使用情况

### 3. 告警配置

设置告警条件：
- 数据库连接池耗尽
- API 错误率过高
- 存储空间不足
- 异常登录活动

---

## 常见问题和故障排除

### 1. 认证问题

**问题**: 用户无法登录
**解决**: 
- 检查邮箱确认状态
- 验证 JWT 密钥配置
- 确认 URL 配置正确

### 2. 数据库连接问题

**问题**: 数据库连接失败
**解决**:
- 检查连接字符串格式
- 验证数据库密码
- 确认 IP 白名单设置

### 3. 存储上传问题

**问题**: 文件上传失败
**解决**:
- 检查文件大小限制
- 验证 MIME 类型配置
- 确认存储策略正确

### 4. 实时功能问题

**问题**: 实时更新不工作
**解决**:
- 检查表复制配置
- 验证 RLS 策略
- 确认 WebSocket 连接

---

## 备份和恢复

### 1. 自动备份

Supabase 提供自动备份：
- 每日完整备份
- 7 天保留期（免费版）
- 30 天保留期（付费版）

### 2. 手动备份

使用 pg_dump 进行手动备份：

```bash
pg_dump "postgresql://postgres:password@db.project-id.supabase.co:5432/postgres" > backup.sql
```

### 3. 恢复数据

从备份恢复：

```bash
psql "postgresql://postgres:password@db.project-id.supabase.co:5432/postgres" < backup.sql
```

---

## 扩展和优化

### 1. 性能优化

- 使用适当的索引
- 实施查询优化
- 启用连接池
- 使用 CDN 加速静态资源

### 2. 扩展功能

- 集成第三方服务
- 自定义函数和触发器
- 实时通知系统
- 高级搜索功能

### 3. 安全加固

- 定期安全审计
- 实施数据加密
- 访问日志监控
- 威胁检测配置

---

通过遵循本指南，您应该能够成功配置和部署 LoftyWorks 项目的 Supabase 后端。如有问题，请参考 [Supabase 官方文档](https://supabase.com/docs) 或联系技术支持。