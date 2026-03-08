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
import { PokemonGender } from '../enums/pokemon-gender.enum'; 
import { PokemonStatus } from '../enums/pokemon-status.enum';

@Entity('pokemons')
export class Pokemon {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({type: 'varchar', length: 100})
  name: string;
  
  @Column({type: 'varchar', length: 100, nullable: true})
  nickname?: string;
  
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
  
  @Column({ type: 'decimal', precision: 5, scale: 1 })
  height: number;
  
  @Column({ type: 'decimal', precision: 6, scale: 1 })
  weight: number;
  
  @Column({
    type: 'enum',
    enum: PokemonGender,
  })
  gender: PokemonGender;
  
  @Column({
    type: 'enum',
    enum: PokemonStatus,
    default: PokemonStatus.HEALTHY,
  })
  healthStatus: PokemonStatus;
  
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