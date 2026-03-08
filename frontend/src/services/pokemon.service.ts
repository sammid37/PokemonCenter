import api from './api';
import { Pokemon, CreatePokemonDto, UpdatePokemonDto } from '@/types';

export const pokemonService = {
  async findAll(): Promise<Pokemon[]> {
    const { data } = await api.get<Pokemon[]>('/pokemons');
    return data;
  },

  async findOne(id: string): Promise<Pokemon> {
    const { data } = await api.get<Pokemon>(`/pokemons/${id}`);
    return data;
  },

  async create(dto: CreatePokemonDto): Promise<Pokemon> {
    const { data } = await api.post<Pokemon>('/pokemons', dto);
    return data;
  },

  async update(id: string, dto: UpdatePokemonDto): Promise<Pokemon> {
    const { data } = await api.put<Pokemon>(`/pokemons/${id}`, dto);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/pokemons/${id}`);
  },
};