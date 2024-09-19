import { useState } from "react";
import { useChessBoard } from "../../context/game-provider.js";
import Layout from "../common/layout.js";
import { BoardSquare } from "./board-square/board-square.js";
import styles from "./styles.module.css";

function Game() {
  const [isGameStart, setIsGameStart] = useState(true);
  const { checkersGame } = useChessBoard();

  return (
    <Layout>
      <h3>{`${checkersGame.redPlayer.name} ${
        checkersGame.currentMove.name === checkersGame.redPlayer.name
          ? "makes a move"
          : ""
      }`}</h3>
      <div className={styles.boardStyle}>
        {isGameStart ? (
          checkersGame.board.squares.map((square, index) => (
            <BoardSquare key={index} square={square} />
          ))
        ) : (
          <button
            className={styles.startGameButton}
            onClick={() => setIsGameStart(true)}
          >
            Start
          </button>
        )}
      </div>
      <h3>
        {`${checkersGame.whitePlayer.name} ${
          checkersGame.currentMove.name === checkersGame.whitePlayer.name
            ? "makes a move"
            : ""
        }`}
      </h3>
    </Layout>
  );
}

export default Game;
