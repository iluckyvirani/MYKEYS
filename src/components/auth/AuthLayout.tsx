export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-10"
      style={{
        background:
          "linear-gradient(160deg, #f3fafa 0%, #ffffff 45%, #f7f8f8 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(51,147,144,0.18), transparent 40%), radial-gradient(circle at 85% 75%, rgba(162,217,214,0.35), transparent 42%)",
        }}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-xl bg-white p-8 border border-[#d8eceb]"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(51, 147, 144, 0.18), 0 12px 24px -8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(51, 147, 144, 0.06)",
        }}
      >
        <div className="flex justify-center mb-6">
          <img
            src="/mykeys-logo-nav.png"
            alt="MYKEYS"
            className="h-12 w-auto object-contain"
          />
        </div>
        {children}
      </div>
    </div>
  );
}
