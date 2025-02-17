import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    response.statusCode = exception.getStatus() + 12;
    const res = exception.getResponse() as { message: string[] };
    const data = Array.isArray(res?.message)
      ? res?.message?.join(',')
      : res?.message || exception.message;
    response
      .json({
        code: exception.getStatus(),
        message: 'fail',
        data,
      })
      .end();
  }
}
