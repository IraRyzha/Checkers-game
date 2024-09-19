// Checker Component
import { memo } from "react";
import { useChessBoard } from "../../../context/game-provider.js";
import { CheckerType, IChecker } from "../../../game.js";
import styles from "./styles.module.css";

interface Props {
  checker: IChecker;
}

export const Checker = memo(({ checker }: Props) => {
  const { activeChecker, handleChecker } = useChessBoard();

  const handleClick = (checker: IChecker) => {
    handleChecker(checker);
  };

  return (
    <div
      className={`${styles.checkerStyle} ${
        activeChecker === checker && styles.checkerActive
      } ${checker.type === CheckerType.Red ? styles.bgRed : styles.bgWhite}`}
      onClick={() => handleClick(checker)}
    >
      {/* <span className={styles.id}>{checker.id}</span> */}
    </div>
  );
});
