import {
	Injectable,
	ConflictException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>,
	) {}

	async findByEmail(email: string): Promise<User | null> {
		return this.usersRepository
			.createQueryBuilder('user')
			.addSelect('user.password')
			.where('user.email = :email', { email })
			.getOne();
	}

	async findById(id: string): Promise<User> {
		const user = await this.usersRepository.findOne({ where: { id } });

		if (!user) {
			throw new NotFoundException('Usuário não encontrado');
		}

		return user;
	}

	async create(data: Partial<User>): Promise<User> {
		const existingUser = await this.usersRepository.findOne({
			where: { email: data.email },
		});

		if (existingUser) {
			throw new ConflictException('E-mail já cadastrado');
		}

		const user = this.usersRepository.create(data);
		return this.usersRepository.save(user);
	}
}
