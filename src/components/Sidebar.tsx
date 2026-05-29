export default function Sidebar({
  hasMessages,
  onNewChat,
  onClearChat,
}: {
  hasMessages: boolean;
  onNewChat: () => void;
  onClearChat: () => void;
}) {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-white/10 bg-[#171717] p-3 lg:flex">
      <div className="mb-3 flex items-center gap-3 rounded-2xl px-2 py-2">
        <img
          src="/logo.png"
          alt="Master.ai logo"
          className="h-10 w-10 rounded-2xl object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">Master.ai</p>
          <p className="truncate text-xs text-[#8f8f8f]">AI workflow chat</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onNewChat}
        className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-white transition hover:bg-white/10"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 text-lg">
          +
        </span>
        New chat
      </button>

      <button
        type="button"
        onClick={onClearChat}
        className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#b4b4b4] transition hover:bg-white/10 hover:text-white"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 text-xs">
          ✕
        </span>
        Clear saved chat
      </button>

      <div className="mt-5 flex-1 overflow-y-auto">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-[#8f8f8f]">
          Recent
        </p>
        <div className="space-y-1">
          <div className="truncate rounded-xl px-3 py-2 text-sm text-[#ececec] transition hover:bg-white/10">
            {hasMessages ? "Current conversation" : "Welcome to Master.ai"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-[#b4b4b4]">
        Uses production webhook first, then automatically tries the n8n test
        webhook when production is not registered.
      </div>
    </aside>
  );
}
