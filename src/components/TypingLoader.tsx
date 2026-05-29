export default function TypingLoader() {
  return (
    <div className="flex justify-start">
      <div className="flex w-fit items-center gap-1.5 rounded-3xl px-4 py-3 text-[#ececec]">
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#b4b4b4]"></span>
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#b4b4b4] [animation-delay:120ms]"></span>
        <span className="h-2 w-2 animate-bounce rounded-full bg-[#b4b4b4] [animation-delay:240ms]"></span>
      </div>
    </div>
  );
}
