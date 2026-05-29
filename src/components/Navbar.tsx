type NavbarProps = {
  onNewChat: () => void;
  statusLabel: string;
};

export default function Navbar({ onNewChat, statusLabel }: NavbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-[#212121]/95 px-3 backdrop-blur sm:h-16 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onNewChat}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-xl text-white transition hover:bg-white/10 lg:hidden"
          aria-label="New chat"
        >
          +
        </button>

        <img
          src="/logo.png"
          alt="Master.ai logo"
          className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-lg shadow-black/20"
        />

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold sm:text-lg">Master.ai</h1>
          <p className="truncate text-xs text-[#b4b4b4]">
            Connected to n8n workflow
          </p>
        </div>
      </div>

      <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
        {statusLabel}
      </div>
    </header>
  );
}
