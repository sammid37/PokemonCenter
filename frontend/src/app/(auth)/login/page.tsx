import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary">Centro Pokémon</h1>
            <p className="text-base-content/60 mt-1">
              Entre com sua conta de treinador
            </p>
          </div>

          <LoginForm />

        </div>
      </div>
    </main>
  );
}