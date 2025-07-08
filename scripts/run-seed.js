const { execSync } = require('child_process');
const path = require('path');

// 设置环境变量
process.env.NODE_ENV = 'development';

// 运行 TypeScript 文件
try {
  console.log('🚀 开始执行数据种子脚本...');
  
  // 使用 ts-node 运行 TypeScript 文件
  execSync('npx ts-node scripts/seed-data.ts', {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
} catch (error) {
  console.error('❌ 执行失败:', error.message);
  process.exit(1);
}
