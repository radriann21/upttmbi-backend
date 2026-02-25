import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async createCommonUser(createUserDto: CreateUserDto) {
    const existentUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existentUser) {
      throw new ConflictException({
        statusCode: 409,
        message: 'El correo electrónico ya está registrado',
        error: 'Conflict',
      });
    }

    try {
      await this.prisma.user.create({ data: createUserDto });
      return {
        message: 'Usuario creado exitosamente',
      };
    } catch (error) {
      this.logger.error('Error crítico al guardar en base de datos', error);
      throw new InternalServerErrorException(
        'Error crítico al guardar en base de datos',
      );
    }
  }

  async createNewStudent(createUserDto: CreateUserDto) {
    const { name, lastName, email, password, preRegId, role } = createUserDto;

    const preRegistrationExistent =
      await this.prisma.preRegisteredStudent.findUnique({
        where: { id: preRegId },
      });

    if (!preRegistrationExistent) {
      throw new ConflictException({
        statusCode: 409,
        message: 'La pre-registración no existe',
        error: 'Conflict',
      });
    }

    if (preRegistrationExistent.isUsed) {
      throw new ConflictException({
        statusCode: 409,
        message: 'La pre-registración ya fue utilizada',
        error: 'Conflict',
      });
    }

    const emailExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      throw new ConflictException({
        statusCode: 409,
        message: 'El correo electrónico ya está registrado',
        error: 'Conflict',
      });
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            name,
            lastName,
            email,
            password,
            role,
          },
        });

        await tx.preRegisteredStudent.update({
          where: { id: preRegId },
          data: { isUsed: true },
        });

        return {
          message: 'Usuario creado exitosamente',
        };
      });
    } catch (error) {
      this.logger.error('Error crítico al guardar en base de datos', error);
      throw new InternalServerErrorException(
        'Error crítico al guardar en base de datos',
      );
    }
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Usuario no encontrado',
        error: 'Not Found',
      });
    }

    return user;
  }
}
