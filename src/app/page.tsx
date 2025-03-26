import GameContainer from "./components/game/GameContainer";

export default function Home() {
  return (
    <main className="min-h-[calc(100dvh-env(safe-area-inset-bottom))] flex flex-col items-center justify-center p-8 bg-[#202020]">
      <div className="flex flex-col items-center justify-center scale-[65%] sm:scale-100">
        <h1 className="text-4xl font-bold text-white mb-2">Block Breaker</h1>
        <GameContainer />
      </div>
    </main>
  );
}
