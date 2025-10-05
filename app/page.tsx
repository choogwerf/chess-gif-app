"use client";

import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { Chess } from 'chess.js';
import { useState, useMemo } from 'react';

interface Piece {
  type: string;
  color: string;
}

// Determine square colour based on its coordinates
const squareColour = (x: number, y: number) => {
  return (x + y) % 2 === 0 ? '#f3eacb' : '#8a613e';
};

export default function Page() {
  // Initialise chess game
  const [game, setGame] = useState(() => new Chess());
  const [selected, setSelected] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  // Memoise board representation to avoid unnecessary recalculations
  const board = useMemo(() => game.board() as (Piece | null)[][], [game]);

  // Handle click on any square
  const handleSquareClick = (fileIndex: number, rankIndex: number) => {
    const files = 'abcdefgh';
    const file = files[fileIndex];
    const rank = 8 - rankIndex;
    const square = `${file}${rank}`;

    // If a piece is selected and the clicked square is in the list of legal moves, attempt the move
    if (selected && legalMoves.includes(square)) {
      const newGame = new Chess(game.fen());
      try {
        newGame.move({ from: selected, to: square });
        setGame(newGame);
      } catch (err) {
        console.error(err);
      }
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    // Determine if a piece exists on the clicked square
    const piece = board[rankIndex][fileIndex];
    if (piece) {
      // Fetch legal moves for the clicked square
      const moves = (game.moves({ square, verbose: true }) as any[]).map((m) => m.to);
      setSelected(square);
      setLegalMoves(moves);
    } else {
      // Clicking an empty square resets the selection
      setSelected(null);
      setLegalMoves([]);
    }
  };

  // Determine whether a square should be highlighted (i.e. is a legal move for the selected piece)
  const isHighlighted = (fileIndex: number, rankIndex: number) => {
    const files = 'abcdefgh';
    const file = files[fileIndex];
    const rank = 8 - rankIndex;
    const square = `${file}${rank}`;
    return legalMoves.includes(square);
  };

  // Render a single chess piece at a given board coordinate
  const renderPiece = (piece: Piece, x: number, y: number) => {
    const colourPrefix = piece.color === 'w' ? 'w' : 'b';
    const typeChar = piece.type;
    const filename = `/pieces/${colourPrefix}${typeChar}.gif`;
    const fallbackEmojiMap: Record<string, string> = {
      p: piece.color === 'w' ? '♙' : '♟︎',
      r: piece.color === 'w' ? '♖' : '♜',
      n: piece.color === 'w' ? '♘' : '♞',
      b: piece.color === 'w' ? '♗' : '♝',
      q: piece.color === 'w' ? '♕' : '♛',
      k: piece.color === 'w' ? '♔' : '♚',
    };
    const fallback = fallbackEmojiMap[piece.type];

    return (
      <group key={`${x}-${y}-piece`} position={[x + 0.5, 0.05, y + 0.5]}>
        <Html
          distanceFactor={10}
          transform
          occlude
          onPointerDown={(e) => {
            e.stopPropagation();
            handleSquareClick(x, y);
          }}
        >
          {/*
            Use an <img> element for GIFs. If the GIF is missing this will error,
            in which case we swap it out for a span containing the fallback emoji.
          */}
          <img
            src={filename}
            alt={`${colourPrefix}${typeChar}`}
            width={64}
            height={64}
            onError={(e) => {
              const target = e.currentTarget;
              const span = document.createElement('span');
              span.textContent = fallback;
              span.style.fontSize = '32px';
              span.style.lineHeight = '64px';
              span.style.display = 'inline-block';
              span.style.width = '64px';
              span.style.height = '64px';
              target.replaceWith(span);
            }}
            style={{ pointerEvents: 'none' }}
          />
        </Html>
      </group>
    );
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-[640px] h-[640px]">
        <Canvas shadows camera={{ position: [7, 10, 10], fov: 40 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} />
          {/* Render squares */}
          {board.map((row, rankIndex) =>
            row.map((square, fileIndex) => {
              const colour = squareColour(fileIndex, rankIndex);
              const highlighted = isHighlighted(fileIndex, rankIndex);
              return (
                <mesh
                  key={`${fileIndex}-${rankIndex}`}
                  position={[fileIndex + 0.5, 0, rankIndex + 0.5]}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    handleSquareClick(fileIndex, rankIndex);
                  }}
                >
                  <boxGeometry args={[1, 0.1, 1]} />
                  <meshStandardMaterial color={highlighted ? '#ffe499' : colour} />
                </mesh>
              );
            })
          )}
          {/* Render pieces */}
          {board.flatMap((row, rankIndex) =>
            row.map((square, fileIndex) =>
              square ? renderPiece(square, fileIndex, rankIndex) : null
            )
          )}
          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </main>
  );
}
