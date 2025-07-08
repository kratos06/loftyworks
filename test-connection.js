const { createClient } = require('@supabase/supabase-js')

// 使用您的 Supabase 配置
const supabaseUrl = 'https://butrivicgcwdtieycrui.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1dHJpdmljZ2N3ZHRpZXljcnVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDE3MjQsImV4cCI6MjA2NzQ3NzcyNH0.UyIgpoZbvWf47XnAXWMD_P6Oi6b8jpt4RZqkjBqXaTc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔗 正在测试 Supabase 连接...')
  console.log('URL:', supabaseUrl)
  
  try {
    // 测试认证服务连接
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ 认证服务连接失败:', authError.message)
      return false
    }
    
    console.log('✅ Supabase 连接成功!')
    console.log('🔐 认证服务: 正常')
    console.log('📋 当前会话:', authData.session ? '已登录' : '未登录')
    
    // 尝试创建一个测试用户（不会真正创建，只是测试API连接）
    console.log('📡 测试 API 连接...')
    
    // 简单的健康检查 - 尝试访问 auth API
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        'apikey': supabaseKey
      }
    })
    
    if (response.ok) {
      console.log('✅ API 端点可访问')
    } else {
      console.log('⚠️  API 端点返回状态:', response.status)
    }
    
    return true
    
  } catch (err) {
    console.error('❌ 连接异常:', err.message)
    return false
  }
}

// 执行测试
testConnection().then(success => {
  if (success) {
    console.log('\n🎉 连接测试完成! 您可以开始使用 Supabase 了。')
    console.log('\n下一步:')
    console.log('1. 在 Supabase Dashboard 的 SQL Editor 中执行 docs/supabase-schema.sql')
    console.log('2. 配置认证和存储设置')
    console.log('3. 开始开发您的应用')
  } else {
    console.log('\n❌ 连接失败，请检查配置')
  }
  process.exit(success ? 0 : 1)
})