import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	OneToMany,
} from 'typeorm';

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

	@CreateDateColumn()
	createdAt: Date;
}
