import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminTokenGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header('x-admin-token');
    const expected = this.config.getOrThrow<string>('ADMIN_TOKEN');

    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Noto\'g\'ri yoki yo\'q admin token');
    }
    return true;
  }
}
