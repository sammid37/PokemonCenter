'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Pokemon, User, UserRole,
  CreatePokemonDto, UpdatePokemonDto,
  PokemonAction, ActionType, ActionStatus,
} from '@/types';
import { pokemonService } from '@/services/pokemon.service';
import { authService } from '@/services/auth.service';
import { pokemonActionsService } from '@/services/pokemon-actions.service';
import Navbar from '@/components/ui/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PokemonCard from '@/components/pokemon/PokemonCard';
import PokemonModal from '@/components/pokemon/PokemonModal';
import ActionModal from '@/components/pokemon/ActionModal';
import ActionsList from '@/components/pokemon/ActionsList';

type ModalState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; pokemon: Pokemon };

type ActiveTab = 'pokemons' | 'actions';

export default function DashboardPage() {
  const router = useRouter();

  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [actions, setActions] = useState<PokemonAction[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [actionTarget, setActionTarget] = useState<Pokemon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Pokemon | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('pokemons');
  const [error, setError] = useState<string | null>(null);

  const isNurse = currentUser?.role === UserRole.NURSE;

  // Conta solicitações pendentes para exibir badge na aba
  const pendingCount = actions.filter(
    (a) => a.status === ActionStatus.PENDING,
  ).length;

  useEffect(() => {
    async function loadData() {
      try {
        const [pokemonsData, userData, actionsData] = await Promise.all([
          pokemonService.findAll(),
          authService.getProfile(),
          pokemonActionsService.findAll(),
        ]);

        setPokemons(pokemonsData);
        setCurrentUser(userData);
        setActions(actionsData);
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
    if (!modal.open || modal.mode !== 'edit') return;

    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await pokemonService.update(modal.pokemon.id, data);
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

  async function handleRequestAction(type: ActionType, note?: string) {
    if (!actionTarget) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const newAction = await pokemonActionsService.requestAction({
        pokemonId: actionTarget.id,
        type,
        trainerNote: note,
      });
      setActions((prev) => [newAction, ...prev]);
      setActionTarget(null);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erro ao solicitar cuidado');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReview(action: PokemonAction, approved: boolean) {
    setIsReviewing(true);
    setError(null);
    try {
      const updated = await pokemonActionsService.reviewAction(action.id, {
        status: approved ? ActionStatus.APPROVED : ActionStatus.REJECTED,
      });

      setActions((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

      // Atualiza o pokémon na lista se a ação foi de cura e aprovada
      if (approved && action.type === ActionType.HEAL) {
        const updatedPokemon = await pokemonService.findOne(action.pokemon.id);
        setPokemons((prev) =>
          prev.map((p) => (p.id === updatedPokemon.id ? updatedPokemon : p)),
        );
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erro ao revisar solicitação');
    } finally {
      setIsReviewing(false);
    }
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar user={currentUser} />

      <main className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {isNurse ? '🏥 Centro Pokémon' : '🎒 Meus Pokémons'}
            </h1>
            <p className="text-base-content/50 text-sm">
              {isNurse
                ? `${pokemons.length} pokémon${pokemons.length !== 1 ? 's' : ''} sob cuidados`
                : `${pokemons.length} pokémon${pokemons.length !== 1 ? 's' : ''} cadastrado${pokemons.length !== 1 ? 's' : ''}`
              }
            </p>
          </div>

          {!isNurse && (
            <button
              onClick={() => setModal({ open: true, mode: 'create' })}
              className="btn btn-primary btn-sm"
            >
              + Novo Pokémon
            </button>
          )}
        </div>

        {/* Alerta de erro */}
        {error && (
          <div role="alert" className="alert alert-error mb-4">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="btn btn-ghost btn-xs">
              ✕
            </button>
          </div>
        )}

        {/* Abas */}
        <div role="tablist" className="tabs tabs-bordered mb-6">
          <button
            role="tab"
            className={`tab ${activeTab === 'pokemons' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('pokemons')}
          >
            Pokémons
          </button>
          <button
            role="tab"
            className={`tab ${activeTab === 'actions' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            Solicitações
            {/* Badge de pendentes */}
            {pendingCount > 0 && (
              <span className="badge badge-warning badge-sm ml-2">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Aba de Pokémons */}
        {activeTab === 'pokemons' && (
          pokemons.length === 0 ? (
            <div className="text-center py-16 text-base-content/50">
              <p className="text-lg">
                {isNurse
                  ? 'Nenhum pokémon no centro no momento.'
                  : 'Nenhum pokémon cadastrado ainda.'}
              </p>
              {!isNurse && (
                <p className="text-sm mt-1">
                  Clique em "Novo Pokémon" para começar!
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {pokemons.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  currentUser={currentUser}
                  onEdit={(p) => setModal({ open: true, mode: 'edit', pokemon: p })}
                  onDelete={setDeleteTarget}
                  onRequestAction={setActionTarget}
                />
              ))}
            </div>
          )
        )}

        {/* Aba de Solicitações */}
        {activeTab === 'actions' && (
          <ActionsList
            actions={actions}
            currentUser={currentUser}
            onReview={handleReview}
            isReviewing={isReviewing}
          />
        )}

      </main>

      {/* Modal de criar/editar pokémon */}
      {modal.open && (
        <PokemonModal
          mode={modal.mode}
          pokemon={modal.mode === 'edit' ? modal.pokemon : undefined}
          isLoading={isSubmitting}
          onSubmit={modal.mode === 'create' ? handleCreate : handleEdit}
          onClose={() => setModal({ open: false })}
        />
      )}

      {/* Modal de solicitar cuidado */}
      {actionTarget && (
        <ActionModal
          pokemon={actionTarget}
          isLoading={isSubmitting}
          onSubmit={handleRequestAction}
          onClose={() => setActionTarget(null)}
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