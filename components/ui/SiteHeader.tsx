import Link from 'next/link';

const navItems = [
  { title: 'Método', href: '#method' },
  { title: 'Produto', href: '#product' },
  { title: 'Academy', href: '#academy' },
  { title: 'Contato', href: '#contact' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
        <div className="space-y-1">
          <Link href="/" className="text-sm font-semibold tracking-[0.28em] text-slate-950">
            ATLAZ
          </Link>
          <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
            INTELIGÊNCIA PARA DECISÕES
          </p>
        </div>

        <nav className="hidden items-center gap-10 text-sm font-medium text-slate-700 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="transition-colors duration-200 hover:text-slate-950"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center">
          <Link
            href="/new"
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition duration-200 transform hover:-translate-y-0.5 hover:bg-slate-900"
          >
            Resolver um Problema
          </Link>
        </div>
      </div>
    </header>
  );
}
