import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { UsersService } from "src/users/users.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        private configService: ConfigService,
        private userService: UsersService
    ){
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          secretOrKey:
            configService.get<string>('JWT_SECRET') || 'default_secret',
        });
    }

    async validate(payload: any) {
        const user =  await this.userService.findById(payload.sub);
        if(!user){
            throw new UnauthorizedException("User not found")
        }

        return user;

    }
}   
