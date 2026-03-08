'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AxiosError } from 'axios';
import { authService } from '@/services/auth.service';

export default function RegisterForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validação de confirmação de senha no frontend
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
      });

      // Salva o token também como cookie para o middleware conseguir ler
      document.cookie = `access_token=${localStorage.getItem('access_token')}; path=/`;

      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message ?? 'Erro ao realizar cadastro');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Alerta de erro */}
      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Campo nome */}
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

      {/* Campo e-mail */}
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

      {/* Campo senha */}
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

      {/* Campo confirmação de senha */}
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

      {/* Botão de submit */}
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

      {/* Link para login */}
      <p className="text-center text-sm text-base-content/60">
        Já tem uma conta?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Entrar
        </Link>
      </p>

    </form>
  );
}