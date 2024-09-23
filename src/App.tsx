import Game from "./components/game/game.js";
import GameProvider from "./context/game-provider.js";

function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}

export default App;
