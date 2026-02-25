import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/loginResponse.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: CreateUserDto) {
    const { email, name, lastName, password, role, preRegId } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (preRegId) {
      const studentuser = await this.usersService.createNewStudent({
        email,
        name,
        lastName,
        password: hashedPassword,
        role,
        preRegId,
      });
      return studentuser;
    }

    const user = await this.usersService.createCommonUser({
      email,
      name,
      lastName,
      password: hashedPassword,
      role,
    });
    return user;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    const user = await this.usersService.findByEmail(email);
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña invalida');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
