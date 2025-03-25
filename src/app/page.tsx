import GameContainer from './components/game/GameContainer';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900">
      <h1 className="text-4xl font-bold text-white mb-8">Block Breaker</h1>
      <GameContainer />
    </main>
  );
}
