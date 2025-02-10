import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class FormatResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        return {
          code: response.statusCode,
          message: 'success',
          data,
        };
      }),
    );
  }
}
// 1. response 只包含响应的元数据（如状态码、头部等）： response 并不直接包含业务数据。它只是响应的外层容器，你的业务数据（例如数据库查询的结果）通常是在 next.handle() 处理后通过 data 来返回的。因此，data 才是你在响应体中实际传递的数据。

// 2. next.handle() 会返回一个 Observable： next.handle() 会返回一个 Observable，并且 map 操作符会对从 next.handle() 获取到的数据进行处理（即请求处理后的业务数据）。这个 data 是你希望返回给客户端的实际数据内容。Interceptor 的目标就是在响应数据被处理并返回前对其进行格式化或修改。

// 3. 为什么在 map 中使用 data：由于 next.handle() 返回的是一个 Observable，map 可以对 data 进行操作。data 是请求返回的结果，通常是业务逻辑处理之后的响应数据，可能是查询结果、操作结果等。你可以通过 map 对这个数据进行格式化处理，修改返回结构（例如添加 code、message 字段）。
// 3.1 NestJS 基于 RxJS 的设计让整个应用的处理流程可以以流的方式进行，支持异步操作、管道、拦截器、守卫等操作，这使得异步操作的处理变得非常灵活
