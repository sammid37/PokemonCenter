import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	OneToMany,
} from 'typeorm';

import { UserRole } from '../enums/user-role.enum';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: true })
	email: string;

	@Column()
	name: string;

	// A senha nunca será retornada nas queries por padrão
	@Column({ select: false })
	password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.TRAINER,
  })
  role: UserRole;

	@CreateDateColumn()
	createdAt: Date;
}
