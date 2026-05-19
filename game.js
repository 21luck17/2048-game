const GRID_SIZE = 4;
const CELL_GAP = 15;
const CELL_SIZE = 100;
let grid = [];
let score = 0;
let bestScore = 0;
let hasWon = false;
let hasLost = false;
let tiles = [];
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const gameBoard = document.getElementById('game-board');
const newGameButton = document.getElementById('new-game');
const restartButton = document.getElementById('restart-btn');
const gameOverElement = document.getElementById('game-over');
const gameOverTitle = document.getElementById('game-over-title');
function initGame() {
    bestScore = parseInt(localStorage.getItem('bestScore') || '0');
    bestScoreElement.textContent = bestScore;
    grid = createEmptyGrid();
    tiles = [];
    score = 0;
    scoreElement.textContent = score;
    hasWon = false;
    hasLost = false;
    gameOverElement.classList.add('hidden');
    renderBoard();
    addRandomTile();
    addRandomTile();
}
function createEmptyGrid() {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
}
function renderBoard() {
    gameBoard.innerHTML = '';
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.left = `${j * (CELL_SIZE + CELL_GAP)}px`;
            cell.style.top = `${i * (CELL_SIZE + CELL_GAP)}px`;
            gridContainer.appendChild(cell);
        }
    }
    gameBoard.appendChild(gridContainer);
}
function getEmptyCells() {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }
    return emptyCells;
}
function addRandomTile() {
    const emptyCells = getEmptyCells();
    if (emptyCells.length === 0) return null;
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    grid[randomCell.row][randomCell.col] = value;
    const tile = document.createElement('div');
    tile.className = `tile tile-${value} tile-new`;
    tile.textContent = value;
    const x = randomCell.col * (CELL_SIZE + CELL_GAP);
    const y = randomCell.row * (CELL_SIZE + CELL_GAP);
    tile.style.left = `${x}px`;
    tile.style.top = `${y}px`;
    tiles.push({ row: randomCell.row, col: randomCell.col, value: value, element: tile });
    gameBoard.appendChild(tile);
    setTimeout(() => tile.classList.remove('tile-new'), 200);
    return randomCell;
}
function move(direction) {
    if (hasWon && !hasLost) return;
    const oldGrid = grid.map(row => [...row]);
    let moved = false;
    switch (direction) {
        case 'up': moved = moveUp(); break;
        case 'down': moved = moveDown(); break;
        case 'left': moved = moveLeft(); break;
        case 'right': moved = moveRight(); break;
    }
    if (moved) {
        updateTiles();
        setTimeout(() => {
            addRandomTile();
            checkWin();
            if (!hasWon) checkLose();
        }, 150);
    }
}
function moveUp() {
    let moved = false;
    for (let col = 0; col < GRID_SIZE; col++) {
        const column = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            if (grid[row][col] !== 0) column.push(grid[row][col]);
        }
        const merged = mergeArray(column);
        for (let row = 0; row < GRID_SIZE; row++) {
            const value = merged[row] || 0;
            if (grid[row][col] !== value) { grid[row][col] = value; moved = true; }
        }
    }
    return moved;
}
function moveDown() {
    let moved = false;
    for (let col = 0; col < GRID_SIZE; col++) {
        const column = [];
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (grid[row][col] !== 0) column.push(grid[row][col]);
        }
        const merged = mergeArray(column);
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
            const value = merged[GRID_SIZE - 1 - row] || 0;
            if (grid[row][col] !== value) { grid[row][col] = value; moved = true; }
        }
    }
    return moved;
}
function moveLeft() {
    let moved = false;
    for (let row = 0; row < GRID_SIZE; row++) {
        const currentRow = grid[row].filter(val => val !== 0);
        const merged = mergeArray(currentRow);
        for (let col = 0; col < GRID_SIZE; col++) {
            const value = merged[col] || 0;
            if (grid[row][col] !== value) { grid[row][col] = value; moved = true; }
        }
    }
    return moved;
}
function moveRight() {
    let moved = false;
    for (let row = 0; row < GRID_SIZE; row++) {
        const currentRow = [...grid[row]].reverse().filter(val => val !== 0);
        const merged = mergeArray(currentRow);
        for (let col = GRID_SIZE - 1; col >= 0; col--) {
            const value = merged[GRID_SIZE - 1 - col] || 0;
            if (grid[row][col] !== value) { grid[row][col] = value; moved = true; }
        }
    }
    return moved;
}
function mergeArray(arr) {
    const result = [];
    let i = 0;
    while (i < arr.length) {
        if (i + 1 < arr.length && arr[i] === arr[i + 1]) {
            const mergedValue = arr[i] * 2;
            result.push(mergedValue);
            score += mergedValue;
            scoreElement.textContent = score;
            if (score > bestScore) {
                bestScore = score;
                bestScoreElement.textContent = bestScore;
                localStorage.setItem('bestScore', bestScore.toString());
            }
            i += 2;
        } else {
            result.push(arr[i]);
            i++;
        }
    }
    return result;
}
function updateTiles() {
    const tilesToRemove = [];
    tiles.forEach(tile => {
        if (grid[tile.row][tile.col] !== tile.value) tilesToRemove.push(tile);
    });
    tilesToRemove.forEach(tile => { tile.element.remove(); tiles = tiles.filter(t => t !== tile); });
    tiles.forEach(tile => {
        const x = tile.col * (CELL_SIZE + CELL_GAP);
        const y = tile.row * (CELL_SIZE + CELL_GAP);
        if (grid[tile.row][tile.col] === tile.value * 2) {
            tile.value *= 2;
            tile.element.textContent = tile.value;
            tile.element.className = `tile tile-${tile.value} tile-merged`;
            setTimeout(() => tile.element.classList.remove('tile-merged'), 200);
        }
        tile.element.style.left = `${x}px`;
        tile.element.style.top = `${y}px`;
        tile.element.className = `tile tile-${tile.value}`;
    });
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const value = grid[row][col];
            if (value !== 0 && !tiles.some(t => t.row === row && t.col === col)) {
                const tile = document.createElement('div');
                tile.className = `tile tile-${value} tile-new`;
                tile.textContent = value;
                tile.style.left = `${col * (CELL_SIZE + CELL_GAP)}px`;
                tile.style.top = `${row * (CELL_SIZE + CELL_GAP)}px`;
                tiles.push({ row: row, col: col, value: value, element: tile });
                gameBoard.appendChild(tile);
                setTimeout(() => tile.classList.remove('tile-new'), 200);
            }
        }
    }
}
function checkWin() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === 2048) {
                hasWon = true;
                gameOverTitle.textContent = '你赢了！';
                gameOverElement.classList.remove('hidden');
                return;
            }
        }
    }
}
function checkLose() {
    if (getEmptyCells().length > 0) return;
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const value = grid[row][col];
            if (col < GRID_SIZE - 1 && grid[row][col + 1] === value) return;
            if (row < GRID_SIZE - 1 && grid[row + 1][col] === value) return;
        }
    }
    hasLost = true;
    gameOverTitle.textContent = '游戏结束';
    gameOverElement.classList.remove('hidden');
}
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); move('up'); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); move('down'); break;
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); move('left'); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); move('right'); break;
    }
});
let touchStartX = 0, touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });
document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 50;
    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) return;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        move(deltaX > 0 ? 'right' : 'left');
    } else {
        move(deltaY > 0 ? 'down' : 'up');
    }
}, { passive: true });
newGameButton.addEventListener('click', initGame);
restartButton.addEventListener('click', initGame);
document.addEventListener('DOMContentLoaded', initGame);