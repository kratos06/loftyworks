require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFileTypes() {
  try {
    const { data } = await supabase
      .from('documents')
      .select('file_type')
      .limit(20);
    
    if (data && data.length > 0) {
      const fileTypes = [...new Set(data.map(d => d.file_type))];
      console.log('有效文件类型:', fileTypes);
    } else {
      console.log('没有找到现有文档，尝试插入测试文档...');
      
      // 尝试不同的文件类型
      const testTypes = ['pdf', 'PDF', 'application/pdf'];
      
      for (const type of testTypes) {
        const { error } = await supabase
          .from('documents')
          .insert({
            file_name: `test.${type}`,
            file_type: type,
            file_url: "https://example.com/test.pdf",
            property: "测试物业",
            document_type: "Tenancy Agreement",
            status: "Valid",
            create_date: "2024-01-01"
          });
        
        if (!error) {
          console.log(`✅ 文件类型 "${type}" 有效`);
          // 删除测试记录
          await supabase.from('documents').delete().eq('file_name', `test.${type}`);
          break;
        } else {
          console.log(`❌ 文件类型 "${type}" 无效:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('检查文件类型时出错:', error);
  }
}

checkFileTypes();
