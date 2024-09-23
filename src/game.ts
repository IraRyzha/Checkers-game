export enum CheckerType {
  Red = "red",
  White = "white",
}

enum BoardSquareType {
  White = "white",
  Green = "green",
}

export interface IChecker {
  type: CheckerType;
  isKing: boolean;
  becomeKing(): void;
}

class Checker implements IChecker {
  public type: CheckerType;
  public isKing: boolean;
  constructor(type: CheckerType) {
    this.type = type;
    this.isKing = false;
  }

  public becomeKing() {
    this.isKing = true;
  }
}

export interface IBoardSquare {
  x: number;
  y: number;
  type: BoardSquareType;
  checker?: IChecker | null;
  index?: number;
  addChecker(checker: IChecker): void;
  clearSquare(): void;
}

class BoardSquare implements IBoardSquare {
  constructor(
    public type: BoardSquareType,
    public x: number,
    public y: number,
    public index?: number,
    public checker?: IChecker | null
  ) {
    this.type = type;
    this.x = x;
    this.y = y;
    if (type === BoardSquareType.Green) {
      this.index = index;
    }
    this.checker = checker;
  }
  addChecker(checker: IChecker) {
    this.checker = checker;
  }
  clearSquare() {
    this.checker = null;
  }
}

export interface IGameBoard {
  squares: BoardSquare[];
}

class GameBoard {
  public squares: BoardSquare[] = [];

  constructor() {
    this.initBoard();
  }

  initBoard() {
    let indexCounter = 1;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const isGreenSquare = (x + y) % 2 !== 0;
        const type = isGreenSquare
          ? BoardSquareType.Green
          : BoardSquareType.White;

        let checker: Checker | undefined = undefined;

        if (isGreenSquare) {
          if (y < 3) {
            checker = new Checker(CheckerType.Red);
          } else if (y > 4) {
            checker = new Checker(CheckerType.White);
          }

          this.squares.push(new BoardSquare(type, x, y, indexCounter, checker));
          indexCounter++;
        } else {
          this.squares.push(new BoardSquare(type, x, y));
        }
      }
    }
  }
}

export interface IPlayer {
  type: CheckerType;
  name: string;
}

class Player implements IPlayer {
  public type: CheckerType;
  public name: string;
  constructor(type: CheckerType, name: string) {
    this.type = type;
    this.name = name;
  }
}

export interface ICheckersGame {
  board: IGameBoard;
  redPlayer: IPlayer;
  whitePlayer: IPlayer;
  winner: CheckerType | null;
  currentMove: IPlayer;
  activeChecker: IChecker | null;
  baseMove(fromSquare: IBoardSquare, toSquare: IBoardSquare): void;
  move(fromSquare: IBoardSquare, toSquare: IBoardSquare): void;
  attack(fromSquare: IBoardSquare, toSquare: IBoardSquare): void;
  straightDoubleAttack(fromSquare: IBoardSquare, toSquare: IBoardSquare): void;
  curvedDoubleAttack(fromSquare: IBoardSquare, toSquare: IBoardSquare): void;
  isHasWinner(): void;
  checkForWinnerIfNoMoves(): void;
  checkIsKing(toSquare: IBoardSquare): boolean;
  switchTurn(): void;
}

export class CheckersGame implements ICheckersGame {
  public board: IGameBoard;
  public redPlayer: IPlayer;
  public whitePlayer: IPlayer;
  public winner: CheckerType | null;
  public currentMove: IPlayer;
  public activeChecker: IChecker | null;

  constructor(redPlayerName: string, whitePlayerName: string) {
    this.redPlayer = new Player(CheckerType.Red, redPlayerName);
    this.whitePlayer = new Player(CheckerType.White, whitePlayerName);
    this.winner = null;
    this.board = new GameBoard();
    this.currentMove = this.redPlayer;
    this.activeChecker = null;
  }

  checkIsKing(toSquare: IBoardSquare): boolean {
    if (this.activeChecker?.type === CheckerType.Red && toSquare.y === 7) {
      return true;
    }

    if (this.activeChecker?.type === CheckerType.White && toSquare.y === 0) {
      return true;
    }

    return false;
  }

  move(fromSquare: IBoardSquare, toSquare: IBoardSquare) {
    if (this.winner) {
      return;
    }

    const dx = Math.abs(toSquare.x - fromSquare.x);
    const dy = Math.abs(toSquare.y - fromSquare.y);

    if (this.checkIsKing(toSquare)) {
      this.activeChecker?.becomeKing();
    }

    if (dx === 4 && dy === 4) {
      this.straightDoubleAttack(fromSquare, toSquare);
    } else if ((dx === 0 && dy === 4) || (dx === 4 && dy === 0)) {
      this.curvedDoubleAttack(fromSquare, toSquare);
    } else if (dx === 2 && dy === 2) {
      this.attack(fromSquare, toSquare);
    } else if (dx === 1 && dy === 1) {
      this.baseMove(fromSquare, toSquare);
    }

    this.checkForWinnerIfNoMoves();
    this.winner = this.isHasWinner();
  }

  baseMove(fromSquare: IBoardSquare, toSquare: IBoardSquare): void {
    if (this.isValidMove(fromSquare, toSquare)) {
      fromSquare.clearSquare();
      toSquare.addChecker(this.activeChecker!);

      this.switchTurn();

      this.activeChecker = null;
    } else {
      console.log("Invalid move: Must be one square diagonally");
    }
  }

  private isValidMove(
    fromSquare: IBoardSquare,
    toSquare: IBoardSquare
  ): boolean {
    if (
      this.activeChecker?.type === CheckerType.Red &&
      toSquare.y <= fromSquare.y &&
      !this.activeChecker?.isKing
    ) {
      console.log("Checkers cannot move backward");
      return false;
    }

    if (
      this.activeChecker?.type === CheckerType.White &&
      toSquare.y >= fromSquare.y &&
      !this.activeChecker?.isKing
    ) {
      console.log("Checkers cannot move backward");
      return false;
    }

    return true;
  }

  attack(fromSquare: IBoardSquare, toSquare: IBoardSquare): void {
    if (this.isValidAttack(fromSquare, toSquare)) {
      const midX = (fromSquare.x + toSquare.x) / 2;
      const midY = (fromSquare.y + toSquare.y) / 2;

      const middleSquare = this.board.squares.find(
        (square) => square.x === midX && square.y === midY
      );

      middleSquare?.clearSquare();
      toSquare.addChecker(this.activeChecker!);
      fromSquare.clearSquare();

      this.switchTurn();

      this.activeChecker = null;
    } else {
      console.log(
        "Invalid attack: Ensure middle square has opponent's checker and destination is empty"
      );
    }
  }

  private isValidAttack(
    fromSquare: IBoardSquare,
    toSquare: IBoardSquare
  ): boolean {
    if (
      this.activeChecker?.type === CheckerType.Red &&
      toSquare.y <= fromSquare.y &&
      !this.activeChecker?.isKing
    ) {
      console.log("Checkers cannot attack backward");
      return false;
    }

    if (
      this.activeChecker?.type === CheckerType.White &&
      toSquare.y >= fromSquare.y &&
      !this.activeChecker?.isKing
    ) {
      console.log("Checkers cannot attack backward");
      return false;
    }

    const midX = (fromSquare.x + toSquare.x) / 2;
    const midY = (fromSquare.y + toSquare.y) / 2;

    const middleSquare = this.board.squares.find(
      (square) => square.x === midX && square.y === midY
    );

    if (
      middleSquare &&
      middleSquare.checker &&
      middleSquare.checker.type !== this.activeChecker?.type &&
      !toSquare.checker
    ) {
      return true;
    }

    return false;
  }

  straightDoubleAttack(fromSquare: IBoardSquare, toSquare: IBoardSquare): void {
    if (this.isValidStraightDoubleAttack(fromSquare, toSquare)) {
      const mid1X =
        fromSquare.x +
        (toSquare.x - fromSquare.x) / 2 -
        (toSquare.x > fromSquare.x ? 1 : -1);
      const mid1Y =
        fromSquare.y +
        (toSquare.y - fromSquare.y) / 2 -
        (toSquare.y > fromSquare.y ? 1 : -1);

      const mid2X = fromSquare.x + ((toSquare.x - fromSquare.x) * 3) / 4;
      const mid2Y = fromSquare.y + ((toSquare.y - fromSquare.y) * 3) / 4;

      const middleSquare1 = this.board.squares.find(
        (square) => square.x === mid1X && square.y === mid1Y
      );

      const middleSquare2 = this.board.squares.find(
        (square) => square.x === mid2X && square.y === mid2Y
      );

      middleSquare1?.clearSquare();
      middleSquare2?.clearSquare();

      toSquare.addChecker(this.activeChecker!);
      fromSquare.clearSquare();

      this.switchTurn();
      this.activeChecker = null;
    } else {
      console.log(
        "Недійсна подвійна атака: перевірте, що обидва проміжні квадрати містять шашки суперника"
      );
    }
  }

  private isValidStraightDoubleAttack(
    fromSquare: IBoardSquare,
    toSquare: IBoardSquare
  ): boolean {
    if (
      this.activeChecker?.type === CheckerType.Red &&
      toSquare.y <= fromSquare.y &&
      !this.activeChecker?.isKing
    ) {
      console.log("Червоні шашки не можуть атакувати назад");
      return false;
    }

    if (
      this.activeChecker?.type === CheckerType.White &&
      toSquare.y >= fromSquare.y &&
      !this.activeChecker?.isKing
    ) {
      console.log("Білі шашки не можуть атакувати назад");
      return false;
    }

    const mid1X =
      fromSquare.x +
      (toSquare.x - fromSquare.x) / 2 -
      (toSquare.x > fromSquare.x ? 1 : -1);
    const mid1Y =
      fromSquare.y +
      (toSquare.y - fromSquare.y) / 2 -
      (toSquare.y > fromSquare.y ? 1 : -1);

    const mid2X = fromSquare.x + ((toSquare.x - fromSquare.x) * 3) / 4;
    const mid2Y = fromSquare.y + ((toSquare.y - fromSquare.y) * 3) / 4;

    const middleSquare1 = this.board.squares.find(
      (square) => square.x === mid1X && square.y === mid1Y
    );

    const middleSquare2 = this.board.squares.find(
      (square) => square.x === mid2X && square.y === mid2Y
    );

    if (toSquare.checker) {
      console.log("Кінцевий квадрат зайнятий");
      return false;
    }

    if (
      middleSquare1 &&
      middleSquare1.checker &&
      middleSquare1.checker.type !== this.activeChecker?.type &&
      middleSquare2 &&
      middleSquare2.checker &&
      middleSquare2.checker.type !== this.activeChecker?.type
    ) {
      const emptySquareBetween = this.board.squares.find(
        (square) =>
          square.x === (mid1X + mid2X) / 2 && square.y === (mid1Y + mid2Y) / 2
      );

      console.log("emptySquareBetween: " + emptySquareBetween);

      if (emptySquareBetween?.checker === null) {
        return true;
      }
    }

    console.log(
      "Недійсна подвійна атака: перевірте, що обидва проміжні квадрати містять шашки суперника"
    );
    return false;
  }

  curvedDoubleAttack(fromSquare: IBoardSquare, toSquare: IBoardSquare): void {
    if (this.isValidCurvedDoubleAttack(fromSquare, toSquare)) {
      const dx = toSquare.x - fromSquare.x;
      const dy = toSquare.y - fromSquare.y;

      const mid1X = fromSquare.x + Math.sign(dx) * 1;
      const mid1Y =
        fromSquare.y === toSquare.y
          ? this.activeChecker?.type! === CheckerType.Red
            ? fromSquare.y + 1
            : fromSquare.y - 1
          : +Math.sign(dy) * 1;

      const mid2X = fromSquare.x + Math.sign(dx) * 3;
      const mid2Y =
        fromSquare.y === toSquare.y ? mid1Y : fromSquare.y + Math.sign(dy) * 1;

      const middleSquare1 = this.board.squares.find(
        (square) => square.x === mid1X && square.y === mid1Y
      );

      const middleSquare2 = this.board.squares.find(
        (square) => square.x === mid2X && square.y === mid2Y
      );

      middleSquare1?.clearSquare();
      middleSquare2?.clearSquare();

      toSquare.addChecker(this.activeChecker!);
      fromSquare.clearSquare();

      this.switchTurn();
      this.activeChecker = null;
    } else {
      console.log("Недійсна крива подвійна атака");
    }
  }

  private isValidCurvedDoubleAttack(
    fromSquare: IBoardSquare,
    toSquare: IBoardSquare
  ): boolean {
    const dx = toSquare.x - fromSquare.x;
    const dy = toSquare.y - fromSquare.y;

    const mid1X = fromSquare.x + Math.sign(dx) * 1;
    const mid1Y =
      fromSquare.y === toSquare.y
        ? this.activeChecker?.type! === CheckerType.Red
          ? fromSquare.y + 1
          : fromSquare.y - 1
        : +Math.sign(dy) * 1;

    const mid2X = fromSquare.x + Math.sign(dx) * 3;
    const mid2Y =
      fromSquare.y === toSquare.y ? mid1Y : fromSquare.y + Math.sign(dy) * 1;

    const middleSquare1 = this.board.squares.find(
      (square) => square.x === mid1X && square.y === mid1Y
    );

    const middleSquare2 = this.board.squares.find(
      (square) => square.x === mid2X && square.y === mid2Y
    );

    if (
      middleSquare1 &&
      middleSquare1.checker &&
      middleSquare1.checker.type !== this.activeChecker?.type &&
      middleSquare2 &&
      middleSquare2.checker &&
      middleSquare2.checker.type !== this.activeChecker?.type &&
      !toSquare.checker
    ) {
      return true;
    }

    console.log("Недійсна крива подвійна атака");
    return false;
  }

  isHasWinner(): CheckerType | null {
    const redCheckers = this.board.squares.filter(
      (square) => square.checker?.type === CheckerType.Red
    );
    const whiteCheckers = this.board.squares.filter(
      (square) => square.checker?.type === CheckerType.White
    );

    if (redCheckers.length === 0) return CheckerType.White;
    if (whiteCheckers.length === 0) return CheckerType.Red;

    return null;
  }

  checkForWinnerIfNoMoves(): void {
    const currentPlayerCheckers =
      this.currentMove.type === CheckerType.Red
        ? this.board.squares.filter(
            (square) => square.checker?.type === CheckerType.Red
          )
        : this.board.squares.filter(
            (square) => square.checker?.type === CheckerType.White
          );

    const hasValidMove = currentPlayerCheckers.some((square) =>
      this.board.squares.some(
        (targetSquare) =>
          this.isValidMove(square, targetSquare) ||
          this.isValidAttack(square, targetSquare)
      )
    );

    if (!hasValidMove) {
      this.winner =
        this.currentMove.type === CheckerType.Red
          ? CheckerType.White
          : CheckerType.Red;
    }
  }

  switchTurn(): void {
    this.currentMove =
      this.currentMove === this.redPlayer ? this.whitePlayer : this.redPlayer;
  }
}
