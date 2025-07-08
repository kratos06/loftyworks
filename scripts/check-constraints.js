require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConstraints() {
  try {
    console.log('🔍 检查数据库约束...');

    // 检查 tasks 表的状态约束
    console.log('\n📋 检查 tasks 表约束...');
    const { data: tasksConstraints, error: tasksError } = await supabase
      .rpc('get_table_constraints', { table_name: 'tasks' });

    if (tasksError) {
      console.log('使用备用方法检查 tasks 表...');
      // 尝试插入一个测试记录来了解约束
      const { error: testTaskError } = await supabase
        .from('tasks')
        .insert({
          title: "测试任务",
          description: "测试描述",
          type: "Test",
          type_color: "#000000",
          date: "2024-01-01",
          address: "测试地址",
          task_number: "TEST001",
          priority: "Low",
          status: "Pending"
        });
      
      if (testTaskError) {
        console.log('❌ Tasks 约束错误:', testTaskError.message);
      }
    }

    // 检查 documents 表的约束
    console.log('\n📄 检查 documents 表约束...');
    const { error: testDocError } = await supabase
      .from('documents')
      .insert({
        file_name: "测试文档.pdf",
        file_type: "application/pdf",
        file_url: "https://example.com/test.pdf",
        property: "测试物业",
        document_type: "Test",
        status: "Active",
        create_date: "2024-01-01"
      });
    
    if (testDocError) {
      console.log('❌ Documents 约束错误:', testDocError.message);
    }

    // 查询现有的有效值
    console.log('\n🔍 查询现有数据以了解有效值...');
    
    // 查询现有任务的状态和类型
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('status, type, priority')
      .limit(10);
    
    if (existingTasks && existingTasks.length > 0) {
      console.log('📋 现有任务状态:', [...new Set(existingTasks.map(t => t.status))]);
      console.log('📋 现有任务类型:', [...new Set(existingTasks.map(t => t.type))]);
      console.log('📋 现有任务优先级:', [...new Set(existingTasks.map(t => t.priority))]);
    }

    // 查询现有文档的类型和状态
    const { data: existingDocs } = await supabase
      .from('documents')
      .select('document_type, status')
      .limit(10);
    
    if (existingDocs && existingDocs.length > 0) {
      console.log('📄 现有文档类型:', [...new Set(existingDocs.map(d => d.document_type))]);
      console.log('📄 现有文档状态:', [...new Set(existingDocs.map(d => d.status))]);
    }

  } catch (error) {
    console.error('💥 检查约束时发生错误:', error);
  }
}

checkConstraints();
