export default function Sidebar() {

  return (

    <div className="hidden md:flex flex-col w-[280px] border-r border-[#2a2a2a] bg-black/20 backdrop-blur-xl p-4">

      <button className="bg-white text-black rounded-2xl py-3 font-medium">

        + New Chat

      </button>

      <div className="mt-8">

        <p className="text-sm text-gray-500 mb-3">

          Recent Chats

        </p>

        <div className="space-y-2">

          <div className="bg-[#1f1f1f] rounded-2xl p-3 text-sm">

            Welcome to Master.ai

          </div>

        </div>
      </div>
    </div>
  );
}