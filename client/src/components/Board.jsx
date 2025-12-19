import React from 'react';
import { SNAKES, LADDERS } from '../utils/constants';

const Board = ({ players }) => {
    // Generate 100 cells, but we need to render them in a snake pattern (10x10)
    // Rows: 10 (100-91), 9 (81-90), 8 (80-71)...
    const rows = [];
    for (let r = 9; r >= 0; r--) {
        let rowCells = [];
        for (let c = 0; c < 10; c++) {
            let num;
            if (r % 2 === 0) {
                // Even row: left to right (e.g., 0 is 1-10) -> wait, math
                // Row 0 (bottom): 1-10. Row 1: 20-11. 
                // Let's stick to standard math:
                // Row 0: 1 + c
                // Row 1: 20 - c
                num = (r * 10) + c + 1;
            } else {
                // Odd row (from bottom 0-index): right to left?
                // Actually, usually bottom row (0) is 1-10 (L->R), row 1 is 20-11 (R->L), etc.
                // My loop r goes 9 down to 0 (top to bottom visually).
                // r=9 (top row): 91-100? or 100-91?
                // Standard: Bottom (row 0) is 1-10.
                // So if r=9 (top), it's 100-91 (R->L) if row index 9 is odd? 9 is odd.
                // Let's standardise:
                // Row 0 (bottom): 1-10 (L-R)
                // Row 1: 20-11 (R-L)
                // ...
                // Row 9: 100-91 (R-L)

                // Wait, row 9 is 91-100 (L-R) if row 0 is L-R?
                // 0: L-R, 1: R-L, 2: L-R ... 9: R-L.

                // Let's just calculate based on visual row from top.
                // visualRow 0 (r=9) -> 91-100?

                // Let's map r to "real row index from bottom". 
                // realRow = r. 
                // if realRow % 2 === 0 (0, 2, ...): L-R. 1, 2...10
                // if realRow % 2 !== 0 (1, 3, ...): R-L. 20, 19... 11
            }

            // Let's redo logic clearly.
            // We render div rows from top. r = 9 down to 0.
            // In row r:
            // If r is even (0, 2...): values are (r*10 + 1) to (r*10 + 10). L->R.
            // If r is odd (1, 3...): values are (r*10 + 10) down to (r*10 + 1). R->L.
            // Actually, CSS grid can just layout 100 divs. We just need to order them correctly in DOM or use flex-wrap with row-reverse?
            // Easiest: Grid 10x10. We populate array of 100 numbers in Correct Order for Visual (Top-Left to Bottom-Right).
            // Visual Top-Left is 100. Top-Right is 91. (If snaking).
            // Or Top-Left 91, Top-Right 100?
            // Usually 100 is Top-Left. 
            // 100 99 ... 91
            // 81 82 ... 90
            // ...
            // 1 2 ... 10

            // So:
            // Row 9 (Top): 100 -> 91
            // Row 8: 81 -> 90
            // ...
        }
    }

    // Linear generation of 100 cells for CSS Grid
    const cells = [];
    for (let row = 9; row >= 0; row--) {
        if (row % 2 !== 0) { // Odd row index (1, 3... 9): 9 is odd? Wait.
            // If Row 0 (bottom) is linear (1-10), then Row 9 (top) is reverse (100-91) IF 9 is odd from bottom?
            // 0: L->R
            // 1: R->L
            // ...
            // 9: R->L (since 9 is odd)
            // So Row 9 contains 100, 99, ..., 91.
            for (let i = 10; i >= 1; i--) {
                cells.push((row * 10) + i);
            }
        } else {
            // Even row index (0, 2...): 81-90
            for (let i = 1; i <= 10; i++) {
                cells.push((row * 10) + i);
            }
        }
    }

    // Wait, my logic above:
    // row=9 (top). 9 is odd. Order: (90+10=100) down to 91. Correct.
    // row=8. 8 is even. Order: (80+1=81) to 90. Correct.
    // ...
    // row=0 (bottom). 0 is even. Order: 1 to 10. Correct.

    // So cells array has numbers in visual reading order (Top-Left to Bottom-Right) for a grid.

    // Helper to find player in a cell
    const getPlayersInCell = (num) => players.filter(p => p.position === num);

    return (
        <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-white border-2 border-slate-800 grid grid-cols-10 grid-rows-10">
            {cells.map((num) => {
                const isSnakeHead = SNAKES[num];
                const isLadderBase = LADDERS[num];
                const playersHere = getPlayersInCell(num);

                return (
                    <div key={num} className={`relative border border-slate-200 flex items-center justify-center text-[10px] md:text-sm font-bold
            ${isSnakeHead ? 'bg-red-100' : ''}
            ${isLadderBase ? 'bg-green-100' : ''}
          `}>
                        <span className="opacity-30">{num}</span>

                        {/* Markers for Snakes/Ladders */}
                        {isSnakeHead && <span className="absolute text-red-500 text-xs">🐍{SNAKES[num]}</span>}
                        {isLadderBase && <span className="absolute text-green-600 text-xs">🪜{LADDERS[num]}</span>}

                        {/* Players */}
                        <div className="absolute inset-0 flex items-center justify-center gap-1 flex-wrap p-0.5">
                            {playersHere.map(p => (
                                <div key={p.id}
                                    className="w-3 h-3 md:w-5 md:h-5 rounded-full border border-white shadow-sm"
                                    style={{ backgroundColor: p.color }}
                                    title={p.name}
                                ></div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Board;
