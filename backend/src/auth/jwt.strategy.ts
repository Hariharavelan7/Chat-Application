import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'e04ea6167c8ca3896d1690f4caf33089bfd342f94321cb770b14c88bf2b0c2e9b264b384736ed0bddcc7539e96a7adade38e8d1452f66c0547edeaa7244506ea',
    });
  }

  async validate(payload: any) {
    return this.authService.validateUser(payload);
  }
}
