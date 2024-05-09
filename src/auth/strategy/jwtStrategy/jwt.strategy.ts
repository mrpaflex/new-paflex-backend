import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    const secret = configService.get('JWT_SECRET');
    super({
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   (request: Request) => request?.cookies?.Authentication,
      // ]),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const { id } = payload;
    const user = await this.userService.getById(id);
    if (!user) {
      throw new UnauthorizedException(
        'you need to log in first to gain access',
      );
    }

    return user;
  }
}
