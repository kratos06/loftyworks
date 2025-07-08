# 如何连接到在线 Supabase

本指南将详细说明如何创建并连接到在线 Supabase 项目。

## 第一步：创建 Supabase 账户和项目

### 1. 注册 Supabase 账户

1. 访问 [Supabase 官网](https://supabase.com)
2. 点击右上角的 "Start your project" 或 "Sign Up"
3. 选择注册方式：
   - GitHub 账户登录（推荐）
   - Google 账户登录
   - 或使用邮箱注册

### 2. 创建新项目

登录后在 Dashboard 中：

1. 点击 "New Project" 按钮
2. 选择或创建组织（Organization）
3. 填写项目信息：
   ```
   Project Name: loftyworks
   Database Password: [生成强密码，务必保存]
   Region: [选择最近的区域，如 Asia Pacific (Singapore)]
   Pricing Plan: [选择免费版本开始]
   ```
4. 点击 "Create new project"
5. 等待项目初始化（通常需要1-2分钟）

## 第二步：获取连接信息

项目创建完成后，进入项目 Dashboard：

### 1. 获取 API 凭据

在左侧菜单选择 **Settings > API**：

```bash
# 复制以下信息并保存
Project URL: https://xyzabc123.supabase.co
API Key (anon public): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
API Key (service_role): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. 获取数据库连接信息

在 **Settings > Database** 中找到：

```bash
Host: db.xyzabc123.supabase.co
Database name: postgres
Port: 5432
User: postgres
Password: [您设置的数据库密码]

# 完整连接字符串
postgresql://postgres:[your-password]@db.xyzabc123.supabase.co:5432/postgres
```

## 第三步：配置项目环境变量

### 1. 创建环境变量文件

在您的项目根目录创建 `.env.local` 文件：

```bash
# .env.local

# Supabase 配置 - 替换为您的实际值
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 服务端密钥（谨慎使用，不要暴露给客户端）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 数据库直连（可选）
DATABASE_URL=postgresql://postgres:your-password@db.xyzabc123.supabase.co:5432/postgres

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=LoftyWorks
```

### 2. 安装 Supabase 客户端

```bash
npm install @supabase/supabase-js
```

### 3. 创建 Supabase 客户端

创建 `lib/supabase.ts` 文件：

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 仅在服务端使用的客户端
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

## 第四步：部署数据库架构

### 1. 使用 SQL Editor

1. 在 Supabase Dashboard 左侧菜单点击 **SQL Editor**
2. 点击 "New query"
3. 复制 `docs/supabase-schema.sql` 文件的完整内容
4. 粘贴到编辑器中
5. 点击 "Run" 执行 SQL

### 2. 验证表创建

执行成功后，在左侧菜单点击 **Table Editor** 验证以下表已创建：

- ✅ user_profiles
- ✅ properties
- ✅ tenancies
- ✅ contacts
- ✅ tasks
- ✅ task_assignees
- ✅ documents
- ✅ calendar_events
- ✅ 其他辅助表

## 第五步：测试连接

### 1. 创建测试文件

创建 `test-connection.js` 测试连接：

```javascript
import { supabase } from './lib/supabase.js'

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // 测试数据库连接
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Connection error:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('Database response:', data)
    return true
    
  } catch (err) {
    console.error('Connection failed:', err)
    return false
  }
}

testConnection()
```

### 2. 运行测试

```bash
node test-connection.js
```

## 第六步：配置认证

### 1. 设置认证 URL

在 **Authentication > URL Configuration** 中设置：

```
Site URL: http://localhost:3000
Additional Redirect URLs:
- http://localhost:3000/auth/callback
- http://localhost:3000/login
```

### 2. 配置邮件模板

在 **Authentication > Email Templates** 中自定义邮件模板，或使用默认模板。

## 第七步：配置存储

### 1. 创建存储桶

在 **Storage** 中创建桶：

1. 点击 "Create bucket"
2. 创建以下桶：
   - `documents` (私有)
   - `avatars` (公开)
   - `properties` (公开)

### 2. 设置存储策略

在 **Storage > Policies** 中为每个桶设置相应的访问策略。

## 第八步：实际使用示例

### 1. 在 React 组件中使用

```typescript
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PropertiesPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(10)

      if (error) throw error
      
      setProperties(data || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Properties ({properties.length})</h1>
      {properties.map((property) => (
        <div key={property.id}>
          <h3>{property.address}</h3>
          <p>Status: {property.status}</p>
        </div>
      ))}
    </div>
  )
}
```

### 2. 用户认证示例

```typescript
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      
      console.log('Login successful:', data)
      // 重定向到首页或仪表板
      
    } catch (error) {
      console.error('Login error:', error.message)
      alert('登录失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
    </form>
  )
}
```

## 常见问题解决

### 1. 连接失败

**错误**: "Failed to connect to Supabase"

**解决方案**:
- 检查环境变量是否正确设置
- 确认 Project URL 和 API Key 无误
- 检查网络连接

### 2. RLS 策略错误

**错误**: "Row Level Security policy violation"

**解决方案**:
- 确认已正确设置 RLS 策略
- 检查用户是否已登录
- 验证用户权限

### 3. 数据库权限问题

**错误**: "Permission denied"

**解决方案**:
- 检查 API Key 是否正确
- 确认使用了正确的密钥（anon vs service_role）
- 验证 RLS 策略配置

## 下一步

连接成功后，您可以：

1. 📊 **查看数据**: 在 Table Editor 中查看和编辑数据
2. 🔐 **测试认证**: 注册新用户并测试登录
3. 📁 **上传文件**: 测试文档上传功能
4. 🔄 **实时功能**: 配置实时数据同步
5. 📈 **监控**: 在 Dashboard 中查看使用情况和性能

## 生产环境注意事项

部署到生产环境时：

1. **更新认证 URL**: 在 Supabase Dashboard 中添加生产域名
2. **环境变量**: 在部署平台（如 Vercel）中设置生产环境变量
3. **安全检查**: 启用 RLS 并测试所有安全策略
4. **性能优化**: 根据使用情况调整数据库配置
5. **备份策略**: 设置定期备份计划

通过以上步骤，您就可以成功连接到在线 Supabase 并开始使用了！