import GameContainer from "./components/game/GameContainer";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100dvh-env(safe-area-inset-bottom))] flex-col items-center justify-center p-4 bg-gray-900">
      <h1 className="text-4xl font-bold text-white mb-2">Block Breaker</h1>
      <GameContainer />
    </main>
  );
}
