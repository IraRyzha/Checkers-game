import { useChessBoard } from "../../../context/game-provider.js";
import { IBoardSquare } from "../../../game.js";
import { Checker } from "../checker/checker.js";
import styles from "./styles.module.css";

interface Props {
  square: IBoardSquare;
}

export const BoardSquare = ({ square }: Props) => {
  const { checkersGame, activeChecker, handleSquare } = useChessBoard();

  const fromSquare: IBoardSquare | undefined = checkersGame.board.squares.find(
    (square) => square.checker === activeChecker
  );

  return (
    <div
      className={`${styles.squareStyle} ${
        square.type === "green" ? styles.bgGreen : styles.bgWhite
      }`}
      onClick={() =>
        activeChecker && fromSquare && handleSquare(fromSquare, square)
      }
    >
      {square.index && <span className={styles.index}>{square.index}</span>}
      {square.checker && <Checker checker={square.checker} />}
      <span className={styles.xy}>{`x:${square.x} , y:${square.y}`}</span>
    </div>
  );
};
