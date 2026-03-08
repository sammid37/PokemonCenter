import { Pokemon, PokemonGender, PokemonHealthStatus } from '@/types';

const TYPE_COLORS: Record<string, string> = {
  Normal: 'badge-ghost',
  Fire: 'badge-error',
  Water: 'badge-info',
  Grass: 'badge-success',
  Electric: 'badge-warning',
  Ice: 'badge-info',
  Fighting: 'badge-error',
  Poison: 'badge-secondary',
  Ground: 'badge-warning',
  Flying: 'badge-info',
  Psychic: 'badge-secondary',
  Bug: 'badge-success',
  Rock: 'badge-ghost',
  Ghost: 'badge-secondary',
  Dragon: 'badge-primary',
  Steel: 'badge-ghost',
  Dark: 'badge-neutral',
  Fairy: 'badge-secondary',
};

const HEALTH_STATUS_STYLE: Record<PokemonHealthStatus, { badge: string; label: string }> = {
  [PokemonHealthStatus.HEALTHY]:       { badge: 'badge-success', label: '✓ Saudável' },
  [PokemonHealthStatus.POISONED]:      { badge: 'badge-warning', label: 'Envenenado' },
  [PokemonHealthStatus.BADLY_POISONED]:{ badge: 'badge-warning', label: 'Env. Grave' },
  [PokemonHealthStatus.BURNED]:        { badge: 'badge-error',   label: '🔥 Queimado' },
  [PokemonHealthStatus.PARALYZED]:     { badge: 'badge-warning', label: '⚡ Paralisado' },
  [PokemonHealthStatus.ASLEEP]:        { badge: 'badge-ghost',   label: '💤 Dormindo' },
  [PokemonHealthStatus.FROZEN]:        { badge: 'badge-info',    label: '❄ Congelado' },
  [PokemonHealthStatus.FAINTED]:       { badge: 'badge-error',   label: '✕ Desmaiado' },
};

interface PokemonCardProps {
  pokemon: Pokemon;
  currentUserId: string;
  onEdit: (pokemon: Pokemon) => void;
  onDelete: (pokemon: Pokemon) => void;
}

export default function PokemonCard({
  pokemon,
  currentUserId,
  onEdit,
  onDelete,
}: PokemonCardProps) {
  // Verifica se o usuário logado é o dono do pokémon
  const isOwner = pokemon.createdBy?.id === currentUserId;
  const healthStyle = HEALTH_STATUS_STYLE[pokemon.healthStatus];

  return (
    <div className="card bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition-shadow">
      <div className="card-body gap-3">

        {/* Header — nome, número e gênero */}
        <div className="flex justify-between items-start">
          <div>
            {/* Exibe apelido como título se existir */}
            <h2 className="card-title text-lg">
              {pokemon.nickname ?? pokemon.name}
            </h2>

            {/* Exibe o nome da espécie abaixo do apelido */}
            {pokemon.nickname && (
              <p className="text-xs text-base-content/50 italic">{pokemon.name}</p>
            )}

            <span className="text-xs text-base-content/50">
              #{String(pokemon.pokedexNumber).padStart(3, '0')}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1">
            {/* Badges de tipo */}
            <div className="flex flex-wrap gap-1 justify-end">
              {pokemon.types.map((type) => (
                <span
                  key={type}
                  className={`badge badge-sm ${TYPE_COLORS[type] ?? 'badge-ghost'}`}
                >
                  {type}
                </span>
              ))}
            </div>

            {/* Gênero */}
            <span
              className={`text-lg font-bold ${
                pokemon.gender === PokemonGender.MALE
                  ? 'text-info'
                  : 'text-error'
              }`}
            >
              {pokemon.gender === PokemonGender.MALE ? '♂' : '♀'}
            </span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-base-content/50 text-xs">Nível</span>
            <span className="font-semibold">{pokemon.level}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base-content/50 text-xs">HP</span>
            <span className="font-semibold">{pokemon.hp}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base-content/50 text-xs">Altura</span>
            <span className="font-semibold">{pokemon.height}m</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base-content/50 text-xs">Peso</span>
            <span className="font-semibold">{pokemon.weight}kg</span>
          </div>
        </div>

        {/* Barra de HP */}
        <progress
          className="progress progress-success w-full"
          value={pokemon.hp}
          max={255}
        />

        {/* Status de saúde */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-base-content/50">Status:</span>
          <span className={`badge badge-sm ${healthStyle.badge}`}>
            {healthStyle.label}
          </span>
        </div>

        {/* Treinador */}
        <p className="text-xs text-base-content/50">
          Treinador: {pokemon.createdBy?.name ?? 'Desconhecido'}
        </p>

        {/* Botões — apenas para o dono */}
        {isOwner && (
          <div className="card-actions justify-end mt-1">
            <button
              onClick={() => onEdit(pokemon)}
              className="btn btn-outline btn-primary btn-xs"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(pokemon)}
              className="btn btn-outline btn-error btn-xs"
            >
              Excluir
            </button>
          </div>
        )}

      </div>
    </div>
  );
}