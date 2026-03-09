'use client';

import Link from 'next/link';

export default function Footer() {
  const technologies = [
    { name: 'Next.js', url: 'https://nextjs.org' },
    { name: 'NestJS', url: 'https://nestjs.com' },
    { name: 'TypeScript', url: 'https://www.typescriptlang.org' },
    { name: 'PostgreSQL', url: 'https://www.postgresql.org' },
    { name: 'TailwindCSS', url: 'https://tailwindcss.com' },
    { name: 'DaisyUI', url: 'https://daisyui.com' },
    { name: 'PokéAPI', url: 'https://pokeapi.co' },
  ];

  return (
    <footer className="bg-base-300 border-t border-base-content/10 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Coluna 1 — Nome e descrição */}
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-primary">
              PokéCenter
            </h2>
            <p className="text-sm text-base-content/60 leading-relaxed">
              Sistema para treinadores e Enfermeiras Joy cuidarem dos seus pokémons com carinho. 💚
            </p>
            <p className="text-xs text-base-content/40 leading-relaxed">
              Desenvolvido para o desafio técnico para Desenvolvedor Júnior na SIM INT.
            </p>
          </div>

          {/* Coluna 2 — Tecnologias */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-base-content/80 uppercase tracking-wider">
              Feito com
            </h3>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <a
                  key={tech.name}
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="badge badge-outline badge-sm hover:badge-primary transition-colors cursor-pointer"
                >
                  {tech.name}
                </a>
              ))}
            </div>
          </div>

          {/* Coluna 3 — Desenvolvedora e links */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-base-content/80 uppercase tracking-wider">
              Desenvolvedora
            </h3>
            <p className="text-sm text-base-content/60">
              Feito com 💚 por{' '}
              <span className="font-semibold text-base-content">
                Samantha Medeiros
              </span>
            </p>

            {/* GitHub */}
            <a
              href="https://github.com/sammid37/PokemonCenter"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors w-fit mt-1"
            >
              {/* Ícone do GitHub em SVG — sem dependência de biblioteca */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              <span>sammid37/PokemonCenter/</span>
              ⭐
            </a>
          </div>

        </div>

        {/* Linha divisória e versão */}
        <div className="divider my-4" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-base-content/40">
          <p>© {new Date().getFullYear()} PokéCenter — Todos os direitos reservados</p>
          <p className="badge badge-ghost badge-sm">v1.0.0</p>
        </div>

      </div>
    </footer>
  );
}