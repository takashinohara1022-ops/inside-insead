import Image from "next/image";

type PageHeroProps = {
  src: string;
  alt: string;
  title: string;
};

export function PageHero({ src, alt, title }: PageHeroProps) {
  return (
    <section className="relative w-full" aria-label="ヒーロー">
      <div className="relative h-[38svh] min-h-[14rem] w-full overflow-hidden sm:h-[44vh] sm:min-h-[18rem] lg:h-[50vh] lg:max-h-[28rem]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover object-[58%_center] md:object-center"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0 bg-black/40"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <h1 className="text-center text-2xl font-semibold tracking-tight text-white drop-shadow-md sm:text-3xl lg:text-4xl">
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}
