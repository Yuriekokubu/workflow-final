// perf-logger.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';

@Injectable()
export class PerfLoggerInterceptor implements NestInterceptor {
  
  private readonly logger = new Logger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const className = context.getClass().name
    const message = `${className} ${url} ${method}`

    const now = Date.now()

    return next.handle().pipe(
      tap(() => this.logger.log(`${message} finish ${Date.now() - now} ms`, PerfLoggerInterceptor.name)),
      catchError(err => {
        this.logger.warn(`${message} ${err} finish ${Date.now() - now} ms`, PerfLoggerInterceptor.name)
        throw err
      })
    );

  }
}
