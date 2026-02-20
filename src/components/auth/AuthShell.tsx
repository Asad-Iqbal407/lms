import Link from "next/link";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-900">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] hover:scale-110"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2000&auto=format&fit=crop')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-indigo-900/70 backdrop-blur-[2px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10">
        <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
          <div className="text-white">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 transition group-hover:bg-white/20 group-hover:scale-110 shadow-xl">
                <span className="text-sm font-bold">UoG</span>
              </div>
              <div>
                <div className="text-base font-bold tracking-tight">UoG LMS</div>
                <div className="text-[10px] font-medium text-white/50 uppercase tracking-widest">University of Gujrat</div>
              </div>
            </Link>

            <h1 className="mt-10 text-4xl font-bold tracking-tight sm:text-5xl drop-shadow-sm">{title}</h1>
            <p className="mt-4 max-w-md text-lg text-white/80 leading-relaxed">{subtitle}</p>

            <div className="mt-10 grid max-w-md gap-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                <div className="h-px flex-1 bg-white/10" />
                Quick Links
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="flex flex-wrap gap-4 text-sm font-semibold">
                <Link href="/register" className="text-white/70 transition hover:text-white hover:underline">
                  Student Registration
                </Link>
                <Link href="/login" className="text-white/70 transition hover:text-white hover:underline">
                  Sign In
                </Link>
                <Link href="/" className="text-white/70 transition hover:text-white hover:underline">
                  Home Page
                </Link>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-1 shadow-2xl shadow-black/50 ring-1 ring-white/20 transition-transform duration-500 hover:scale-[1.01]">
              <div className="rounded-[2.2rem] bg-white p-8 md:p-10">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

