import "./App.css";
import Game from "./components/game/game.js";
import GameProvider from "./context/game-provider.js";

export function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
