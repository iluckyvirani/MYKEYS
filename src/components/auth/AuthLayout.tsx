export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c')",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative bg-white rounded-[5px] shadow-2xl w-full max-w-md p-5">
        {children}
      </div>
    </div>
  );
}
