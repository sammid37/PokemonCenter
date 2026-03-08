import api from './api';
import {
  PokemonAction,
  RequestActionDto,
  ReviewActionDto,
} from '@/types';

export const pokemonActionsService = {
  async findAll(): Promise<PokemonAction[]> {
    const { data } = await api.get<PokemonAction[]>('/pokemon-actions');
    return data;
  },

  async requestAction(dto: RequestActionDto): Promise<PokemonAction> {
    const { data } = await api.post<PokemonAction>('/pokemon-actions', dto);
    return data;
  },

  async reviewAction(id: string, dto: ReviewActionDto): Promise<PokemonAction> {
    const { data } = await api.patch<PokemonAction>(
      `/pokemon-actions/${id}/review`,
      dto,
    );
    return data;
  },
};