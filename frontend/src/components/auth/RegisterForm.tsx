'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { UserRole } from '@/types';

export default function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.TRAINER,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      document.cookie = `access_token=${localStorage.getItem('access_token')}; path=/`;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Erro ao realizar cadastro');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Nome */}
      <label className="form-control">
        <div className="label">
          <span className="label-text">Nome</span>
        </div>
        <input
          type="text"
          name="name"
          placeholder="Ash Ketchum"
          className="input input-bordered w-full"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </label>

      {/* E-mail */}
      <label className="form-control">
        <div className="label">
          <span className="label-text">E-mail</span>
        </div>
        <input
          type="email"
          name="email"
          placeholder="ash@pokemon.com"
          className="input input-bordered w-full"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>

      {/* Tipo de usuário */}
      <label className="form-control">
        <div className="label">
          <span className="label-text">Tipo de usuário</span>
        </div>
        <select
          name="role"
          className="select select-bordered w-full"
          value={formData.role}
          onChange={handleChange}
        >
          <option value={UserRole.TRAINER}>🎒 Treinador</option>
          <option value={UserRole.NURSE}>🏥 Enfermeira Joy</option>
        </select>
      </label>

      {/* Senha */}
      <label className="form-control">
        <div className="label">
          <span className="label-text">Senha</span>
        </div>
        <input
          type="password"
          name="password"
          placeholder="••••••"
          className="input input-bordered w-full"
          value={formData.password}
          onChange={handleChange}
          minLength={6}
          required
        />
      </label>

      {/* Confirmação de senha */}
      <label className="form-control">
        <div className="label">
          <span className="label-text">Confirmar senha</span>
        </div>
        <input
          type="password"
          name="confirmPassword"
          placeholder="••••••"
          className="input input-bordered w-full"
          value={formData.confirmPassword}
          onChange={handleChange}
          minLength={6}
          required
        />
      </label>

      <button
        type="submit"
        className="btn btn-primary w-full mt-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          'Cadastrar'
        )}
      </button>

      <p className="text-center text-sm text-base-content/60">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Entrar
        </Link>
      </p>

    </form>
  );
}