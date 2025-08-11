import { getDictionary } from "./dictionaries";

interface TestPageProps {
  params: {
    lang: string;
  };
}

export default async function TestPage({ params }: TestPageProps) {
  const dictionary = await getDictionary(params.lang as 'en' | 'fr');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          {dictionary.welcome} to Best Branded Residences
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-secondary p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Language Support</h2>
            <p className="text-muted-foreground">
              This page demonstrates the internationalization features.
              You can switch between English and French using the language dropdown in the navigation.
            </p>
          </div>

          <div className="bg-secondary p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Current Language</h2>
            <p className="text-muted-foreground">
              Current language: <strong>{params.lang.toUpperCase()}</strong>
            </p>
            <p className="text-muted-foreground mt-2">
              Translation example: <strong>{dictionary.logout}</strong>
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-primary/10 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Hero Section Translation</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Title:</h3>
              <p className="text-muted-foreground">{dictionary.hero.title}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium">Subtitle:</h3>
              <p className="text-muted-foreground">{dictionary.hero.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-primary/10 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Stats Section Translation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{dictionary.stats.propertiesRanked}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{dictionary.stats.rankingCategories}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{dictionary.stats.luxuryBrands}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{dictionary.stats.starRatings}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-primary/10 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">How to Use</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Use the language dropdown in the top navigation to switch languages</li>
            <li>• The URL will update to reflect the selected language (e.g., /en/, /fr/)</li>
            <li>• All translations are loaded dynamically based on the selected language</li>
            <li>• The system falls back to English if a translation is missing</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 