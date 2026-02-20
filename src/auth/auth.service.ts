import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

   
    async register(createUserDto: any) {
        const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
        if (existingUser) {
            throw new BadRequestException('El email ya está registrado');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        
        const user = await this.usersService.create({
            ...createUserDto,
            password: hashedPassword,
            level: 1,
            xp: 0
        });

        
        return this.login(user);
    }

    
    async login(user: any) {
        const payload = { email: user.email, sub: user.id, roles: user.roles }; 
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                roles: user.roles,
                level: user.level
            }
        };
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
}