const LOGO_SRC = "/mykeys-logo.png";

const HEIGHT = {
  nav: "h-[52px]",
  sidebar: "h-[52px]",
  footer: "h-16",
  auth: "h-12",
  authCompact: "h-9",
} as const;

export default function BrandLogo({
  variant = "nav",
  className = "",
}: {
  variant?: keyof typeof HEIGHT;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC}
      alt="MYKEYS"
      width={800}
      height={280}
      className={`${HEIGHT[variant]} w-auto object-contain object-center ${className}`}
    />
  );
}
