export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 bg-white">
      <div
        className="relative z-10 w-full max-w-md rounded-xl bg-white p-8 border border-gray-200"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 12px 24px -8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
