import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PokemonType } from '../enums/pokemon-type.enum';

@Entity('pokemons')
export class Pokemon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Array de enum com no mínimo 1 e no máximo 2 tipos
  @Column({
    type: 'enum',
    enum: PokemonType,
    array: true,
  })
  types: PokemonType[];

  @Column()
  level: number;

  @Column()
  hp: number;

  @Column()
  pokedexNumber: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}