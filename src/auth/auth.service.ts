import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

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

  async login() {
    // TODO: Implement login logic
  }
}
