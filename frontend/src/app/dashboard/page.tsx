'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pokemon, User, CreatePokemonDto, UpdatePokemonDto } from '@/types';
import { pokemonService } from '@/services/pokemon.service';
import { authService } from '@/services/auth.service';
import Navbar from '@/components/ui/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PokemonCard from '@/components/pokemon/PokemonCard';
import PokemonModal from '@/components/pokemon/PokemonModal';

type ModalState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; pokemon: Pokemon };

export default function DashboardPage() {
  const router = useRouter();

  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<Pokemon | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Carrega os pokémons e o usuário logado ao montar o componente
  useEffect(() => {
    async function loadData() {
      try {
        const [pokemonsData, userData] = await Promise.all([
          pokemonService.findAll(),
          authService.getProfile(),
        ]);

        setPokemons(pokemonsData);
        setCurrentUser(userData);
      } catch {
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function handleCreate(data: CreatePokemonDto | UpdatePokemonDto) {
    setIsSubmitting(true);
    setError(null);
    try {
      const newPokemon = await pokemonService.create(data as CreatePokemonDto);
      setPokemons((prev) => [newPokemon, ...prev]);
      setModal({ open: false });
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erro ao cadastrar pokémon');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEdit(data: CreatePokemonDto | UpdatePokemonDto) {
    if (modal.open && modal.mode !== 'edit') return;
    const pokemon = (modal as { open: true; mode: 'edit'; pokemon: Pokemon }).pokemon;

    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await pokemonService.update(pokemon.id, data);
      setPokemons((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setModal({ open: false });
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erro ao editar pokémon');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setIsSubmitting(true);
    try {
      await pokemonService.remove(deleteTarget.id);
      setPokemons((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erro ao excluir pokémon');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <main className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Pokédex</h1>
            <p className="text-base-content/50 text-sm">
              {pokemons.length} pokémon{pokemons.length !== 1 ? 's' : ''} cadastrado{pokemons.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setModal({ open: true, mode: 'create' })}
            className="btn btn-neutral btn-sm"
          >
            + Novo Pokémon
          </button>
        </div>

        {/* Alerta de erro */}
        {error && (
          <div role="alert" className="alert alert-error mb-4">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="btn btn-ghost btn-xs">✕</button>
          </div>
        )}

        {/* Lista de pokémons */}
        {pokemons.length === 0 ? (
          <div className="text-center py-16 text-base-content/50">
            <p className="text-lg">Nenhum pokémon cadastrado ainda.</p>
            <p className="text-sm mt-1">Clique em &quot;Novo Pokémon&quot; para começar!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pokemons.map((pokemon) => (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                currentUserId={currentUser?.id ?? ''}
                onEdit={(p) => setModal({ open: true, mode: 'edit', pokemon: p })}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}

      </main>

      {/* Modal de criar/editar */}
      {modal.open && (
        <PokemonModal
          mode={modal.mode}
          pokemon={modal.mode === 'edit' ? modal.pokemon : undefined}
          isLoading={isSubmitting}
          onSubmit={modal.mode === 'create' ? handleCreate : handleEdit}
          onClose={() => setModal({ open: false })}
        />
      )}

      {/* Modal de confirmação de exclusão */}
      {deleteTarget && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirmar exclusão</h3>
            <p className="py-4">
              Tem certeza que deseja excluir o{' '}
              <span className="font-semibold text-error">{deleteTarget.name}</span>?
              Essa ação não pode ser desfeita.
            </p>
            <div className="modal-action">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn btn-ghost btn-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-error btn-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  'Excluir'
                )}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteTarget(null)} />
        </dialog>
      )}

    </div>
  );
}