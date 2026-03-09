import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pokemon } from '../../pokemons/entities/pokemon.entity';
import { User } from '../../users/entities/user.entity';
import { ActionType } from '../enums/action-type.enum';
import { ActionStatus } from '../enums/action-status.enum';

@Entity('pokemon_actions')
export class PokemonAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pokemon, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pokemon_id' })
  pokemon: Pokemon;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'requested_by' })
  requestedBy: User;

  // Enfermeira Joy que aprovou ou recusou — null enquanto pendente
  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: User | null;

  @Column({ type: 'enum', enum: ActionType })
  type: ActionType;

  @Column({ type: 'enum', enum: ActionStatus, default: ActionStatus.PENDING })
  status: ActionStatus;

  // Observação opcional do treinador ao solicitar
  @Column({ type: 'varchar', nullable: true })
  trainerNote: string | null;

  // Observação da Enfermeira Joy ao aprovar ou recusar
  @Column({ type: 'varchar', nullable: true })
  nurseNote: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}