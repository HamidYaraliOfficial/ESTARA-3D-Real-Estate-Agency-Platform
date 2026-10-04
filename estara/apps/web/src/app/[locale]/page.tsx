import { HeroScene } from "@/components/three/hero-scene";
import { HeroSearch } from "@/components/search/hero-search";
import { PropertyGrid } from "@/components/property/property-grid";
import { getDictionary, isLocale, defaultLocale } from "@/i18n/config";

export default function HomePage({ params }: { params: { locale: string } }) {
  const locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = getDictionary(locale);

  return (
    <div>
      {/* ---- Hero: scroll-driven 3D city ---- */}
      <section id="hero-scroll-track" className="relative h-[220vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div className="absolute inset-0">
            <HeroScene />
          </div>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white drop-shadow-lg sm:text-5xl">
              {dict.hero.title}
            </h1>
            <p className="max-w-xl text-white/80">{dict.hero.subtitle}</p>
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* ---- Discovery flow: Featured Properties ---- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-6 text-2xl font-semibold">{dict.nav.properties}</h2>
        <PropertyGrid />
      </section>
    </div>
  );
}
