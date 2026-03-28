'use client';

import { UserRole } from '@/types';
import { useDashboard } from '@/hooks/useDashboard';

import Navbar from '@/components/ui/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import TrainerDashboard from './TrainerDashboard';
import NurseDashboard from './NurseDashboard';

export default function DashboardPage() {
  const {
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
  } = useDashboard();

  if (isLoading) return <LoadingSpinner />;
  if (!currentUser) return null;

  const isNurse = currentUser.role === UserRole.NURSE;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar user={currentUser} />
      {isNurse ? (
        <NurseDashboard
          pokemons={pokemons}
          actions={actions}
          currentUser={currentUser}
          error={error}
          setError={setError}
          isReviewing={isReviewing}
          handleReview={handleReview}
        />
      ) : (
        <TrainerDashboard
          pokemons={pokemons}
          actions={actions}
          currentUser={currentUser}
          error={error}
          setError={setError}
          modal={modal}
          setModal={setModal}
          actionTarget={actionTarget}
          setActionTarget={setActionTarget}
          deleteTarget={deleteTarget}
          setDeleteTarget={setDeleteTarget}
          isSubmitting={isSubmitting}
          handleCreate={handleCreate}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleRequestAction={handleRequestAction}
        />
      )}
    </div>
  );
}
