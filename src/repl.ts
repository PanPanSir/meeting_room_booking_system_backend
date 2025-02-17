import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

// 对应 package.json 的启动命令：
// "repl": "nest start --watch --entryFile repl",
async function bootstrap() {
  const replServer = await repl(AppModule);
  replServer.setupHistory('.nestjs_repl_history', (err) => {
    if (err) {
      console.error('bootstrap replServer error:', err);
    }
  });
}
bootstrap();
