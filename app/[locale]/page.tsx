import { useTranslations } from 'next-intl';
import { SearchForm } from '@/components/search/SearchForm';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function HomePage() {
  const t = useTranslations('search');

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="absolute top-0 w-full z-10 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-white">BusConnect</div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="container mx-auto px-4 relative z-10 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold">{t('title')}</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          <SearchForm />
        </div>
      </section>

      {/* Popular Routes (Placeholder) */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Placeholder Cards */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 h-48 flex items-center justify-center text-gray-400">
                Route {i}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
