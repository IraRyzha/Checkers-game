import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  CheckersGame,
  IBoardSquare,
  IChecker,
  ICheckersGame,
} from "../game.js";

interface Value {
  checkersGame: ICheckersGame;
  activeChecker: IChecker | null;
  handleChecker: (checker: IChecker) => void;
  handleSquare: (fromSquare: IBoardSquare, toSquare: IBoardSquare) => void;
}

const GameContext = createContext<Value | undefined>(undefined);

const checkersGame = new CheckersGame("red-player", "white-player");

export const useChessBoard = () => {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("context error");
  }

  return context;
};

function GameProvider({ children }: { children: ReactNode }) {
  const [activeChecker, setActiveChecker] = useState<IChecker | null>(null);

  const handleChecker = useCallback(
    (checker: IChecker): void => {
      if (checker.type === checkersGame.currentMove.type) {
        checkersGame.activeChecker = checker;
        setActiveChecker(checkersGame.activeChecker);
      }
    },
    [checkersGame]
  );

  const handleSquare = useCallback(
    (fromSquare: IBoardSquare, toSquare: IBoardSquare): void => {
      const dx = Math.abs(toSquare.x - fromSquare.x);
      const dy = Math.abs(toSquare.y - fromSquare.y);

      console.log("handleSquare");

      if (dx === 2 && dy === 2) {
        checkersGame.attack(fromSquare, toSquare);
      } else if (dx === 1 && dy === 1) {
        checkersGame.move(fromSquare, toSquare);
      }

      setActiveChecker(null);
    },
    [checkersGame]
  );
  const contextValue = useMemo(
    () => ({
      checkersGame,
      activeChecker,
      handleChecker,
      handleSquare,
    }),
    [checkersGame, activeChecker, handleChecker, handleSquare]
  );

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}

export default GameProvider;
