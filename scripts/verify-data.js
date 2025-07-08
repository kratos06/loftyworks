require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyData() {
  try {
    console.log('🔍 验证数据库中的数据...\n');

    // 检查联系人数据
    console.log('📞 检查联系人数据:');
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(5);

    if (contactsError) {
      console.error('❌ 联系人查询错误:', contactsError);
    } else {
      console.log(`✅ 找到 ${contacts.length} 条联系人记录`);
      if (contacts.length > 0) {
        console.log('   示例:', contacts[0].name, '-', contacts[0].type);
      }
    }

    // 检查任务数据
    console.log('\n📋 检查任务数据:');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(5);

    if (tasksError) {
      console.error('❌ 任务查询错误:', tasksError);
    } else {
      console.log(`✅ 找到 ${tasks.length} 条任务记录`);
      if (tasks.length > 0) {
        console.log('   示例:', tasks[0].title, '-', tasks[0].status);
      }
    }

    // 检查文档数据
    console.log('\n📄 检查文档数据:');
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .limit(5);

    if (documentsError) {
      console.error('❌ 文档查询错误:', documentsError);
    } else {
      console.log(`✅ 找到 ${documents.length} 条文档记录`);
      if (documents.length > 0) {
        console.log('   示例:', documents[0].file_name, '-', documents[0].status);
      }
    }

    // 检查属性数据
    console.log('\n🏠 检查属性数据:');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .limit(5);

    if (propertiesError) {
      console.error('❌ 属性查询错误:', propertiesError);
    } else {
      console.log(`✅ 找到 ${properties.length} 条属性记录`);
      if (properties.length > 0) {
        console.log('   示例:', properties[0].address, '-', properties[0].status);
      }
    }

    // 测试前端使用的查询方式
    console.log('\n🔍 测试前端查询方式:');
    
    // 模拟前端的联系人查询
    const { data: frontendContacts, error: frontendContactsError } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(0, 49);

    if (frontendContactsError) {
      console.error('❌ 前端联系人查询错误:', frontendContactsError);
    } else {
      console.log(`✅ 前端联系人查询成功: ${frontendContacts.length} 条记录`);
    }

    // 模拟前端的任务查询
    const { data: frontendTasks, error: frontendTasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .range(0, 49);

    if (frontendTasksError) {
      console.error('❌ 前端任务查询错误:', frontendTasksError);
    } else {
      console.log(`✅ 前端任务查询成功: ${frontendTasks.length} 条记录`);
    }

    // 模拟前端的文档查询
    const { data: frontendDocuments, error: frontendDocumentsError } = await supabase
      .from('documents')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .range(0, 49);

    if (frontendDocumentsError) {
      console.error('❌ 前端文档查询错误:', frontendDocumentsError);
    } else {
      console.log(`✅ 前端文档查询成功: ${frontendDocuments.length} 条记录`);
    }

  } catch (error) {
    console.error('💥 验证数据时发生错误:', error);
  }
}

verifyData();
