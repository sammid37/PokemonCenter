export enum PokemonType {
  NORMAL = 'Normal',
  FIRE = 'Fire',
  WATER = 'Water',
  GRASS = 'Grass',
  ELECTRIC = 'Electric',
  ICE = 'Ice',
  FIGHTING = 'Fighting',
  POISON = 'Poison',
  GROUND = 'Ground',
  FLYING = 'Flying',
  PSYCHIC = 'Psychic',
  BUG = 'Bug',
  ROCK = 'Rock',
  GHOST = 'Ghost',
  DRAGON = 'Dragon',
  STEEL = 'Steel',
  DARK = 'Dark',
  FAIRY = 'Fairy',
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Pokemon {
  id: string;
  name: string;
  types: PokemonType[];
  level: number;
  hp: number;
  pokedexNumber: number;
  createdBy: User;
}

export interface AuthResponse {
  access_token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface CreatePokemonDto {
  name: string;
  types: PokemonType[];
  level: number;
  hp: number;
  pokedexNumber: number;
}

export type UpdatePokemonDto = Partial<CreatePokemonDto>;