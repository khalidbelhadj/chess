const root = document.getElementById("root");

type Piece = {
  id: string;
  type: "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
  row: number;
  col: number;
  color: "black" | "white";
  element: HTMLButtonElement | null;
  firstMove: boolean;
};

type Move =
  | {
      type: "move";
      row: number;
      col: number;
    }
  | {
      type: "take";
      row: number;
      col: number;
      other: Piece;
    };

function createGame() {
  const p: Piece[] = [
    {
      id: "br1",
      type: "rook",
      row: 0,
      col: 0,
      color: "black",
      element: null,
      firstMove: false,
    },
    {
      id: "br2",
      type: "rook",
      row: 0,
      col: 7,
      color: "black",
      element: null,
      firstMove: false,
    },
    {
      id: "wr1",
      type: "rook",
      row: 7,
      col: 0,
      color: "white",
      element: null,
      firstMove: false,
    },
    {
      id: "wr2",
      type: "rook",
      row: 7,
      col: 7,
      color: "white",
      element: null,
      firstMove: false,
    },
    {
      id: "bn1",
      type: "knight",
      row: 0,
      col: 1,
      color: "black",
      element: null,
      firstMove: false,
    },
    {
      id: "bn2",
      type: "knight",
      row: 0,
      col: 6,
      color: "black",
      element: null,
      firstMove: false,
    },
    {
      id: "wn1",
      type: "knight",
      row: 7,
      col: 1,
      color: "white",
      element: null,
      firstMove: false,
    },
    {
      id: "wn2",
      type: "knight",
      row: 7,
      col: 6,
      color: "white",
      element: null,
      firstMove: false,
    },
    {
      id: "bb1",
      type: "bishop",
      row: 0,
      col: 2,
      color: "black",
      element: null,
      firstMove: false,
    },
    {
      id: "bb2",
      type: "bishop",
      row: 0,
      col: 5,
      color: "black",
      element: null,
      firstMove: false,
    },
    {
      id: "wb1",
      type: "bishop",
      row: 7,
      col: 2,
      color: "white",
      element: null,
      firstMove: false,
    },
    {
      id: "wb2",
      type: "bishop",
      row: 7,
      col: 5,
      color: "white",
      element: null,
      firstMove: false,
    },
    {
      id: "bq",
      type: "queen",
      row: 0,
      col: 3,
      color: "black",
      element: null,
      firstMove: false,
    },
    {
      id: "wq",
      type: "queen",
      row: 7,
      col: 3,
      color: "white",
      element: null,
      firstMove: false,
    },
    {
      id: "bk",
      type: "king",
      row: 0,
      col: 4,
      color: "black",
      element: null,
      firstMove: false,
    },
    {
      id: "wk",
      type: "king",
      row: 7,
      col: 4,
      color: "white",
      element: null,
      firstMove: false,
    },
  ];

  for (let i = 0; i < 8; ++i) {
    p.push(
      {
        id: `bp${i}`,
        type: "pawn",
        row: 1,
        col: i,
        color: "black",
        element: null,
        firstMove: true,
      },
      {
        id: `wp${i}`,
        type: "pawn",
        row: 6,
        col: i,
        color: "white",
        element: null,
        firstMove: true,
      },
    );
  }

  return p;
}

const board: HTMLDivElement[] = [];
let pieces = (JSON.parse(localStorage.getItem("pieces") ?? "null") ??
  createGame()) as Piece[];
let takes = (JSON.parse(localStorage.getItem("takes") ?? "null") ??
  []) as string[];
let turn = JSON.parse(localStorage.getItem("turn") ?? "null") ?? "white";

function saveGameState() {
  localStorage.setItem("pieces", JSON.stringify(pieces));
  localStorage.setItem("takes", JSON.stringify(takes));
  localStorage.setItem("turn", JSON.stringify(turn));
}

function resetGameState() {
  localStorage.removeItem("pieces");
  localStorage.removeItem("takes");
  localStorage.removeItem("turn");
  location.reload();
}

function occupied(row: number, col: number) {
  return pieces.some(
    (p) => row == p.row && col == p.col && !takes.includes(p.id),
  );
}

function inBounds(row: number, col: number) {
  return 0 <= row && row <= 7 && 0 <= col && col <= 7;
}

function getPiece(row: number, col: number) {
  return pieces.find(
    (p) => row == p.row && col == p.col && !takes.includes(p.id),
  );
}

function bruh(
  piece: Piece,
  limit: number,
  updateFn: (row: number, col: number) => [number, number],
) {
  const moves: Move[] = [];
  let [row, col] = [piece.row, piece.col];
  for (let i = 1; i <= limit; ++i) {
    [row, col] = updateFn(row, col);
    if (inBounds(row, col) && !occupied(row, col)) {
      moves.push({ type: "move", row: row, col: col });
    } else {
      let other = getPiece(row, col);
      if (
        piece.type !== "pawn" &&
        inBounds(row, col) &&
        other!.color != piece.color
      )
        moves.push({ type: "take", row: row, col: col, other: other! });
      break;
    }
  }

  if (piece.type === "pawn") {
    [row, col] = updateFn(piece.row, piece.col);
    col += 1;
    let other1 = getPiece(row, col);
    if (
      inBounds(row, col) &&
      occupied(row, col) &&
      other1!.color != piece.color
    )
      moves.push({ type: "take", row: row, col: col, other: other1! });

    col -= 2;
    let other2 = getPiece(row, col);
    if (
      inBounds(row, col) &&
      occupied(row, col) &&
      other2!.color != piece.color
    )
      moves.push({ type: "take", row: row, col: col, other: other2! });
  }

  return moves;
}

function getPossibleMoves(piece: Piece) {
  if (!piece || piece.color != turn) return [];

  let moves: Move[] = [];

  switch (piece.type) {
    case "pawn":
      const dir = 2 * +(piece.color == "black") - 1;

      moves.push(
        ...bruh(piece, piece.firstMove ? 2 : 1, (r, c) => [r + 1 * dir, c]),
      );
      break;
    case "rook":
      moves.push(...bruh(piece, 7, (r, c) => [r - 1, c]));
      moves.push(...bruh(piece, 7, (r, c) => [r + 1, c]));
      moves.push(...bruh(piece, 7, (r, c) => [r, c - 1]));
      moves.push(...bruh(piece, 7, (r, c) => [r, c + 1]));
      break;
    case "knight":
      moves.push(...bruh(piece, 1, (r, c) => [r - 2, c + 1]));
      moves.push(...bruh(piece, 1, (r, c) => [r - 2, c - 1]));
      moves.push(...bruh(piece, 1, (r, c) => [r + 2, c + 1]));
      moves.push(...bruh(piece, 1, (r, c) => [r + 2, c - 1]));
      moves.push(...bruh(piece, 1, (r, c) => [r - 1, c + 2]));
      moves.push(...bruh(piece, 1, (r, c) => [r - 1, c - 2]));
      moves.push(...bruh(piece, 1, (r, c) => [r + 1, c + 2]));
      moves.push(...bruh(piece, 1, (r, c) => [r + 1, c - 2]));
      break;
    case "bishop":
      moves.push(...bruh(piece, 7, (r, c) => [r - 1, c - 1]));
      moves.push(...bruh(piece, 7, (r, c) => [r - 1, c + 1]));
      moves.push(...bruh(piece, 7, (r, c) => [r + 1, c + 1]));
      moves.push(...bruh(piece, 7, (r, c) => [r + 1, c - 1]));
      break;
    case "queen":
      moves.push(...bruh(piece, 7, (r, c) => [r - 1, c]));
      moves.push(...bruh(piece, 7, (r, c) => [r + 1, c]));
      moves.push(...bruh(piece, 7, (r, c) => [r, c - 1]));
      moves.push(...bruh(piece, 7, (r, c) => [r, c + 1]));
      moves.push(...bruh(piece, 7, (r, c) => [r - 1, c - 1]));
      moves.push(...bruh(piece, 7, (r, c) => [r - 1, c + 1]));
      moves.push(...bruh(piece, 7, (r, c) => [r + 1, c + 1]));
      moves.push(...bruh(piece, 7, (r, c) => [r + 1, c - 1]));
      break;
    case "king":
      moves.push(...bruh(piece, 1, (r, c) => [r - 1, c]));
      moves.push(...bruh(piece, 1, (r, c) => [r + 1, c]));
      moves.push(...bruh(piece, 1, (r, c) => [r, c - 1]));
      moves.push(...bruh(piece, 1, (r, c) => [r, c + 1]));
      moves.push(...bruh(piece, 1, (r, c) => [r - 1, c - 1]));
      moves.push(...bruh(piece, 1, (r, c) => [r - 1, c + 1]));
      moves.push(...bruh(piece, 1, (r, c) => [r + 1, c + 1]));
      moves.push(...bruh(piece, 1, (r, c) => [r + 1, c - 1]));
      break;
  }
  return moves;
}
function handlePieceClick(piece: Piece) {
  if (piece.color !== turn) return;
  clearPossibleMoves();
  drawPossibleMoves(piece, getPossibleMoves(piece));
}

function handleMoveOrTake(piece: Piece, move: Move) {
  clearPossibleMoves();
  clearPieces();
  clearTakes();

  piece.row = move.row;
  piece.col = move.col;
  if (move.type == "take") {
    takes.push(move.other.id);
  }
  turn = turn == "white" ? "black" : "white";
  if (piece.type == "pawn") piece.firstMove = false;

  saveGameState();
  drawPieces();
  drawTakes();
}

function drawPossibleMoves(piece: Piece, moves: Move[]) {
  board[piece.row * 8 + piece.col]!.classList.add("selected-cell");
  for (const move of moves) {
    if (move.type == "move") {
      const cell = board[move.row * 8 + move.col]!;
      cell.classList.add("possible-move");

      const highlight = document.createElement("div");
      highlight.className = "move";

      const target = document.createElement("button");
      target.onclick = () => handleMoveOrTake(piece, move);
      target.appendChild(highlight);
      target.className = "target";

      cell.appendChild(target);
    } else if (move.type == "take") {
      const cell = board[move.row * 8 + move.col]!;
      cell.classList.add("possible-move");

      const highlight = document.createElement("div");
      highlight.className = "take";

      const target = document.createElement("button");
      target.onclick = () => handleMoveOrTake(piece, move);
      target.appendChild(highlight);
      target.className = "target";

      cell.appendChild(target);
    }
  }
}

function clearPossibleMoves() {
  for (const cell of board) {
    if (cell.classList.contains("possible-move")) {
      for (const c of cell.children) {
        if (c.classList.contains("target")) {
          cell.removeChild(c);
        }
      }
    }
    cell.classList.remove("possible-move");
    cell.classList.remove("selected-cell");
  }
}

function drawPieces() {
  for (const piece of pieces) {
    if (!takes.includes(piece.id)) {
      board[piece.row * 8 + piece.col]!.appendChild(piece.element!);
    }
  }
}

function clearPieces() {
  for (const piece of pieces) {
    if (!takes.includes(piece.id))
      board[piece.row * 8 + piece.col]!.removeChild(
        board[piece.row * 8 + piece.col]!.children[0] as Node,
      );
  }
}

function drawBoard() {
  if (!root) return;

  for (let i = 0; i < 8; ++i) {
    for (let j = 0; j < 8; ++j) {
      let color = "black";
      if (i % 2 == j % 2) {
        color = "white";
      }
      const cell = document.createElement("div");
      cell.className = `cell ${color}-cell`;
      root.appendChild(cell);
      board.push(cell);
    }
  }
}

function drawTakes() {
  const t = {
    white: document.getElementById("black-takes")!,
    black: document.getElementById("white-takes")!,
  };

  for (const id of takes) {
    const piece = pieces.find((p) => p.id == id)!;
    const takeElement = document.createElement("div");

    if (piece.type === "knight")
      takeElement.style.backgroundImage = `url('./images/${piece.color.charAt(0)}N.svg')`;
    else
      takeElement.style.backgroundImage = `url('./images/${piece.color.charAt(0)}${piece.type.charAt(0).toUpperCase()}.svg')`;

    takeElement.className = "take-icon";

    t[piece.color].appendChild(takeElement);
  }
}

function clearTakes() {
  const white = document.getElementById("black-takes")!;
  const black = document.getElementById("white-takes")!;
  while (white.firstChild) white.removeChild(white.lastChild!);
  while (black.firstChild) black.removeChild(black.lastChild!);
}

function main() {
  drawBoard();

  const resetButton = document.getElementById("reset");
  if (resetButton)
    resetButton.onclick = () => {
      confirm("Are you sure you want to reset the current game?") &&
        resetGameState();
    };

  for (const piece of pieces) {
    piece.element = document.createElement("button");
    piece.element.className = "piece";
    if (piece.type === "knight")
      piece.element.style.backgroundImage = `url('./images/${piece.color.charAt(0)}N.svg')`;
    else
      piece.element.style.backgroundImage = `url('./images/${piece.color.charAt(0)}${piece.type.charAt(0).toUpperCase()}.svg')`;
    piece.element.onclick = () => handlePieceClick(piece);
  }

  drawPieces();
  drawTakes();
}
main();

// TODO: Row and col numbers/letters
// TODO: Castling
// TODO: Check and check mate
// TODO: Pawn promotion
// TODO: Moves list panel like chess.com
