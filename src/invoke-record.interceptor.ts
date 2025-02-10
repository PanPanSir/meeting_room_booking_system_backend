import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class InvokeRecordInterceptor implements NestInterceptor {
  // 传递 InvokeRecordInterceptor.name 给 Logger 是为了为日志实例提供一个清晰的来源标识。
  // 这样做的好处是，能够在输出的日志中区分不同组件的日志，帮助开发者在调试时更加高效地定位问题来源。
  // 同时，它还支持代码重构和类名更改，不需要手动更新日志实例名称。
  private readonly logger = new Logger(InvokeRecordInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const useAgent = request.headers['user-agent'];
    const { ip, method, path } = request;

    this.logger.debug(
      `${method} ${ip} ${path} ${useAgent}: ${context.getClass().name}:
      ${context.getClass().name} invoked...`,
    );

    this.logger.debug(
      `user ${request.user?.userId}, ${request.user?.username}`,
    );
    const now = Date.now();
    return next.handle().pipe(
      // map 是纯处理数据流，而 tap 是调试和执行副作用操作。
      tap((res) => {
        this.logger.debug(
          `${method} ${path} ${ip} ${useAgent}: ${response.statusCode}: ${Date.now() - now}ms`,
        );
        this.logger.debug(`Response: ${JSON.stringify(res)}`);
      }),
    );
  }
}
