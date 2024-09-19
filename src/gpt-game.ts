function generateUniqueId(): string {
  return "_" + Math.random().toString(36).slice(2, 9);
}

type CheckerType = "red" | "white";

enum BoardSquareType {
  White = "white",
  Green = "green",
}

enum Direction {
  Forward,
  Backward,
}

export interface IChecker {
  id: string;
  type: CheckerType;
  isKing: boolean;
  isActive: boolean;
  x: number;
  y: number;
  move(targetX: number, targetY: number): void;
  becomeKing(): void;
}

class Checker implements IChecker {
  public id: string;
  public type: CheckerType;
  public isKing: boolean = false;
  public isActive: boolean = false;
  public x: number;
  public y: number;

  constructor(type: CheckerType, x: number, y: number) {
    this.id = generateUniqueId();
    this.type = type;
    this.x = x;
    this.y = y;
  }

  move(targetX: number, targetY: number) {
    this.x = targetX;
    this.y = targetY;
  }

  becomeKing() {
    this.isKing = true;
  }
}

export interface IBoardSquare {
  x: number;
  y: number;
  type: BoardSquareType;
  checker: IChecker | null;
}

class BoardSquare implements IBoardSquare {
  public x: number;
  public y: number;
  public type: BoardSquareType;
  public checker: IChecker | null = null;

  constructor(x: number, y: number, type: BoardSquareType) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  addChecker(checker: IChecker) {
    if (!this.checker) {
      this.checker = checker;
    } else {
      throw new Error("This square is already occupied");
    }
  }

  clearChecker() {
    if (this.checker) {
      this.checker = null;
    } else {
      throw new Error("This square is already empty");
    }
  }
}

export interface IPlayer {
  type: CheckerType;
  name: string;
  checkers: IChecker[];
}

class Player implements IPlayer {
  public type: CheckerType;
  public name: string;
  public checkers: IChecker[] = [];

  constructor(type: CheckerType, name: string) {
    this.type = type;
    this.name = name;
  }
}

export interface ICheckersGame {
  board: BoardSquare[][];
  redPlayer: IPlayer;
  whitePlayer: IPlayer;
  currentPlayer: IPlayer;
  initializeBoard(): void;
  moveChecker(checker: IChecker, targetX: number, targetY: number): void;
  isMoveValid(checker: IChecker, targetX: number, targetY: number): boolean;
  switchPlayer(): void;
  checkWinner(): IPlayer | null;
}

class CheckersGame implements ICheckersGame {
  public board: BoardSquare[][] = [];
  public redPlayer: IPlayer;
  public whitePlayer: IPlayer;
  public currentPlayer: IPlayer;

  constructor(redPlayer: IPlayer, whitePlayer: IPlayer) {
    this.redPlayer = redPlayer;
    this.whitePlayer = whitePlayer;
    this.currentPlayer = this.whitePlayer;
    this.initializeBoard();
  }

  initializeBoard() {
    for (let row = 0; row < 8; row++) {
      this.board[row] = [];
      for (let col = 0; col < 8; col++) {
        const type =
          (row + col) % 2 === 0 ? BoardSquareType.White : BoardSquareType.Green;
        this.board[row].push(new BoardSquare(row, col, type));
      }
    }

    // Розміщення шашок для червоного гравця
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col].type === BoardSquareType.Green) {
          const checker = new Checker("red", row, col);
          this.redPlayer.checkers.push(checker);
          this.board[row][col].addChecker(checker);
        }
      }
    }

    // Розміщення шашок для білого гравця
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col].type === BoardSquareType.Green) {
          const checker = new Checker("white", row, col);
          this.whitePlayer.checkers.push(checker);
          this.board[row][col].addChecker(checker);
        }
      }
    }
  }

  moveChecker(checker: IChecker, targetX: number, targetY: number) {
    if (this.isMoveValid(checker, targetX, targetY)) {
      const previousSquare = this.board[checker.x][checker.y];
      previousSquare.clearChecker();

      const targetSquare = this.board[targetX][targetY];
      checker.move(targetX, targetY);
      targetSquare.addChecker(checker);

      if (
        (checker.type === "white" && targetX === 0) ||
        (checker.type === "red" && targetX === 7)
      ) {
        checker.becomeKing();
      }

      this.switchPlayer();
    } else {
      throw new Error("Invalid move");
    }
  }

  isMoveValid(checker: IChecker, targetX: number, targetY: number): boolean {
    const direction: Direction =
      checker.type === "white" ? Direction.Backward : Direction.Forward;

    if (!checker.isKing) {
      if (
        Math.abs(targetX - checker.x) === 1 &&
        targetY - checker.y === direction
      ) {
        return this.board[targetX][targetY].checker === null;
      }

      if (
        Math.abs(targetX - checker.x) === 2 &&
        Math.abs(targetY - checker.y) === 2
      ) {
        const middleX = Math.floor((checker.x + targetX) / 2);
        const middleY = Math.floor((checker.y + targetY) / 2);
        const middleChecker = this.board[middleX][middleY].checker;

        if (middleChecker && middleChecker.type !== checker.type) {
          this.board[middleX][middleY].clearChecker();
          return true;
        }
      }
    }

    return (
      checker.isKing &&
      Math.abs(targetX - checker.x) === Math.abs(targetY - checker.y)
    );
  }

  switchPlayer() {
    this.currentPlayer =
      this.currentPlayer === this.whitePlayer
        ? this.redPlayer
        : this.whitePlayer;
  }

  checkWinner(): IPlayer | null {
    if (
      this.redPlayer.checkers.length === 0 ||
      this.redPlayer.checkers.every((checker) => !this.canMove(checker))
    ) {
      return this.whitePlayer;
    } else if (
      this.whitePlayer.checkers.length === 0 ||
      this.whitePlayer.checkers.every((checker) => !this.canMove(checker))
    ) {
      return this.redPlayer;
    }
    return null;
  }

  private canMove(checker: IChecker): boolean {
    const directions: Direction[] = checker.isKing
      ? [Direction.Forward, Direction.Backward]
      : [Direction.Forward];
    for (const direction of directions) {
      const step = direction === Direction.Forward ? 1 : -1;
      const x = checker.x;
      const y = checker.y;

      for (let dx = -1; dx <= 1; dx += 2) {
        const targetX = x + step;
        const targetY = y + dx;
        const targetSquare = this.board[targetX]?.[targetY];
        if (targetSquare && targetSquare.checker === null) {
          return true;
        }

        const jumpX = x + 2 * step;
        const jumpY = y + 2 * dx;
        const middleX = x + step;
        const middleY = y + dx;
        const middleSquare = this.board[middleX]?.[middleY];
        const jumpSquare = this.board[jumpX]?.[jumpY];

        if (
          middleSquare &&
          middleSquare.checker &&
          middleSquare.checker.type !== checker.type &&
          jumpSquare &&
          jumpSquare.checker === null
        ) {
          return true;
        }
      }
    }
    return false;
  }
}

export { Checker, Player, CheckersGame };
