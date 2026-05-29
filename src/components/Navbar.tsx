export default function Navbar() {

  return (

    <div className="w-full border-b border-[#2a2a2a] bg-black/20 backdrop-blur-xl px-4 py-4 flex items-center justify-between">

      <div className="flex items-center gap-3">

        <img
          src="/ChatGPT Image May 27, 2026, 02_07_57 PM.png"

          alt="logo"

          className="w-10 h-10 rounded-2xl"
        />

        <div>

          <h1 className="text-lg font-bold">
            Master.ai
          </h1>

          <p className="text-xs text-gray-400">
            AI Assistant
          </p>

        </div>
      </div>

      <button className="bg-white text-black px-4 py-2 rounded-2xl font-medium">

        Pro

      </button>
    </div>
  );
}