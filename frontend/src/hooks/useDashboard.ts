import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Pokemon,
  User,
  CreatePokemonDto,
  UpdatePokemonDto,
  PokemonAction,
  ActionType,
  ActionStatus,
} from '@/types';
import { pokemonService } from '@/services/pokemon.service';
import { authService } from '@/services/auth.service';
import { pokemonActionsService } from '@/services/pokemon-actions.service';

export type ModalState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; pokemon: Pokemon };

export function useDashboard() {
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
  const [error, setError] = useState<string | null>(null);

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

  return {
    pokemons,
    actions,
    currentUser,
    isLoading,
    isSubmitting,
    isReviewing,
    modal,
    setModal,
    actionTarget,
    setActionTarget,
    deleteTarget,
    setDeleteTarget,
    error,
    setError,
    handleCreate,
    handleEdit,
    handleDelete,
    handleRequestAction,
    handleReview,
  };
}