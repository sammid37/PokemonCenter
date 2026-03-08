import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	providers: [UsersService],
	exports: [UsersService], // Exporta para o AuthModule usar
})
export class UsersModule {}
