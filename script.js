
// Constants
const THEME_SELECTION = 8; // New state for theme selection
const WIDTH = 600, HEIGHT = 700;
const WHITE = [255, 255, 255], BLACK = [0, 0, 0], RED = [200, 0, 0], GREEN = [0, 150, 0], BLUE = [0, 0, 255];
const GRAY = [200, 200, 200], CORAL = [245, 101, 101], PURPLE = [128, 0, 128];
const MENU = 0, NAME_INPUT = 1, SIDE_SELECTION = 2, DIFFICULTY_SELECTION = 3, PLAYING = 4, GAME_OVER = 5, RULES = 6, INVITE_PLAY = 7;
const CREATE_ROOM = 0, JOIN_ROOM = 1, WAITING = 2, PLAYING_ONLINE = 3;
const SINGLE_PLAYER = 0, LOCAL_MULTIPLAYER = 1, ONLINE_MULTIPLAYER = 2;
const EASY = 0, MEDIUM = 1, HARD = 2;
const TURN_TIMEOUT = 60;



// Constants for theme selection
// Constants for theme selection
const THEME_PREVIEW_WIDTH = 150; // Width of each theme preview box
const THEME_PREVIEW_HEIGHT = 150; // Height of each theme preview box
const THEME_PREVIEW_GAP = 20; // Gap between theme preview boxes
const THEME_BUTTON_SIZE = 30; // Size of navigation arrow buttons
const THEMES = [
    {
        name: "Classic",
        background: [247, 250, 252], // Light gray
        lineColor: [26, 32, 44], // Dark blue-gray
        pointColor: [26, 32, 44],
        texture: null // No texture for classic
    },
    {
        name: "Wooden",
        background: [139, 69, 19], // Brown
        lineColor: [255, 215, 0], // Gold
        pointColor: [255, 215, 0],
        texture: 'wood_texture.png' // Texture image (must be provided in your project)
    },
    {
        name: "Nature",
        background: [34, 139, 34], // Forest green
        lineColor: [210, 180, 140], // Tan
        pointColor: [210, 180, 140],
        texture: 'grass_texture.png' // Texture image (must be provided in your project)
    },
    {
        name: "Dark",
        background: [50, 50, 50], // Dark gray
        lineColor: [200, 200, 200], // Light gray
        pointColor: [200, 200, 200],
        texture: null // No texture for dark
    }
];

// Game board points
let points = [];
const gap = WIDTH / 6;
for (let y = 1; y <= 5; y++) {
    for (let x = 1; x <= 5; x++) {
        points.push([x * gap, y * gap]);
    }
}

// Connections (adjacent positions)
const connections = {
    0: [1, 5, 6], 1: [0, 2, 6], 2: [1, 3, 6, 7, 8], 3: [2, 4, 8], 4: [3, 8, 9],
    5: [0, 6, 10], 6: [0, 1, 2, 5, 7, 10, 11, 12], 7: [2, 6, 8, 12],
    8: [2, 3, 4, 7, 9, 12, 13, 14], 9: [4, 8, 14], 10: [5, 6, 11, 15],
    11: [6, 10, 12, 16], 12: [6, 7, 8, 11, 13, 16, 17, 18], 13: [8, 12, 14, 18],
    14: [8, 9, 13, 18, 19, 24], 15: [10, 16, 20], 16: [11, 12, 15, 17, 20, 21, 22],
    17: [12, 16, 18, 22], 18: [12, 13, 14, 17, 19, 22, 23, 24], 19: [14, 18, 24],
    20: [15, 16, 21], 21: [16, 20, 22], 22: [16, 17, 18, 21, 23], 23: [18, 22, 24],
    24: [14, 18, 19, 23]
};


let tigerImage, goatImage;
let audioContext;

class Game {
   // Add to Game class constructor
// Add to Game class constructor
constructor() {
    this.resetGame();
    this.state = MENU;
    this.gameMode = SINGLE_PLAYER;
    this.player1Name = "";
    this.player2Name = "";
    this.inputActive = false;
    this.currentInput = "";
    this.inputFor = "player1";
    this.playerSide = null;
    this.aiSide = null;
    this.aiDifficulty = EASY;
    this.useMinimax = false;
    this.useMcts = false;
    this.selectedMenuItem = 0;
    this.moveHistory = [];
    this.redoStack = [];
    this.undoPerformed = false;
    this.message = "";
    this.messageTimer = 0;
    this.bfsPath = [];
    this.showBfs = false;
    this.bfsCache = {};
    this.turnStartTime = null;
    this.turnTimeLeft = TURN_TIMEOUT;
    this.animatingPiece = null;
    this.particles = [];
    this.socket = null;
    this.roomCode = null;
    this.isHost = false;
    this.invitePlayState = CREATE_ROOM;
    this.copyButtonHover = false;
    this.hintCount = 3; // Initialize hint count
    this.hintUsed = 0; // Track hints used
    this.playerStats = { wins: 0, losses: 0, streak: 0 }; // Track player performance
    this.moveWeights = {}; // Store move weights for learning
    this.selectedTheme = 0; // Default to Classic theme
this.textures = {}; // To store loaded textures
}

drawThemeSelection() {
    background(247, 250, 252); // Light background
    fill(26, 32, 44); // Dark text color
    textSize(50);
    textStyle(BOLD);
    textAlign(CENTER);
    text("Choose Board Theme", WIDTH / 2, 80);
    textSize(22);
    textStyle(NORMAL);
    text("Select Your Game Board Style", WIDTH / 2, 120);

    // Carousel setup
    let totalWidth = THEMES.length * (THEME_PREVIEW_WIDTH + THEME_PREVIEW_GAP) - THEME_PREVIEW_GAP;
    let startX = (WIDTH - totalWidth) / 2;
    let currentX = startX;

    // Draw left arrow
    fill(this.selectedMenuItem === 0 ? [180, 180, 180] : [26, 32, 44]);
    triangle(
        50, HEIGHT / 2,
        50 + THEME_BUTTON_SIZE, HEIGHT / 2 - THEME_BUTTON_SIZE / 2,
        50 + THEME_BUTTON_SIZE, HEIGHT / 2 + THEME_BUTTON_SIZE / 2
    );

    // Draw theme previews
    for (let i = 0; i < THEMES.length; i++) {
        let isSelected = i === this.selectedMenuItem;
        push();
        translate(currentX, HEIGHT / 2 - THEME_PREVIEW_HEIGHT / 2);
        
        // Draw preview border
        stroke(isSelected ? CORAL : [26, 32, 44]);
        strokeWeight(isSelected ? 4 : 2);
        fill(...THEMES[i].background);
        rect(0, 0, THEME_PREVIEW_WIDTH, THEME_PREVIEW_HEIGHT, 10);
        
        // Draw mini grid
        let miniGap = THEME_PREVIEW_WIDTH / 6;
        stroke(...THEMES[i].lineColor);
        strokeWeight(1);
        for (let j = 1; j <= 5; j++) {
            line(miniGap, j * miniGap, 5 * miniGap, j * miniGap);
            line(j * miniGap, miniGap, j * miniGap, 5 * miniGap);
        }
        line(miniGap, miniGap, 5 * miniGap, 5 * miniGap);
        line(5 * miniGap, miniGap, miniGap, 5 * miniGap);
        line(3 * miniGap, miniGap, 3 * miniGap, 5 * miniGap);
        line(miniGap, 3 * miniGap, 5 * miniGap, 3 * miniGap);
        line(3 * miniGap, miniGap, 5 * miniGap, 3 * miniGap);
        line(5 * miniGap, 3 * miniGap, 3 * miniGap, 5 * miniGap);
        line(3 * miniGap, 5 * miniGap, miniGap, 3 * miniGap);
        line(miniGap, 3 * miniGap, 3 * miniGap, miniGap);
        
        // Draw points
        for (let y = 1; y <= 5; y++) {
            for (let x = 1; x <= 5; x++) {
                fill(...THEMES[i].pointColor);
                noStroke();
                circle(x * miniGap, y * miniGap, 3);
            }
        }
        
        // Draw theme name
        textSize(20);
        fill(isSelected ? CORAL : [26, 32, 44]);
        textStyle(isSelected ? BOLD : NORMAL);
        text(THEMES[i].name, THEME_PREVIEW_WIDTH / 2, THEME_PREVIEW_HEIGHT + 30);
        
        pop();
        currentX += THEME_PREVIEW_WIDTH + THEME_PREVIEW_GAP;
    }

    // Draw right arrow
    fill(this.selectedMenuItem === THEMES.length - 1 ? [180, 180, 180] : [26, 32, 44]);
    triangle(
        WIDTH - 50, HEIGHT / 2,
        WIDTH - 50 - THEME_BUTTON_SIZE, HEIGHT / 2 - THEME_BUTTON_SIZE / 2,
        WIDTH - 50 - THEME_BUTTON_SIZE, HEIGHT / 2 + THEME_BUTTON_SIZE / 2
    );

    textSize(18);
    fill(113, 128, 150);
    text("Use LEFT/RIGHT to navigate, ENTER to confirm", WIDTH / 2, HEIGHT - 100);

    // Updated drawThemeSelection method for Game class
Game.prototype.drawThemeSelection = function() {
    background(247, 250, 252); // Light background
    fill(26, 32, 44); // Dark text color
    textSize(50);
    textStyle(BOLD);
    textAlign(CENTER);
    text("Choose Board Theme", WIDTH / 2, 80);
    textSize(22);
    textStyle(NORMAL);
    text("Select Your Game Board Style", WIDTH / 2, 120);

    // Carousel setup
    let totalWidth = THEMES.length * (THEME_PREVIEW_WIDTH + THEME_PREVIEW_GAP) - THEME_PREVIEW_GAP;
    let startX = (WIDTH - totalWidth) / 2;
    let currentX = startX;

    // Draw left arrow
    fill(this.selectedMenuItem === 0 ? [180, 180, 180] : [26, 32, 44]);
    triangle(
        50, HEIGHT / 2,
        50 + THEME_BUTTON_SIZE, HEIGHT / 2 - THEME_BUTTON_SIZE / 2,
        50 + THEME_BUTTON_SIZE, HEIGHT / 2 + THEME_BUTTON_SIZE / 2
    );

    // Draw theme previews
    for (let i = 0; i < THEMES.length; i++) {
        let isSelected = i === this.selectedMenuItem;
        push();
        translate(currentX, HEIGHT / 2 - THEME_PREVIEW_HEIGHT / 2);
        
        // Draw preview border
        stroke(isSelected ? CORAL : [26, 32, 44]);
        strokeWeight(isSelected ? 4 : 2);
        fill(...THEMES[i].background);
        if (THEMES[i].texture && this.textures[THEMES[i].texture]) {
            image(this.textures[THEMES[i].texture], 0, 0, THEME_PREVIEW_WIDTH, THEME_PREVIEW_HEIGHT);
        } else {
            rect(0, 0, THEME_PREVIEW_WIDTH, THEME_PREVIEW_HEIGHT, 10);
        }
        
        // Draw mini grid
        let miniGap = THEME_PREVIEW_WIDTH / 6;
        stroke(...THEMES[i].lineColor);
        strokeWeight(1);
        for (let j = 1; j <= 5; j++) {
            line(miniGap, j * miniGap, 5 * miniGap, j * miniGap);
            line(j * miniGap, miniGap, j * miniGap, 5 * miniGap);
        }
        line(miniGap, miniGap, 5 * miniGap, 5 * miniGap);
        line(5 * miniGap, miniGap, miniGap, 5 * miniGap);
        line(3 * miniGap, miniGap, 3 * miniGap, 5 * miniGap);
        line(miniGap, 3 * miniGap, 5 * miniGap, 3 * miniGap);
        line(3 * miniGap, miniGap, 5 * miniGap, 3 * miniGap);
        line(5 * miniGap, 3 * miniGap, 3 * miniGap, 5 * miniGap);
        line(3 * miniGap, 5 * miniGap, miniGap, 3 * miniGap);
        line(miniGap, 3 * miniGap, 3 * miniGap, miniGap);
        
        // Draw points
        for (let y = 1; y <= 5; y++) {
            for (let x = 1; x <= 5; x++) {
                fill(...THEMES[i].pointColor);
                noStroke();
                circle(x * miniGap, y * miniGap, 3);
            }
        }
        
        // Draw theme name
        textSize(20);
        fill(isSelected ? CORAL : [26, 32, 44]);
        textStyle(isSelected ? BOLD : NORMAL);
        text(THEMES[i].name, THEME_PREVIEW_WIDTH / 2, THEME_PREVIEW_HEIGHT + 30);
        
        pop();
        currentX += THEME_PREVIEW_WIDTH + THEME_PREVIEW_GAP;
    }

    // Draw right arrow
    fill(this.selectedMenuItem === THEMES.length - 1 ? [180, 180, 180] : [26, 32, 44]);
    triangle(
        WIDTH - 50, HEIGHT / 2,
        WIDTH - 50 - THEME_BUTTON_SIZE, HEIGHT / 2 - THEME_BUTTON_SIZE / 2,
        WIDTH - 50 - THEME_BUTTON_SIZE, HEIGHT / 2 + THEME_BUTTON_SIZE / 2
    );

    textSize(18);
    fill(113, 128, 150);
    text("Use LEFT/RIGHT to navigate, ENTER to confirm", WIDTH / 2, HEIGHT - 100);
};
}


// Add new methods to Game class
mcts(depth, isTigerTurn, timeLimit = 1000) {
    const startTime = Date.now();
    const root = { state: this.cloneState(), visits: 0, score: 0, children: [], move: null };
    let iterations = 0;

    while (Date.now() - startTime < timeLimit) {
        let node = this.selectNode(root);
        let score = this.simulate(node.state, isTigerTurn);
        this.backpropagate(node, score);
        iterations++;
    }

    let bestChild = root.children.reduce((best, child) => 
        child.visits > 0 && (best === null || child.score / child.visits > best.score / best.visits) ? child : best, null);
    return bestChild ? bestChild.move : null;
}

cloneState() {
    return {
        tigerPositions: [...this.tigerPositions],
        goatPositions: [...this.goatPositions],
        goatsEaten: this.goatsEaten,
        currentTurn: this.currentTurn,
        phase: this.phase
    };
}

selectNode(node) {
    while (node.children.length > 0) {
        let unvisited = node.children.filter(child => child.visits === 0);
        if (unvisited.length > 0) return unvisited[Math.floor(Math.random() * unvisited.length)];
        node = node.children.reduce((best, child) => {
            let uct = (child.score / child.visits) + 1.41 * Math.sqrt(Math.log(node.visits) / child.visits);
            return uct > (best.score / best.visits + 1.41 * Math.sqrt(Math.log(node.visits) / best.visits)) ? child : best;
        });
    }
    return node;
}

expandNode(node) {
    let possibleMoves = [];
    if (node.state.currentTurn === 'tiger') {
        for (let i = 0; i < node.state.tigerPositions.length; i++) {
            let tigerPos = node.state.tigerPositions[i];
            for (let move of connections[tigerPos] || []) {
                if (!node.state.tigerPositions.includes(move) && !node.state.goatPositions.includes(move)) {
                    possibleMoves.push(['move', i, move]);
                }
            }
            for (let j = 0; j < node.state.goatPositions.length; j++) {
                let goatPos = node.state.goatPositions[j];
                if (this.isAdjacent(tigerPos, goatPos)) {
                    let capturePos = this.getCapturePosition(tigerPos, goatPos);
                    if (capturePos !== null) {
                        possibleMoves.push(['capture', i, j, capturePos]);
                    }
                }
            }
        }
    } else {
        let remainingGoats = this.MAX_GOATS - (node.state.goatPositions.length + node.state.goatsEaten);
        if (node.state.phase === 'placement' && remainingGoats > 0) {
            for (let pos = 0; pos < 25; pos++) {
                if (!node.state.tigerPositions.includes(pos) && !node.state.goatPositions.includes(pos)) {
                    possibleMoves.push(['place_goat', pos]);
                }
            }
        } else {
            for (let i = 0; i < node.state.goatPositions.length; i++) {
                let goatPos = node.state.goatPositions[i];
                for (let move of connections[goatPos] || []) {
                    if (!node.state.tigerPositions.includes(move) && !node.state.goatPositions.includes(move)) {
                        possibleMoves.push(['move_goat', i, move]);
                    }
                }
            }
        }
    }
    node.children = possibleMoves.map(move => ({
        state: this.applyMove(node.state, move),
        visits: 0,
        score: 0,
        children: [],
        move: move,
        parent: node
    }));
    return node.children.length > 0 ? node.children[Math.floor(Math.random() * node.children.length)] : node;
}

applyMove(state, move) {
    let newState = {
        tigerPositions: [...state.tigerPositions],
        goatPositions: [...state.goatPositions],
        goatsEaten: state.goatsEaten,
        currentTurn: state.currentTurn === 'tiger' ? 'goat' : 'tiger',
        phase: state.phase
    };
    if (move[0] === 'move') {
        newState.tigerPositions[move[1]] = move[2];
    } else if (move[0] === 'capture') {
        newState.tigerPositions[move[1]] = move[3];
        newState.goatPositions.splice(move[2], 1);
        newState.goatsEaten += 1;
    } else if (move[0] === 'place_goat') {
        newState.goatPositions.push(move[1]);
        if (this.MAX_GOATS - (newState.goatPositions.length + newState.goatsEaten) <= 0) {
            newState.phase = 'movement';
        }
    } else if (move[0] === 'move_goat') {
        newState.goatPositions[move[1]] = move[2];
    }
    return newState;
}

simulate(state, isTigerTurn) {
    let simState = this.cloneState(state);
    let depth = 10;
    while (depth > 0) {
        if (simState.goatsEaten >= 5) return isTigerTurn ? 1 : -1;
        if (!this.tigerHasMovesInState(simState)) return isTigerTurn ? -1 : 1;
        let remainingGoats = this.MAX_GOATS - (simState.goatPositions.length + simState.goatsEaten);
        if (simState.phase === 'movement' && remainingGoats <= 0 && !this.anyValidGoatMovesInState(simState)) {
            return isTigerTurn ? 1 : -1;
        }
        let moves = [];
        if (simState.currentTurn === 'tiger') {
            for (let i = 0; i < simState.tigerPositions.length; i++) {
                let tigerPos = simState.tigerPositions[i];
                for (let move of connections[tigerPos] || []) {
                    if (!simState.tigerPositions.includes(move) && !simState.goatPositions.includes(move)) {
                        moves.push(['move', i, move]);
                    }
                }
                for (let j = 0; j < simState.goatPositions.length; j++) {
                    let goatPos = simState.goatPositions[j];
                    if (this.isAdjacent(tigerPos, goatPos)) {
                        let capturePos = this.getCapturePosition(tigerPos, goatPos);
                        if (capturePos !== null) {
                            moves.push(['capture', i, j, capturePos]);
                        }
                    }
                }
            }
        } else {
            let remainingGoats = this.MAX_GOATS - (simState.goatPositions.length + simState.goatsEaten);
            if (simState.phase === 'placement' && remainingGoats > 0) {
                for (let pos = 0; pos < 25; pos++) {
                    if (!simState.tigerPositions.includes(pos) && !simState.goatPositions.includes(pos)) {
                        moves.push(['place_goat', pos]);
                    }
                }
            } else {
                for (let i = 0; i < simState.goatPositions.length; i++) {
                    let goatPos = simState.goatPositions[i];
                    for (let move of connections[goatPos] || []) {
                        if (!simState.tigerPositions.includes(move) && !simState.goatPositions.includes(move)) {
                            moves.push(['move_goat', i, move]);
                        }
                    }
                }
            }
        }
        if (moves.length === 0) break;
        simState = this.applyMove(simState, moves[Math.floor(Math.random() * moves.length)]);
        depth--;
    }
    return this.evaluateBoard(isTigerTurn, simState);
}

backpropagate(node, score) {
    while (node) {
        node.visits += 1;
        node.score += score;
        node = node.parent;
    }
}

tigerHasMovesInState(state) {
    for (let tigerPos of state.tigerPositions) {
        for (let move of connections[tigerPos] || []) {
            if (!state.goatPositions.includes(move) && !state.tigerPositions.includes(move)) return true;
        }
        for (let goatPos of state.goatPositions) {
            if (this.isAdjacent(tigerPos, goatPos)) {
                if (this.getCapturePosition(tigerPos, goatPos) !== null) return true;
            }
        }
    }
    return false;
}

anyValidGoatMovesInState(state) {
    for (let goatPos of state.goatPositions) {
        for (let move of connections[goatPos] || []) {
            if (!state.tigerPositions.includes(move) && !state.goatPositions.includes(move)) return true;
        }
    }
    return false;
}

updatePlayerStats(winner) {
    if (this.gameMode !== SINGLE_PLAYER) return;
    if (winner === this.playerSide) {
        this.playerStats.wins += 1;
        this.playerStats.streak = Math.max(0, this.playerStats.streak + 1);
    } else {
        this.playerStats.losses += 1;
        this.playerStats.streak = Math.min(0, this.playerStats.streak - 1);
    }
    this.adjustAIDifficulty();
}

adjustAIDifficulty() {
    if (this.playerStats.streak >= 3) {
        this.aiDifficulty = Math.min(this.aiDifficulty + 1, HARD);
        this.setMessage(`AI difficulty increased to ${['Easy', 'Medium', 'Hard'][this.aiDifficulty]}!`, 60);
    } else if (this.playerStats.streak <= -3) {
        this.aiDifficulty = Math.max(this.aiDifficulty - 1, EASY);
        this.setMessage(`AI difficulty decreased to ${['Easy', 'Medium', 'Hard'][this.aiDifficulty]}!`, 60);
    }
}

requestHint() {
    if (this.gameMode === ONLINE_MULTIPLAYER) {
        this.setMessage("Hints not available in online multiplayer!", 60);
        return;
    }
    if (this.hintUsed >= this.hintCount) {
        this.setMessage("No hints remaining!", 60);
        return;
    }
    if (this.animatingPiece) {
        this.setMessage("Cannot request hint during animation!", 60);
        return;
    }
    let move = this.currentTurn === 'tiger' ? this.findBestTigerMove() : this.findBestGoatMove();
    if (move) {
        this.hintUsed++;
        this.possibleMoves = [];
        if (move[0] === 'move' || move[0] === 'capture') {
            this.selectedTiger = move[1];
            this.possibleMoves = [move[3] || move[2]];
        } else if (move[0] === 'place_goat') {
            this.possibleMoves = [move[1]];
        } else if (move[0] === 'move_goat') {
            this.selectedGoat = move[1];
            this.possibleMoves = [move[2]];
        }
        this.setMessage(`Hint: ${move[0].replace('_', ' ')} at position ${move[3] || move[2] || move[1]} (${this.hintCount - this.hintUsed} hints left)`, 60);
    } else {
        this.setMessage("No valid hint available!", 60);
    }
}

updateMoveWeights() {
    if (this.gameMode !== SINGLE_PLAYER) return;
    let moveKey = JSON.stringify({
        tigerPositions: [...this.tigerPositions],
        goatPositions: [...this.goatPositions],
        currentTurn: this.currentTurn,
        phase: this.phase
    });
    let lastMove = this.moveHistory[this.moveHistory.length - 1];
    if (lastMove && lastMove.moveType) {
        let moveId = JSON.stringify(lastMove.moveDetails);
        if (!this.moveWeights[moveKey]) this.moveWeights[moveKey] = {};
        this.moveWeights[moveKey][moveId] = (this.moveWeights[moveKey][moveId] || 0) + (this.winner === this.aiSide ? -1 : 1);
    }
}

getWeightedMove(moves, stateKey) {
    if (!this.moveWeights[stateKey]) return moves[Math.floor(Math.random() * moves.length)];
    let weightedMoves = moves.map(move => ({
        move,
        weight: (this.moveWeights[stateKey][JSON.stringify(move)] || 0)
    }));
    let totalWeight = weightedMoves.reduce((sum, m) => sum + Math.max(0, m.weight), 0);
    if (totalWeight === 0) return moves[Math.floor(Math.random() * moves.length)];
    let rand = Math.random() * totalWeight;
    let sum = 0;
    for (let wm of weightedMoves) {
        sum += Math.max(0, wm.weight);
        if (rand <= sum) return wm.move;
    }
    return moves[moves.length - 1];
}
   resetGame() {
    this.tigerPositions = [0, 4, 20, 24];
    this.goatPositions = [];
    this.MAX_GOATS = 20;
    this.goatsEaten = 0;
    this.currentTurn = 'goat';
    this.selectedTiger = null;
    this.selectedGoat = null;
    this.phase = 'placement';
    this.possibleMoves = [];
    this.winner = null;
    this.bfsPath = [];
    this.moveHistory = [];
    this.redoStack = [];
    this.undoPerformed = false;
    this.bfsCache = {};
    this.turnStartTime = null;
    this.turnTimeLeft = TURN_TIMEOUT;
    this.animatingPiece = null;
    this.particles = [];
    this.selectedTheme = 0; // Reset to default theme
}
   // Modify saveState to update move weights
saveState(moveType = null, moveDetails = null) {
    let state = {
        stateId: Math.random().toString(36).substr(2, 9),
        tigerPositions: [...this.tigerPositions],
        goatPositions: [...this.goatPositions],
        goatsEaten: this.goatsEaten,
        currentTurn: this.currentTurn,
        phase: this.phase,
        selectedTiger: this.selectedTiger,
        selectedGoat: this.selectedGoat,
        possibleMoves: [...this.possibleMoves],
        bfsPath: [...this.bfsPath],
        winner: this.winner,
        moveType: moveType,
        moveDetails: moveDetails ? { ...moveDetails } : null
    };
    this.moveHistory.push(state);
    this.redoStack = [];
    this.updateMoveHistory();
    this.updateMoveWeights();
    this.turnStartTime = Date.now();
    this.turnTimeLeft = TURN_TIMEOUT;
}
    undoMove() {
        if (this.gameMode !== SINGLE_PLAYER && this.gameMode !== LOCAL_MULTIPLAYER) {
            this.setMessage("Undo not available in network mode!", 120);
            return;
        }
        if (!this.moveHistory.length) {
            this.setMessage("No moves to undo!", 120);
            return;
        }
        this.saveCurrentStateForRedo();
        let state = this.moveHistory.pop();
        this.restoreState(state);
        this.setMessage("Move undone", 60);
        this.updateMoveHistory();
        this.turnStartTime = Date.now();
        this.turnTimeLeft = TURN_TIMEOUT;
    }

    redoMove() {
        if (this.gameMode !== SINGLE_PLAYER && this.gameMode !== LOCAL_MULTIPLAYER) {
            this.setMessage("Redo not available in network mode!", 120);
            return;
        }
        if (!this.redoStack.length) {
            this.setMessage("No moves to redo!", 120);
            return;
        }
        this.saveCurrentState();
        let state = this.redoStack.pop();
        this.restoreState(state);
        this.setMessage("Move redone", 60);
        this.updateMoveHistory();
        this.turnStartTime = Date.now();
        this.turnTimeLeft = TURN_TIMEOUT;
    }

    saveCurrentState() {
        let currentState = {
            stateId: Math.random().toString(36).substr(2, 9),
            tigerPositions: [...this.tigerPositions],
            goatPositions: [...this.goatPositions],
            goatsEaten: this.goatsEaten,
            currentTurn: this.currentTurn,
            phase: this.phase,
            selectedTiger: this.selectedTiger,
            selectedGoat: this.selectedGoat,
            possibleMoves: [...this.possibleMoves],
            bfsPath: [...this.bfsPath],
            winner: this.winner,
            moveType: null,
            moveDetails: null
        };
        this.moveHistory.push(currentState);
        this.updateMoveHistory();
    }

    saveCurrentStateForRedo() {
        let currentState = {
            stateId: Math.random().toString(36).substr(2, 9),
            tigerPositions: [...this.tigerPositions],
            goatPositions: [...this.goatPositions],
            goatsEaten: this.goatsEaten,
            currentTurn: this.currentTurn,
            phase: this.phase,
            selectedTiger: this.selectedTiger,
            selectedGoat: this.selectedGoat,
            possibleMoves: [...this.possibleMoves],
            bfsPath: [...this.bfsPath],
            winner: this.winner,
            moveType: null,
            moveDetails: null
        };
        this.redoStack.push(currentState);
    }

    restoreState(state) {
        this.tigerPositions = [...state.tigerPositions];
        this.goatPositions = [...state.goatPositions];
        this.goatsEaten = state.goatsEaten;
        this.currentTurn = state.currentTurn;
        this.phase = state.phase;
        this.selectedTiger = state.selectedTiger;
        this.selectedGoat = state.selectedGoat;
        this.possibleMoves = [...state.possibleMoves];
        this.bfsPath = [...state.bfsPath];
        this.winner = state.winner;
        this.undoPerformed = true;
        this.bfsCache = {};
        this.animatingPiece = null;
        this.particles = [];
        this.updateMoveHistory();
    }

    setMessage(text, frames) {
        const existingMessage = document.querySelector('.message-box');
        if (existingMessage) {
            existingMessage.remove();
        }
        const messageBox = document.createElement('div');
        messageBox.className = 'message-box';
        messageBox.textContent = text;
        document.body.appendChild(messageBox);
        setTimeout(() => {
            if (messageBox && messageBox.parentNode) {
                messageBox.parentNode.removeChild(messageBox);
            }
        }, frames * 16.67);
    }

    showRules() {
        this.state = RULES;
        this.drawRules();
    }

    drawRules() {
        const existingOverlay = document.querySelector('.game-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        let rulesOverlay = document.createElement('div');
        rulesOverlay.className = 'game-overlay';
        rulesOverlay.innerHTML = `
            <div class="rules-content">
                <h2 class="rules-title">Baag Chal Rules</h2>
                <div class="instructions">
                    <h3>Objective</h3>
                    <p>Tigers must capture (eat) goats by jumping over them.</p>
                    <p>Goats must block all four tigers so they can no longer move.</p>
                    <h3>How to Play</h3>
                    <h4>For the Tiger Player</h4>
                    <p>Starts with 4 tigers already placed on 4 corners of the board.</p>
                    <p>Tigers can:</p>
                    <ul>
                        <li>Move to an adjacent connected empty point.</li>
                        <li>Jump over an adjacent goat to an empty point on the other side (like checkers) to capture it.</li>
                        <li>Capture multiple goats in successive jumps (if possible in one move).</li>
                    </ul>
                    <p>Tiger win condition: capture at least 5 goats to make it impossible for goats to block them.</p>
                    <h4>For the Goat Player</h4>
                    <p>Starts with 20 goats in hand.</p>
                    <p>In the beginning, goats are placed one by one on any empty point on the board (until all 20 are placed).</p>
                    <p>After placing all 20 goats, they can start moving:</p>
                    <ul>
                        <li>Move to an adjacent connected empty point.</li>
                    </ul>
                    <p>Goats cannot jump over tigers or other goats.</p>
                    <p>Goat win condition: trap all four tigers so they can't move.</p>
                    <h3>Special Rules & Notes</h3>
                    <ul>
                        <li>Moves alternate turn by turn.</li>
                        <li>Each turn has a 60-second timer that starts after placing or moving a piece. If time runs out, the current player forfeits, and the opponent wins.</li>
                        <li>Tigers can start capturing goats anytime after the goats are placed.</li>
                        <li>Goats need to be strategic early because they’re vulnerable until all are placed.</li>
                        <li>Tigers cannot jump over another tiger.</li>
                        <li>No diagonal moves unless the board path allows (only along connected lines).</li>
                    </ul>
                    <h3>Example</h3>
                    <p>Goat's Turn: Places a goat on an empty point.</p>
                    <p>Tiger's Turn: Moves to an adjacent point or captures a goat by jumping over.</p>
                </div>
                <button class="button" onclick="this.closest('.game-overlay').remove(); game.state = PLAYING;">Close</button>
            </div>
        `;
        document.body.appendChild(rulesOverlay);
    }

    bfs(start, targets, obstacles, maxDepth = 4) {
        let cacheKey = `${start}|${[...targets].sort().join(',')}|${[...obstacles].sort().join(',')}|${maxDepth}`;
        if (cacheKey in this.bfsCache) return this.bfsCache[cacheKey];
        let visited = new Set();
        let queue = [[start, [start]]];
        visited.add(start);
        while (queue.length) {
            let [currentPos, path] = queue.shift();
            if (targets.has(currentPos)) {
                this.bfsCache[cacheKey] = path;
                return path;
            }
            if (path.length > maxDepth) continue;
            for (let neighbor of connections[currentPos] || []) {
                if (!visited.has(neighbor) && !obstacles.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([neighbor, [...path, neighbor]]);
                }
            }
        }
        this.bfsCache[cacheKey] = [];
        return [];
    }

    // Modify evaluateBoard to handle state parameter
evaluateBoard(forTiger = true, state = null) {
    let score = 0;
    let evalState = state || this;
    if (forTiger) {
        score += evalState.goatsEaten * 100;
        score += evalState.tigerPositions.reduce((sum, pos) => {
            return sum + (connections[pos] || []).filter(m => !evalState.tigerPositions.includes(m) && !evalState.goatPositions.includes(m)).length * 10;
        }, 0);
        for (let tigerPos of evalState.tigerPositions) {
            for (let goatPos of evalState.goatPositions) {
                if (this.isAdjacent(tigerPos, goatPos)) {
                    if (this.getCapturePosition(tigerPos, goatPos) !== null) score += 50;
                }
            }
        }
    } else {
        let remainingGoats = this.MAX_GOATS - (evalState.goatPositions.length + evalState.goatsEaten);
        score += remainingGoats * 50 + evalState.goatPositions.length * 20;
        for (let tigerPos of evalState.tigerPositions) {
            let moves = (connections[tigerPos] || []).filter(m => !evalState.tigerPositions.includes(m) && !evalState.goatPositions.includes(m));
            if (!moves.length) score += 100;
        }
    }
    return score;
}
    getCapturePosition(tigerPos, goatPos) {
        if (!this.isAdjacent(tigerPos, goatPos)) return null;
        let dx = points[goatPos][0] - points[tigerPos][0];
        let dy = points[goatPos][1] - points[tigerPos][1];
        let captureX = points[goatPos][0] + dx;
        let captureY = points[goatPos][1] + dy;
        for (let i = 0; i < points.length; i++) {
            if (points[i][0] === captureX && points[i][1] === captureY) {
                if (!this.tigerPositions.includes(i) && !this.goatPositions.includes(i) && (connections[goatPos] || []).includes(i)) {
                    return i;
                }
            }
        }
        return null;
    }

    minimax(depth, isTigerTurn, alpha, beta) {
        if (depth === 0 || this.checkWinConditions()) {
            return [this.evaluateBoard(isTigerTurn), null];
        }
        let bestMove = null;
        if (isTigerTurn) {
            let maxEval = -Infinity;
            for (let i = 0; i < this.tigerPositions.length; i++) {
                let tigerPos = this.tigerPositions[i];
                for (let j = 0; j < this.goatPositions.length; j++) {
                    let goatPos = this.goatPositions[j];
                    if (this.isAdjacent(tigerPos, goatPos)) {
                        let capturePos = this.getCapturePosition(tigerPos, goatPos);
                        if (capturePos !== null) {
                            let oldTigerPos = this.tigerPositions[i];
                            let oldGoatPositions = [...this.goatPositions];
                            this.tigerPositions[i] = capturePos;
                            this.goatPositions.splice(j, 1);
                            this.goatsEaten += 1;
                            let [evalScore] = this.minimax(depth - 1, false, alpha, beta);
                            this.tigerPositions[i] = oldTigerPos;
                            this.goatPositions = oldGoatPositions;
                            this.goatsEaten -= 1;
                            if (evalScore > maxEval) {
                                maxEval = evalScore;
                                bestMove = ['capture', i, j, capturePos];
                            }
                            alpha = Math.max(alpha, evalScore);
                            if (beta <= alpha) break;
                        }
                    }
                }
                for (let move of connections[tigerPos] || []) {
                    if (!this.tigerPositions.includes(move) && !this.goatPositions.includes(move)) {
                        let oldPos = this.tigerPositions[i];
                        this.tigerPositions[i] = move;
                        let [evalScore] = this.minimax(depth - 1, false, alpha, beta);
                        this.tigerPositions[i] = oldPos;
                        if (evalScore > maxEval) {
                            maxEval = evalScore;
                            bestMove = ['move', i, move];
                        }
                        alpha = Math.max(alpha, evalScore);
                        if (beta <= alpha) break;
                    }
                }
            }
            return [maxEval, bestMove];
        } else {
            let minEval = Infinity;
            let remainingGoats = this.MAX_GOATS - (this.goatPositions.length + this.goatsEaten);
            if (this.phase === 'placement' && remainingGoats > 0) {
                for (let pos = 0; pos < 25; pos++) {
                    if (!this.tigerPositions.includes(pos) && !this.goatPositions.includes(pos)) {
                        this.goatPositions.push(pos);
                        let [evalScore] = this.minimax(depth - 1, true, alpha, beta);
                        this.goatPositions.pop();
                        if (evalScore < minEval) {
                            minEval = evalScore;
                            bestMove = ['place_goat', pos];
                        }
                        beta = Math.min(beta, evalScore);
                        if (beta <= alpha) break;
                    }
                }
            } else {
                for (let i = 0; i < this.goatPositions.length; i++) {
                    let goatPos = this.goatPositions[i];
                    for (let move of connections[goatPos] || []) {
                        if (!this.tigerPositions.includes(move) && !this.goatPositions.includes(move)) {
                            let oldPos = this.goatPositions[i];
                            this.goatPositions[i] = move;
                            let [evalScore] = this.minimax(depth - 1, true, alpha, beta);
                            this.goatPositions[i] = oldPos;
                            if (evalScore < minEval) {
                                minEval = evalScore;
                                bestMove = ['move_goat', i, move];
                            }
                            beta = Math.min(beta, evalScore);
                            if (beta <= alpha) break;
                        }
                    }
                }
            }
            return [minEval, bestMove];
        }
    }

    // Replace findBestTigerMove
findBestTigerMove() {
    let possibleMoves = [];
    for (let i = 0; i < this.tigerPositions.length; i++) {
        let tigerPos = this.tigerPositions[i];
        for (let move of connections[tigerPos] || []) {
            if (!this.tigerPositions.includes(move) && !this.goatPositions.includes(move)) {
                possibleMoves.push(['move', i, move]);
            }
        }
        for (let j = 0; j < this.goatPositions.length; j++) {
            let goatPos = this.goatPositions[j];
            if (this.isAdjacent(tigerPos, goatPos)) {
                let capturePos = this.getCapturePosition(tigerPos, goatPos);
                if (capturePos !== null) {
                    possibleMoves.push(['capture', i, j, capturePos]);
                }
            }
        }
    }
    if (!possibleMoves.length) return null;
    let stateKey = JSON.stringify({
        tigerPositions: [...this.tigerPositions],
        goatPositions: [...this.goatPositions],
        currentTurn: this.currentTurn,
        phase: this.phase
    });
    if (this.aiDifficulty === EASY) {
        return this.getWeightedMove(possibleMoves, stateKey);
    } else if (this.aiDifficulty === MEDIUM && Math.random() < 0.3) {
        return this.getWeightedMove(possibleMoves, stateKey);
    } else if (this.aiDifficulty === HARD) {
        if (this.useMcts) {
            let move = this.mcts(3, true);
            return move || this.getWeightedMove(possibleMoves, stateKey);
        } else if (this.useMinimax) {
            let [, move] = this.minimax(3, true, -Infinity, Infinity);
            return move || this.getWeightedMove(possibleMoves, stateKey);
        } else {
            let captureMoves = possibleMoves.filter(m => m[0] === 'capture');
            if (captureMoves.length) {
                return this.getWeightedMove(captureMoves, stateKey);
            }
            let allGoats = new Set(this.goatPositions);
            let obstacles = new Set([...this.tigerPositions, ...this.goatPositions]);
            let maxDepth = this.phase !== 'placement' ? 4 : 3;
            let bestMove = null, shortestPathLength = Infinity;
            for (let i = 0; i < this.tigerPositions.length; i++) {
                let tigerPos = this.tigerPositions[i];
                obstacles.delete(tigerPos);
                let path = this.bfs(tigerPos, allGoats, obstacles, maxDepth);
                if (path.length && path.length > 1 && this.isAdjacent(tigerPos, path[1])) {
                    if (path.length < shortestPathLength) {
                        shortestPathLength = path.length;
                        bestMove = ['move', i, path[1]];
                    }
                }
                obstacles.add(tigerPos);
            }
            let selectedMove = bestMove || this.getWeightedMove(possibleMoves.filter(m => m[0] === 'move'), stateKey);
            return selectedMove;
        }
    }
}

    // Replace findBestGoatMove
findBestGoatMove() {
    let possibleMoves = [];
    let remainingGoats = this.MAX_GOATS - (this.goatPositions.length + this.goatsEaten);
    if (this.phase === 'placement' && remainingGoats > 0) {
        for (let pos = 0; pos < 25; pos++) {
            if (!this.tigerPositions.includes(pos) && !this.goatPositions.includes(pos)) {
                possibleMoves.push(['place_goat', pos]);
            }
        }
    } else {
        for (let i = 0; i < this.goatPositions.length; i++) {
            let goatPos = this.goatPositions[i];
            for (let move of connections[goatPos] || []) {
                if (!this.tigerPositions.includes(move) && !this.goatPositions.includes(move)) {
                    possibleMoves.push(['move_goat', i, move]);
                }
            }
        }
    }
    if (!possibleMoves.length) return null;
    let stateKey = JSON.stringify({
        tigerPositions: [...this.tigerPositions],
        goatPositions: [...this.goatPositions],
        currentTurn: this.currentTurn,
        phase: this.phase
    });
    if (this.aiDifficulty === EASY) {
        return this.getWeightedMove(possibleMoves, stateKey);
    } else if (this.aiDifficulty === MEDIUM && Math.random() < 0.3) {
        return this.getWeightedMove(possibleMoves, stateKey);
    } else if (this.aiDifficulty === HARD) {
        if (this.useMcts) {
            let move = this.mcts(3, false);
            return move || this.getWeightedMove(possibleMoves, stateKey);
        } else if (this.useMinimax) {
            let [, move] = this.minimax(3, false, -Infinity, Infinity);
            return move || this.getWeightedMove(possibleMoves, stateKey);
        } else {
            return this.findBestGoatPlacement();
        }
    }
}

    findBestGoatPlacement() {
        let remainingGoats = this.MAX_GOATS - (this.goatPositions.length + this.goatsEaten);
        if (this.phase === 'placement' && remainingGoats > 0) {
            if (!this.goatPositions.length) {
                let availablePositions = [];
                for (let p = 0; p < 25; p++) {
                    if (!this.tigerPositions.includes(p) && !this.goatPositions.includes(p)) {
                        availablePositions.push(p);
                    }
                }
                if (availablePositions.length) return ['place_goat', random(availablePositions)];
                return null;
            }
            let blockingPositions = new Set();
            for (let tigerPos of this.tigerPositions) {
                for (let move of connections[tigerPos] || []) {
                    if (!this.goatPositions.includes(move) && !this.tigerPositions.includes(move)) {
                        blockingPositions.add(move);
                    }
                }
            }
            if (blockingPositions.size) return ['place_goat', random([...blockingPositions])];
            let availablePositions = [];
            for (let p = 0; p < 25; p++) {
                if (!this.tigerPositions.includes(p) && !this.goatPositions.includes(p)) {
                    availablePositions.push(p);
                }
            }
            if (availablePositions.length) return ['place_goat', random(availablePositions)];
            return null;
        } else {
            for (let i = 0; i < this.goatPositions.length; i++) {
                let goatPos = this.goatPositions[i];
                for (let move of connections[goatPos] || []) {
                    if (!this.tigerPositions.includes(move) && !this.goatPositions.includes(move)) {
                        for (let tigerPos of this.tigerPositions) {
                            if ((connections[tigerPos] || []).includes(move)) {
                                return ['move_goat', i, move];
                            }
                        }
                    }
                }
            }
            for (let i = 0; i < this.goatPositions.length; i++) {
                let goatPos = this.goatPositions[i];
                for (let move of connections[goatPos] || []) {
                    if (!this.tigerPositions.includes(move) && !this.goatPositions.includes(move)) {
                        return ['move_goat', i, move];
                    }
                }
            }
            return null;
        }
    }

drawBoard() {
    const theme = THEMES[this.selectedTheme];
    
    // Apply texture if available
    if (theme.texture && this.textures[theme.texture]) {
        image(this.textures[theme.texture], 0, 0, WIDTH, HEIGHT);
    } else {
        background(...theme.background);
    }
    
    // Draw grid lines
    stroke(...theme.lineColor);
    strokeWeight(2);
    for (let i = 1; i <= 5; i++) {
        line(gap, i * gap, 5 * gap, i * gap);
        line(i * gap, gap, i * gap, 5 * gap);
    }
    line(gap, gap, 5 * gap, 5 * gap);
    line(5 * gap, gap, gap, 5 * gap);
    line(3 * gap, gap, 3 * gap, 5 * gap);
    line(gap, 3 * gap, 5 * gap, 3 * gap);
    line(3 * gap, gap, 5 * gap, 3 * gap);
    line(5 * gap, 3 * gap, 3 * gap, 5 * gap);
    line(3 * gap, 5 * gap, gap, 3 * gap);
    line(gap, 3 * gap, 3 * gap, gap);
    
    // Draw points
    for (let point of points) {
        fill(...theme.pointColor);
        noStroke();
        circle(point[0], point[1], 5);
    }
    
    // Draw BFS path if enabled
    if (this.showBfs && this.bfsPath.length && !this.useMinimax && !this.useMcts) {
        stroke(...PURPLE);
        strokeWeight(4);
        for (let i = 0; i < this.bfsPath.length - 1; i++) {
            let startPos = points[this.bfsPath[i]];
            let endPos = points[this.bfsPath[i + 1]];
            line(startPos[0], startPos[1], endPos[0], endPos[1]);
            circle(startPos[0], startPos[1], 10);
        }
        circle(points[this.bfsPath[this.bfsPath.length - 1]][0], points[this.bfsPath[this.bfsPath.length - 1]][1], 10);
    }
    
    // Draw possible moves
    noFill();
    stroke(255, 165, 0, 200); // Bright orange with transparency
    strokeWeight(3);
    for (let move of this.possibleMoves) {
        let pulse = 15 + 5 * sin(frameCount * 0.1);
        circle(points[move][0], points[move][1], pulse);
    }
    
    // Draw tigers
    for (let i = 0; i < this.tigerPositions.length; i++) {
        let idx = this.tigerPositions[i];
        let x = points[idx][0];
        let y = points[idx][1];
        if (this.animatingPiece && this.animatingPiece.type === 'tiger' && this.animatingPiece.index === i) {
            let t = min(this.animatingPiece.progress / this.animatingPiece.duration, 1);
            x = lerp(this.animatingPiece.from[0], this.animatingPiece.to[0], t);
            y = lerp(this.animatingPiece.from[1], this.animatingPiece.to[1], t);
        }
        image(tigerImage, x - 25, y - 25, 50, 50);
    }
    
    if (this.selectedTiger !== null && this.selectedTiger < this.tigerPositions.length && !this.animatingPiece) {
        noFill();
        stroke(255, 0, 0, 220);
        strokeWeight(4);
        let pulse = 30 + 5 * sin(frameCount * 0.1);
        circle(points[this.tigerPositions[this.selectedTiger]][0], points[this.tigerPositions[this.selectedTiger]][1], pulse);
        noStroke();
        fill(255, 0, 0, 50);
        circle(points[this.tigerPositions[this.selectedTiger]][0], points[this.tigerPositions[this.selectedTiger]][1], pulse + 10);
    }
    
    // Draw goats
    for (let i = 0; i < this.goatPositions.length; i++) {
        let idx = this.goatPositions[i];
        let x = points[idx][0];
        let y = points[idx][1];
        let alpha = 255;
        if (this.animatingPiece && this.animatingPiece.type === 'goat' && this.animatingPiece.index === i) {
            let t = min(this.animatingPiece.progress / this.animatingPiece.duration, 1);
            x = lerp(this.animatingPiece.from[0], this.animatingPiece.to[0], t);
            y = lerp(this.animatingPiece.from[1], this.animatingPiece.to[1], t);
            if (this.animatingPiece.isPlacement) {
                alpha = lerp(0, 255, t);
            }
        } else if (this.animatingPiece && this.animatingPiece.goatIndex === i && this.animatingPiece.type === 'tiger') {
            let t = min(this.animatingPiece.progress / this.animatingPiece.duration, 1);
            alpha = lerp(255, 0, t);
            if (alpha <= 0) continue;
        }
        push();
        tint(255, alpha);
        image(goatImage, x - 25, y - 25, 50, 50);
        pop();
    }
    
    if (this.selectedGoat !== null && this.selectedGoat < this.goatPositions.length && !this.animatingPiece) {
        noFill();
        stroke(0, 0, 255, 220);
        strokeWeight(4);
        let pulse = 30 + 5 * sin(frameCount * 0.1);
        circle(points[this.goatPositions[this.selectedGoat]][0], points[this.goatPositions[this.selectedGoat]][1], pulse);
        noStroke();
        fill(0, 0, 255, 50);
        circle(points[this.goatPositions[this.selectedGoat]][0], points[this.goatPositions[this.selectedGoat]][1], pulse + 10);
    }
    
    // Update animation and finalize positions
    if (this.animatingPiece) {
        this.animatingPiece.progress++;
        if (this.animatingPiece.progress >= this.animatingPiece.duration) {
            let targetIdx = this.getNearestPoint(this.animatingPiece.to[0], this.animatingPiece.to[1]);
            if (this.animatingPiece.type === 'tiger' && this.animatingPiece.goatIndex !== undefined) {
                if (targetIdx !== null) {
                    this.tigerPositions[this.animatingPiece.index] = targetIdx;
                    this.goatPositions.splice(this.animatingPiece.goatIndex, 1);
                    this.goatsEaten++;
                }
            } else if (this.animatingPiece.type === 'tiger') {
                if (targetIdx !== null) {
                    this.tigerPositions[this.animatingPiece.index] = targetIdx;
                }
            } else if (this.animatingPiece.type === 'goat' && !this.animatingPiece.isPlacement) {
                if (targetIdx !== null) {
                    this.goatPositions[this.animatingPiece.index] = targetIdx;
                }
            } else if (this.animatingPiece.type === 'goat' && this.animatingPiece.isPlacement) {
                if (targetIdx !== null && !this.goatPositions.includes(targetIdx)) {
                    this.goatPositions[this.animatingPiece.index] = targetIdx;
                }
            }
            this.animatingPiece = null;
            this.turnStartTime = Date.now();
            this.turnTimeLeft = TURN_TIMEOUT;
        }
    }
    this.updateAndDrawParticles();
}


// Game class methods to replace or add
drawMenu() {
    background(247, 250, 252);
    fill(26, 32, 44);
    textSize(50);
    textStyle(BOLD);
    textAlign(CENTER);
    text("Baag Chal", WIDTH / 2, 80);
    textSize(22);
    textStyle(NORMAL);
    text("Master the Hunt or Defend the Herd", WIDTH / 2, 120);
    let modes = ["Play vs AI", "Local Multiplayer", "Invite Play"];
    for (let i = 0; i < modes.length; i++) {
        fill(i === this.selectedMenuItem ? CORAL : [26, 32, 44]);
        textSize(30);
        textStyle(i === this.selectedMenuItem ? BOLD : NORMAL);
        text(modes[i], WIDTH / 2, 220 + i * 60);
        let textWidthValue = textWidth(modes[i]);
        let textHeight = 30;
        let x = WIDTH / 2 - textWidthValue / 2;
        let y = 220 + i * 60 - textHeight / 2;
        if (mouseX >= x && mouseX <= x + textWidthValue && 
            mouseY >= y && mouseY <= y + textHeight && 
            mouseIsPressed) {
            this.selectedMenuItem = i;
            if (i === 0) {
                this.gameMode = SINGLE_PLAYER;
                this.state = SIDE_SELECTION;
                this.selectedMenuItem = 0;
            } else if (i === 1) {
                this.gameMode = LOCAL_MULTIPLAYER;
                this.state = NAME_INPUT;
                this.inputFor = "player1";
                this.inputActive = true;
            } else if (i === 2) {
                this.gameMode = ONLINE_MULTIPLAYER;
                this.state = INVITE_PLAY;
                this.invitePlayState = CREATE_ROOM;
                this.selectedMenuItem = 0;
                this.initSocket();
            }
        }
    }
    textSize(18);
    fill(113, 128, 150);
    text("Use UP/DOWN or 1/2/3 to select, ENTER to confirm", WIDTH / 2, 400);
    text("Press Q to exit", WIDTH / 2, 430);
}

drawInvitePlay() {
    background(247, 250, 252);
    fill(26, 32, 44);
    textSize(50);
    textStyle(BOLD);
    textAlign(CENTER);
    text("Invite Play", WIDTH / 2, 80);
    textSize(22);
    textStyle(NORMAL);
    text("Play with a friend online", WIDTH / 2, 120);
    if (this.invitePlayState === CREATE_ROOM || this.invitePlayState === JOIN_ROOM) {
        let options = ["Create Room", "Join Room"];
        for (let i = 0; i < options.length; i++) {
            fill(i === this.selectedMenuItem ? CORAL : [26, 32, 44]);
            textSize(30);
            textStyle(i === this.selectedMenuItem ? BOLD : NORMAL);
            text(options[i], WIDTH / 2, 220 + i * 60);
        }
        textSize(18);
        fill(113, 128, 150);
        text("Use UP/DOWN or 1/2 to select, ENTER to confirm", WIDTH / 2, 400);
        if (this.invitePlayState === JOIN_ROOM) {
            textSize(20);
            fill(26, 32, 44);
            text("Enter Room Code:", WIDTH / 2, 300);
            const boxWidth = 200, boxHeight = 40;
            stroke(26, 32, 44);
            strokeWeight(2);
            noFill();
            rect(WIDTH / 2 - boxWidth / 2, 320, boxWidth, boxHeight, 8);
            fill(26, 32, 44);
            noStroke();
            textSize(24);
            let displayCode = this.currentInput || "";
            if (this.inputActive) {
                displayCode += frameCount % 60 < 30 ? "|" : "";
            }
            text(displayCode, WIDTH / 2, 330);
        }
    } else if (this.invitePlayState === WAITING) {
        textSize(30);
        textStyle(NORMAL);
        text("Room Code: " + (this.roomCode || "Generating..."), WIDTH / 2, 220);
        if (this.roomCode) {
            let link = `${window.location.origin}?room=${this.roomCode}`;
            textSize(18);
            text("Share this link:", WIDTH / 2, 260);
            textSize(16);
            text(link, WIDTH / 2, 290);
            fill(this.copyButtonHover ? CORAL : [26, 32, 44]);
            textSize(20);
            text("Copy Link", WIDTH / 2, 330);
            let textWidthValue = textWidth("Copy Link");
            let textHeight = 20;
            let x = WIDTH / 2 - textWidthValue / 2;
            let y = 330 - textHeight / 2;
            if (mouseX >= x && mouseX <= x + textWidthValue && mouseY >= y && mouseY <= y + textHeight) {
                this.copyButtonHover = true;
                if (mouseIsPressed) {
                    navigator.clipboard.writeText(link).then(() => {
                        this.setMessage("Link copied!", 60);
                    });
                }
            } else {
                this.copyButtonHover = false;
            }
        }
        textSize(22);
        fill(26, 32, 44);
        text("Waiting for opponent...", WIDTH / 2, 380);
    } else if (this.invitePlayState === PLAYING_ONLINE) {
        this.drawBoard();
        textSize(22);
        text("Playing Online", WIDTH / 2, HEIGHT - 50);
    }
    textSize(18);
    fill(113, 128, 150);
    text("Press M to return to menu, Q to quit", WIDTH / 2, 430);

    Game.prototype.drawInvitePlay = function() {
    background(247, 250, 252);
    fill(26, 32, 44);
    textSize(50);
    textStyle(BOLD);
    textAlign(CENTER);
    text("Invite Play", WIDTH / 2, 80);
    textSize(22);
    textStyle(NORMAL);
    text("Play with a friend online", WIDTH / 2, 120);
    if (this.invitePlayState === CREATE_ROOM || this.invitePlayState === JOIN_ROOM) {
        let options = ["Create Room", "Join Room"];
        for (let i = 0; i < options.length; i++) {
            fill(i === this.selectedMenuItem ? CORAL : [26, 32, 44]);
            textSize(30);
            textStyle(i === this.selectedMenuItem ? BOLD : NORMAL);
            text(options[i], WIDTH / 2, 220 + i * 60);
        }
        if (this.invitePlayState === JOIN_ROOM) {
            textSize(20);
            fill(26, 32, 44);
            text("Tap to enter Room Code", WIDTH / 2, 300);
            const boxWidth = 200, boxHeight = 40;
            stroke(26, 32, 44);
            strokeWeight(2);
            noFill();
            rect(WIDTH / 2 - boxWidth / 2, 320, boxWidth, boxHeight, 8);
            fill(26, 32, 44);
            noStroke();
            textSize(24);
            let displayCode = this.currentInput || "";
            // Show cursor only for non-mobile devices
            if (!/Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                if (this.inputActive && frameCount % 60 < 30) {
                    displayCode += "|";
                }
            }
            text(displayCode.toUpperCase(), WIDTH / 2, 330);
        }
        textSize(18);
        fill(113, 128, 150);
        text("Use UP/DOWN or 1/2 to select, ENTER to confirm", WIDTH / 2, 400);
    } else if (this.invitePlayState === WAITING) {
        textSize(30);
        textStyle(NORMAL);
        text("Room Code: " + (this.roomCode || "Generating..."), WIDTH / 2, 220);
        if (this.roomCode) {
            let link = `${window.location.origin}?room=${this.roomCode}`;
            textSize(18);
            text("Share this link:", WIDTH / 2, 260);
            textSize(16);
            text(link, WIDTH / 2, 290);
            fill(this.copyButtonHover ? CORAL : [26, 32, 44]);
            textSize(20);
            text("Copy Link", WIDTH / 2, 330);
            let textWidthValue = textWidth("Copy Link");
            let textHeight = 20;
            let x = WIDTH / 2 - textWidthValue / 2;
            let y = 330 - textHeight / 2;
            if (mouseX >= x && mouseX <= x + textWidthValue && mouseY >= y && mouseY <= y + textHeight) {
                this.copyButtonHover = true;
                if (mouseIsPressed) {
                    navigator.clipboard.writeText(link).then(() => {
                        this.setMessage("Link copied!", 60);
                    });
                }
            } else {
                this.copyButtonHover = false;
            }
        }
        textSize(22);
        fill(26, 32, 44);
        text("Waiting for opponent...", WIDTH / 2, 380);
    } else if (this.invitePlayState === PLAYING_ONLINE) {
        this.drawBoard();
        textSize(22);
        text("Playing Online", WIDTH / 2, HEIGHT - 50);
    }
    textSize(18);
    fill(113, 128, 150);
    text("Press M to return to menu, Q to quit", WIDTH / 2, 430);
};
}
initSocket() {
    this.socket = io('http://localhost:3000');
    this.socket.on('roomCreated', (data) => {
        this.roomCode = data.roomCode;
        this.isHost = true;
        this.playerSide = 'goat';
        this.invitePlayState = WAITING;
        this.setMessage("Room created! Share the code.", 60);
    });
    this.socket.on('roomJoined', (data) => {
        this.roomCode = data.roomCode;
        this.isHost = false;
        this.playerSide = 'tiger';
        this.invitePlayState = PLAYING_ONLINE;
        this.state = PLAYING;
        this.gameMode = ONLINE_MULTIPLAYER;
        this.turnStartTime = Date.now();
        this.turnTimeLeft = TURN_TIMEOUT;
        this.setMessage("Joined room! You are Tigers.", 60);
    });
    this.socket.on('opponentJoined', () => {
        this.invitePlayState = PLAYING_ONLINE;
        this.state = PLAYING;
        this.gameMode = ONLINE_MULTIPLAYER;
        this.turnStartTime = Date.now();
        this.turnTimeLeft = TURN_TIMEOUT;
        this.setMessage("Opponent joined! You are Goats.", 60);
        this.sendGameState();
    });
    this.socket.on('opponentMove', (data) => {
        if (this.animatingPiece) return;
        if (data.moveType === 'place_goat') {
            let newIndex = this.goatPositions.length;
            this.goatPositions.push(data.position);
            this.animatingPiece = {
                type: 'goat',
                index: newIndex,
                from: points[data.position],
                to: points[data.position],
                targetIdx: data.position,
                progress: 0,
                duration: 30,
                isPlacement: true
            };
            this.saveState('place_goat', { position: data.position });
            this.setMessage(`Opponent placed goat at ${data.position}`, 60);
        } else if (data.moveType === 'move_goat') {
            let fromPos = this.goatPositions[data.index];
            this.goatPositions[data.index] = data.to;
            this.animatingPiece = {
                type: 'goat',
                index: data.index,
                from: points[fromPos],
                to: points[data.to],
                targetIdx: data.to,
                progress: 0,
                duration: 30
            };
            this.saveState('move_goat', { from: fromPos, to: data.to });
            this.setMessage(`Opponent moved goat from ${fromPos} to ${data.to}`, 60);
        } else if (data.moveType === 'move_tiger') {
            let fromPos = this.tigerPositions[data.index];
            this.tigerPositions[data.index] = data.to;
            this.animatingPiece = {
                type: 'tiger',
                index: data.index,
                from: points[fromPos],
                to: points[data.to],
                targetIdx: data.to,
                progress: 0,
                duration: 30
            };
            this.saveState('move_tiger', { from: fromPos, to: data.to });
            this.setMessage(`Opponent moved tiger from ${fromPos} to ${data.to}`, 60);
        } else if (data.moveType === 'capture') {
            let fromPos = this.tigerPositions[data.tigerIndex];
            this.tigerPositions[data.tigerIndex] = data.newPosition;
            this.goatPositions.splice(data.goatIndex, 1);
            this.goatsEaten++;
            this.animatingPiece = {
                type: 'tiger',
                index: data.tigerIndex,
                from: points[fromPos],
                to: points[data.newPosition],
                targetIdx: data.newPosition,
                progress: 0,
                duration: 30,
                goatIndex: data.goatIndex
            };
            this.saveState('capture', { tiger: data.tigerIndex, goat: data.goatIndex, newPosition: data.newPosition });
            this.setMessage(`Opponent captured goat at ${data.goatIndex}`, 60);
        }
        this.currentTurn = this.playerSide;
        this.updatePhase();
        this.bfsCache = {};
        this.undoPerformed = false;
        if (this.checkWinConditions()) {
            this.state = GAME_OVER;
            this.setMessage(`Game over: ${this.winner} wins!`, 120);
            this.socket.emit('gameOver', { roomCode: this.roomCode, winner: this.winner });
        }
    });
    this.socket.on('gameOver', (data) => {
        this.winner = data.winner;
        this.state = GAME_OVER;
        this.setMessage(`Game over: ${this.winner} wins!`, 120);
    });
    this.socket.on('opponentDisconnected', () => {
        this.setMessage("Opponent disconnected!", 120);
        this.state = MENU;
        this.resetGame();
        this.invitePlayState = CREATE_ROOM;
        this.socket.disconnect();
        this.socket = null;
    });
    this.socket.on('error', (data) => {
        this.setMessage(data.message, 120);
        this.invitePlayState = JOIN_ROOM;
        this.currentInput = "";
    });
}

createGameRoom() {
    this.socket.emit('createRoom');
}

joinGameRoom(code) {
    this.socket.emit('joinRoom', { roomCode: code });
}

sendMove(moveType, data) {
    if (this.socket && this.roomCode) {
        this.socket.emit('move', {
            roomCode: this.roomCode,
            moveType: moveType,
            ...data
        });
    }
}

sendGameState() {
    if (this.socket && this.roomCode) {
        this.socket.emit('gameState', {
            roomCode: this.roomCode,
            tigerPositions: this.tigerPositions,
            goatPositions: this.goatPositions,
            goatsEaten: this.goatsEaten,
            currentTurn: this.currentTurn,
            phase: this.phase
        });
    }
}

  drawSideSelection() {
    background(247, 250, 252);
    fill(26, 32, 44);
    textSize(50);
    textStyle(BOLD);
    textAlign(CENTER);
    text("Choose Your Side", WIDTH / 2, 80);
    textSize(22);
    textStyle(NORMAL);
    text("Hunt as Tigers or Defend as Goats", WIDTH / 2, 120);
    let sides = ["Tigers", "Goats", "Random"];
    for (let i = 0; i < sides.length; i++) {
        fill(i === this.selectedMenuItem ? CORAL : [26, 32, 44]);
        textSize(30);
        textStyle(i === this.selectedMenuItem ? BOLD : NORMAL);
        text(sides[i], WIDTH / 2, 220 + i * 60);
    }
    textSize(18);
    fill(113, 128, 150);
    text("Use UP/DOWN or 1/2/3 to select, ENTER to confirm", WIDTH / 2, 400);
}

drawDifficultySelection() {
    background(247, 250, 252);
    fill(26, 32, 44);
    textSize(50);
    textStyle(BOLD);
    textAlign(CENTER);
    text("AI Difficulty", WIDTH / 2, 80);
    textSize(22);
    textStyle(NORMAL);
    text("Challenge Your Strategic Skills", WIDTH / 2, 120);
    let difficulties = ["Easy", "Medium", "Hard"];
    for (let i = 0; i < difficulties.length; i++) {
        fill(i === this.selectedMenuItem ? CORAL : [26, 32, 44]);
        textSize(30);
        textStyle(i === this.selectedMenuItem ? BOLD : NORMAL);
        text(difficulties[i], WIDTH / 2, 220 + i * 60);
    }
    textSize(18);
    fill(113, 128, 150);
    text("Use UP/DOWN or 1/2/3 to select, ENTER to confirm", WIDTH / 2, 400);
}
    drawNameInput() {
        background(247, 250, 252);
        textAlign(CENTER);
        fill(26, 32, 44);
        textSize(34);
        textStyle(BOLD);
        let labelText = `Enter ${this.inputFor === 'player1' ? 'Player 1' : 'Player 2'} Name`;
        text(labelText, WIDTH / 2, HEIGHT / 2 - 80);
        textSize(20);
        textStyle(NORMAL);
        text("Type your name (max 20 characters)", WIDTH / 2, HEIGHT / 2 - 40);
        const boxWidth = 360;
        const boxHeight = 50;
        stroke(26, 32, 44);
        strokeWeight(2);
        noFill();
        rect(WIDTH / 2 - boxWidth / 2, HEIGHT / 2 - 10, boxWidth, boxHeight, 8);
        let inputText = this.currentInput.substring(0, 20);
        let textWidthValue = textWidth(inputText);
        if (textWidthValue > boxWidth - 20) {
            let maxLength = floor((boxWidth - 20) / textWidth('a'));
            inputText = this.currentInput.substring(0, maxLength - 3) + '...';
        }
        fill(26, 32, 44);
        noStroke();
        textSize(26);
        text(inputText, WIDTH / 2, HEIGHT / 2 + 8);
        textSize(18);
        fill(113, 128, 150);
        text("Press ENTER to confirm, BACKSPACE to delete", WIDTH / 2, HEIGHT / 2 + 70);

        Game.prototype.drawNameInput = function() {
    background(247, 250, 252);
    textAlign(CENTER);
    fill(26, 32, 44);
    textSize(34);
    textStyle(BOLD);
    let labelText = `Enter ${this.inputFor === 'player1' ? 'Player 1' : 'Player 2'} Name`;
    text(labelText, WIDTH / 2, HEIGHT / 2 - 80);
    textSize(20);
    textStyle(NORMAL);
    text("Tap to enter name (max 20 characters)", WIDTH / 2, HEIGHT / 2 - 40);
    const boxWidth = 360;
    const boxHeight = 50;
    stroke(26, 32, 44);
    strokeWeight(2);
    noFill();
    rect(WIDTH / 2 - boxWidth / 2, HEIGHT / 2 - 10, boxWidth, boxHeight, 8);
    fill(26, 32, 44);
    noStroke();
    textSize(26);
    let inputText = this.currentInput.substring(0, 20);
    let textWidthValue = textWidth(inputText);
    if (textWidthValue > boxWidth - 20) {
        let maxLength = floor((boxWidth - 20) / textWidth('a'));
        inputText = this.currentInput.substring(0, maxLength - 3) + '...';
    }
    // Show cursor only for non-mobile devices
    if (!/Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        if (this.inputActive && frameCount % 60 < 30) {
            inputText += "|";
        }
    }
    text(inputText, WIDTH / 2, HEIGHT / 2 + 8);
    textSize(18);
    fill(113, 128, 150);
    text("Press ENTER to confirm, BACKSPACE to delete", WIDTH / 2, HEIGHT / 2 + 70);
};
    }


    drawGameOver() {
        this.drawBoard();
        if (frameCount % 10 === 0) {
            this.addParticles(random(WIDTH), random(HEIGHT), 5, this.winner === 'Tiger' ? [255, 165, 0] : [0, 191, 255]);
        }
        this.updateAndDrawParticles();
        let overlay = document.querySelector('.game-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'game-overlay';
            let winnerName = this.winner === 'Goat' ? this.player1Name || 'Goat' : this.player2Name || 'Tiger';
            overlay.innerHTML = `
                <div class="game-over-content">
                    <h2 class="game-over-title">${winnerName} Wins!</h2>
                    <div class="game-over-subtitle">Click below or press R to restart, M for menu, Q to quit</div>
                    <button class="button restart-button">Restart</button>
                    <button class="button menu-button">Main Menu</button>
                    <button class="button quit-button">Quit</button>
                </div>
            `;
            document.body.appendChild(overlay);
            const restartButton = overlay.querySelector('.restart-button');
            const menuButton = overlay.querySelector('.menu-button');
            const quitButton = overlay.querySelector('.quit-button');
            restartButton.addEventListener('click', () => {
                overlay.remove();
                this.particles = [];
                this.resetGame();
                this.state = PLAYING;
                this.setMessage("Game restarted", 60);
            });
            menuButton.addEventListener('click', () => {
                overlay.remove();
                this.particles = [];
                this.resetGame();
                this.state = MENU;
                this.setMessage("Returned to menu", 60);
            });
            quitButton.addEventListener('click', () => {
                overlay.remove();
                this.particles = [];
                window.close();
            });
        }
    }

    drawRulesScreen() {
        this.drawRules();
    }

    getNearestPoint(x, y) {
        for (let i = 0; i < points.length; i++) {
            let [px, py] = points[i];
            if (Math.abs(x - px) < 20 && Math.abs(y - py) < 20) return i;
        }
        return null;
    }

    isAdjacent(p1, p2) {
        return (connections[p1] || []).includes(p2);
    }

    moveGoat(goatIndex, newPosition) {
        if (!this.goatPositions.includes(newPosition) && !this.tigerPositions.includes(newPosition)) {
            this.goatPositions[goatIndex] = newPosition;
            this.bfsCache = {};
            return true;
        }
        return false;
    }

    captureGoat(tigerIndex, goatIndex, capturePos) {
        if (capturePos !== null && !this.tigerPositions.includes(capturePos) && !this.goatPositions.includes(capturePos)) {
            let goatPos = this.goatPositions[goatIndex];
            this.addParticles(points[goatPos][0], points[goatPos][1], 20, [255, 165, 0]);
            this.tigerPositions[tigerIndex] = capturePos;
            this.goatPositions.splice(goatIndex, 1);
            this.goatsEaten += 1;
            this.bfsCache = {};
            return true;
        }
        return false;
    }

    tigerHasMoves() {
        for (let tigerPos of this.tigerPositions) {
            for (let move of connections[tigerPos] || []) {
                if (!this.goatPositions.includes(move) && !this.tigerPositions.includes(move)) return true;
            }
            for (let goatPos of this.goatPositions) {
                if (this.isAdjacent(tigerPos, goatPos)) {
                    if (this.getCapturePosition(tigerPos, goatPos) !== null) return true;
                }
            }
        }
        return false;
    }

    // Modify checkWinConditions to update player stats
checkWinConditions() {
    if (this.goatsEaten >= 5) {
        this.winner = "Tiger";
        this.updatePlayerStats(this.winner);
        return true;
    }
    if (!this.tigerHasMoves()) {
        this.winner = "Goat";
        this.updatePlayerStats(this.winner);
        return true;
    }
    let remainingGoats = this.MAX_GOATS - (this.goatPositions.length + this.goatsEaten);
    if (remainingGoats <= 0 && !this.anyValidGoatMoves()) {
        this.winner = "Tiger";
        this.updatePlayerStats(this.winner);
        return true;
    }
    return false;
}

    anyValidGoatMoves() {
        for (let goatPos of this.goatPositions) {
            for (let move of connections[goatPos] || []) {
                if (!this.tigerPositions.includes(move) && !this.goatPositions.includes(move)) return true;
            }
        }
        return false;
    }

    updatePhase() {
        let remainingGoats = this.MAX_GOATS - (this.goatPositions.length + this.goatsEaten);
        if (this.phase === 'placement' && remainingGoats <= 0) {
            this.phase = 'movement';
            this.bfsCache = {};
        }
    }

    playTimeoutSound() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    checkTurnTimeout() {
        if (this.state !== PLAYING) return;
        if (!this.turnStartTime) return;
        const elapsed = (Date.now() - this.turnStartTime) / 1000;
        this.turnTimeLeft = Math.max(0, TURN_TIMEOUT - elapsed);
        if (this.turnTimeLeft <= 0) {
            this.playTimeoutSound();
            this.winner = this.currentTurn === 'goat' ? 'Tiger' : 'Goat';
            this.state = GAME_OVER;
            this.setMessage(`Time's up! ${this.winner} wins!`, 120);
        }
    }

    updateTurnTimer() {
        if (this.turnStartTime && this.state === PLAYING) {
            const seconds = Math.ceil(this.turnTimeLeft);
            document.getElementById('turn-timer').textContent = `Turn Timer: ${seconds}`;
            this.checkTurnTimeout();
        } else {
            document.getElementById('turn-timer').textContent = `Turn Timer: 60`;
        }
    }

    tigerAiMove() {
        if (!this.tigerHasMoves()) {
            this.setMessage("No valid moves for AI tigers!", 60);
            return;
        }
        if (this.animatingPiece) return;
        let move = this.findBestTigerMove();
        if (move) {
            let tigerPos = this.tigerPositions[move[1]];
            let targetPos = move[3] || move[2];
            if (move[0] === 'move' && !this.isAdjacent(tigerPos, targetPos)) {
                console.error(`Invalid AI tiger move: from ${tigerPos} to ${targetPos} is not adjacent!`);
                this.setMessage(`Invalid AI move from ${tigerPos} to ${targetPos}!`, 60);
                return;
            }
            this.saveState(move[0], { tiger: move[1], to: targetPos, goat: move[2] || null });
            if (move[0] === 'capture') {
                this.animatingPiece = {
                    type: 'tiger',
                    index: move[1],
                    from: points[tigerPos],
                    to: points[move[3]],
                    targetIdx: move[3], // Store target index for final update
                    progress: 0,
                    duration: 30,
                    goatIndex: move[2]
                };
            } else if (move[0] === 'move') {
                this.animatingPiece = {
                    type: 'tiger',
                    index: move[1],
                    from: points[tigerPos],
                    to: points[move[2]],
                    targetIdx: move[2],
                    progress: 0,
                    duration: 30
                };
                if (!this.useMinimax && !this.useMcts) {
                    let allGoats = new Set(this.goatPositions);
                    let obstacles = new Set([...this.tigerPositions, ...this.goatPositions]);
                    obstacles.delete(tigerPos);
                    this.bfsPath = this.bfs(tigerPos, allGoats, obstacles);
                }
            }
            this.currentTurn = 'goat';
            this.undoPerformed = false;
            this.bfsCache = {};
            if (move[0] === 'capture') {
                this.setMessage(`AI captured goat at ${move[2]}!`, 60);
            } else {
                this.setMessage(`AI moved tiger from ${tigerPos} to ${move[2]}`, 60);
            }
        } else {
            this.setMessage("No valid AI tiger move found!", 60);
        }
    }

    goatAiMove() {
        if (this.animatingPiece) return;
        let remainingGoats = this.MAX_GOATS - (this.goatPositions.length + this.goatsEaten);
        if (this.phase === 'placement' && remainingGoats <= 0) {
            this.updatePhase();
        }
        if (this.phase === 'movement' && !this.anyValidGoatMoves()) {
            this.setMessage("No valid moves for goats!", 60);
            return;
        }
        let move = this.findBestGoatMove();
        if (move) {
            this.saveState(move[0], { position: move[1] || null, from: move[0] === 'move_goat' ? this.goatPositions[move[1]] : null, to: move[2] });
            if (move[0] === 'place_goat') {
                // Add to goatPositions immediately to reserve the spot
                let newIndex = this.goatPositions.length;
                this.goatPositions.push(move[1]);
                this.animatingPiece = {
                    type: 'goat',
                    index: newIndex,
                    from: points[move[1]],
                    to: points[move[1]],
                    targetIdx: move[1],
                    progress: 0,
                    duration: 30,
                    isPlacement: true
                };
                this.setMessage(`AI placed goat at ${move[1]}`, 60);
            } else if (move[0] === 'move_goat') {
                this.animatingPiece = {
                    type: 'goat',
                    index: move[1],
                    from: points[this.goatPositions[move[1]]],
                    to: points[move[2]],
                    targetIdx: move[2],
                    progress: 0,
                    duration: 30
                };
                this.goatPositions[move[1]] = move[2]; // Update immediately for consistency
                this.setMessage(`AI moved goat from ${this.goatPositions[move[1]]} to ${move[2]}`, 60);
            }
            this.currentTurn = 'tiger';
            this.undoPerformed = false;
            this.bfsCache = {};
            this.updatePhase();
        }
    }

    handleClick(x, y) {
        if (this.gameMode === SINGLE_PLAYER && this.currentTurn !== this.playerSide) return;
        if (this.animatingPiece) return;
        let nearestPoint = this.getNearestPoint(x, y);
        if (nearestPoint === null) return;
        let remainingGoats = this.MAX_GOATS - (this.goatPositions.length + this.goatsEaten);
        if (this.currentTurn === 'tiger') {
            if (this.tigerPositions.includes(nearestPoint) && this.selectedTiger === null) {
                this.selectedTiger = this.tigerPositions.indexOf(nearestPoint);
                this.possibleMoves = [];
                let tigerPos = this.tigerPositions[this.selectedTiger];
                for (let m of connections[tigerPos] || []) {
                    if (!this.tigerPositions.includes(m) && !this.goatPositions.includes(m)) {
                        this.possibleMoves.push(m);
                    }
                }
                for (let j = 0; j < this.goatPositions.length; j++) {
                    let goatPos = this.goatPositions[j];
                    if (this.isAdjacent(tigerPos, goatPos)) {
                        let capturePos = this.getCapturePosition(tigerPos, goatPos);
                        if (capturePos !== null) {
                            this.possibleMoves.push(capturePos);
                        }
                    }
                }
            } else if (this.tigerPositions.includes(nearestPoint) && this.selectedTiger !== null) {
                if (this.tigerPositions[this.selectedTiger] === nearestPoint) {
                    this.selectedTiger = null;
                    this.possibleMoves = [];
                } else {
                    this.selectedTiger = this.tigerPositions.indexOf(nearestPoint);
                    this.possibleMoves = [];
                    let tigerPos = this.tigerPositions[this.selectedTiger];
                    for (let m of connections[tigerPos] || []) {
                        if (!this.tigerPositions.includes(m) && !this.goatPositions.includes(m)) {
                            this.possibleMoves.push(m);
                        }
                    }
                    for (let j = 0; j < this.goatPositions.length; j++) {
                        let goatPos = this.goatPositions[j];
                        if (this.isAdjacent(tigerPos, goatPos)) {
                            let capturePos = this.getCapturePosition(tigerPos, goatPos);
                            if (capturePos !== null) {
                                this.possibleMoves.push(capturePos);
                            }
                        }
                    }
                }
            } else if (this.selectedTiger !== null && this.possibleMoves.includes(nearestPoint)) {
                let tigerPos = this.tigerPositions[this.selectedTiger];
                let captureSuccessful = false;
                let capturedGoatIndex = null;
                for (let i = 0; i < this.goatPositions.length; i++) {
                    let goatPos = this.goatPositions[i];
                    if (this.getCapturePosition(tigerPos, goatPos) === nearestPoint) {
                        this.saveState('capture', { tiger: this.selectedTiger, goat: i, newPosition: nearestPoint });
                        captureSuccessful = true;
                        capturedGoatIndex = i;
                        this.animatingPiece = {
                            type: 'tiger',
                            index: this.selectedTiger,
                            from: points[tigerPos],
                            to: points[nearestPoint],
                            targetIdx: nearestPoint,
                            progress: 0,
                            duration: 30,
                            goatIndex: i
                        };
                        break;
                    }
                }
                if (!captureSuccessful && this.isAdjacent(tigerPos, nearestPoint)) {
                    this.saveState('move_tiger', { from: tigerPos, to: nearestPoint });
                    this.animatingPiece = {
                        type: 'tiger',
                        index: this.selectedTiger,
                        from: points[tigerPos],
                        to: points[nearestPoint],
                        targetIdx: nearestPoint,
                        progress: 0,
                        duration: 30
                    };
                }
                if (captureSuccessful || this.isAdjacent(tigerPos, nearestPoint)) {
                    this.currentTurn = 'goat';
                    this.selectedTiger = null;
                    this.possibleMoves = [];
                    this.undoPerformed = false;
                    this.bfsCache = {};
                    if (captureSuccessful) {
                        this.setMessage(`Tiger captured goat at position ${capturedGoatIndex}`, 60);
                    } else {
                        this.setMessage(`Tiger moved from ${tigerPos} to ${nearestPoint}`, 60);
                    }
                } else {
                    this.setMessage(`Invalid move!`, 60);
                }
            } else {
                this.setMessage("Select a valid tiger or move!", 60);
            }
        } else if (this.currentTurn === 'goat') {
            if (this.phase === 'placement' && remainingGoats > 0) {
                if (!this.goatPositions.includes(nearestPoint) && !this.tigerPositions.includes(nearestPoint)) {
                    this.saveState('place_goat', { position: nearestPoint });
                    let newIndex = this.goatPositions.length;
                    this.goatPositions.push(nearestPoint); // Add immediately
                    this.animatingPiece = {
                        type: 'goat',
                        index: newIndex,
                        from: points[nearestPoint],
                        to: points[nearestPoint],
                        targetIdx: nearestPoint,
                        progress: 0,
                        duration: 30,
                        isPlacement: true
                    };
                    this.currentTurn = 'tiger';
                    this.updatePhase();
                    this.undoPerformed = false;
                    this.bfsCache = {};
                    this.setMessage(`Goat placed at ${nearestPoint}`, 60);
                } else {
                    this.setMessage("Cannot place goat here!", 60);
                }
            } else if (this.phase === 'movement') {
                if (this.goatPositions.includes(nearestPoint) && this.selectedGoat === null) {
                    this.selectedGoat = this.goatPositions.indexOf(nearestPoint);
                    this.possibleMoves = (connections[nearestPoint] || []).filter(m => !this.goatPositions.includes(m) && !this.tigerPositions.includes(m));
                } else if (this.goatPositions.includes(nearestPoint) && this.selectedGoat !== null) {
                    if (this.goatPositions[this.selectedGoat] === nearestPoint) {
                        this.selectedGoat = null;
                        this.possibleMoves = [];
                    } else {
                        this.selectedGoat = this.goatPositions.indexOf(nearestPoint);
                        this.possibleMoves = (connections[nearestPoint] || []).filter(m => !this.goatPositions.includes(m) && !this.tigerPositions.includes(m));
                    }
                } else if (this.selectedGoat !== null && this.possibleMoves.includes(nearestPoint)) {
                    let fromPos = this.goatPositions[this.selectedGoat];
                    this.saveState('move_goat', { from: fromPos, to: nearestPoint });
                    this.animatingPiece = {
                        type: 'goat',
                        index: this.selectedGoat,
                        from: points[fromPos],
                        to: points[nearestPoint],
                        targetIdx: nearestPoint,
                        progress: 0,
                        duration: 30
                    };
                    this.goatPositions[this.selectedGoat] = nearestPoint; // Update immediately
                    this.selectedGoat = null;
                    this.possibleMoves = [];
                    this.currentTurn = 'tiger';
                    this.undoPerformed = false;
                    this.bfsCache = {};
                    this.setMessage(`Goat moved from ${fromPos} to ${nearestPoint}`, 60);
                } else {
                    this.setMessage("Invalid goat move!", 60);
                }
            }
        }
    }

    giveUp() {
        if (this.state === PLAYING) {
            this.winner = this.currentTurn === 'goat' ? 'Tiger' : 'Goat';
            this.state = GAME_OVER;
            this.setMessage(`${this.currentTurn === 'goat' ? this.player2Name || 'Tiger' : this.player1Name || 'Goat'} wins by surrender!`, 120);
        }
    }

    addParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: random(-5, 5),
                vy: random(-5, 5),
                alpha: 255,
                size: random(5, 10),
                life: random(20, 40),
                color: color
            });
        }
    }

    updateAndDrawParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 255 / p.life;
            p.life--;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            push();
            fill(...p.color, p.alpha);
            noStroke();
            circle(p.x, p.y, p.size);
            pop();
        }
    }

    updateMoveHistory() {
        const moveHistoryElement = document.getElementById('move-history');
        moveHistoryElement.innerHTML = '';
        this.moveHistory.forEach(state => {
            if (state.moveType) {
                let moveText = '';
                if (state.moveType === 'move_tiger') {
                    moveText = `T: ${state.moveDetails.from} → ${state.moveDetails.to}`;
                } else if (state.moveType === 'capture') {
                    moveText = `T: Captured at ${state.moveDetails.newPosition}`;
                } else if (state.moveType === 'move_goat') {
                    moveText = `G: ${state.moveDetails.from} → ${state.moveDetails.to}`;
                } else if (state.moveType === 'place_goat') {
                    moveText = `G: Placed at ${state.moveDetails.position}`;
                }
                if (moveText) {
                    const div = document.createElement('div');
                    div.textContent = moveText;
                    moveHistoryElement.appendChild(div);
                }
            }
        });
    }
}

let game;


function preload() {
    tigerImage = loadImage('tiger.png');
    goatImage = loadImage('goat.png');
    // Load textures for themes
    for (let theme of THEMES) {
        if (theme.texture) {
            game.textures[theme.texture] = loadImage(theme.texture);
        }
    }
}

function setup() {
    createCanvas(WIDTH, HEIGHT);
    textAlign(LEFT, TOP);
    game = new Game();
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    // Add event listeners for undo and redo buttons
    const undoButton = document.getElementById('undo-button');
    const redoButton = document.getElementById('redo-button');
    if (undoButton) {
        undoButton.addEventListener('click', () => {
            if (game.state === PLAYING && (game.gameMode === SINGLE_PLAYER || game.gameMode === LOCAL_MULTIPLAYER)) {
                game.undoMove();
            }
        });
    }
    if (redoButton) {
        redoButton.addEventListener('click', () => {
            if (game.state === PLAYING && (game.gameMode === SINGLE_PLAYER || game.gameMode === LOCAL_MULTIPLAYER)) {
                game.redoMove();
            }
        });
    }
}

// Global functions
function draw() {
    if (game.state === MENU) {
        game.drawMenu();
        document.getElementById('scoreboard').style.display = 'none';
        document.getElementById('turn-timer').style.display = 'none';
        const moveHistoryPanel = document.getElementById('move-history-panel');
        if (moveHistoryPanel) moveHistoryPanel.style.display = 'none';
    } else if (game.state === SIDE_SELECTION) {
        game.drawSideSelection();
        document.getElementById('scoreboard').style.display = 'none';
        document.getElementById('turn-timer').style.display = 'none';
        const moveHistoryPanel = document.getElementById('move-history-panel');
        if (moveHistoryPanel) moveHistoryPanel.style.display = 'none';
    } else if (game.state === DIFFICULTY_SELECTION) {
        game.drawDifficultySelection();
        document.getElementById('scoreboard').style.display = 'none';
        document.getElementById('turn-timer').style.display = 'none';
        const moveHistoryPanel = document.getElementById('move-history-panel');
        if (moveHistoryPanel) moveHistoryPanel.style.display = 'none';
    } else if (game.state === NAME_INPUT) {
        game.drawNameInput();
        document.getElementById('scoreboard').style.display = 'none';
        document.getElementById('turn-timer').style.display = 'none';
        const moveHistoryPanel = document.getElementById('move-history-panel');
        if (moveHistoryPanel) moveHistoryPanel.style.display = 'none';
    } else if (game.state === THEME_SELECTION) {
        game.drawThemeSelection();
        document.getElementById('scoreboard').style.display = 'none';
        document.getElementById('turn-timer').style.display = 'none';
        const moveHistoryPanel = document.getElementById('move-history-panel');
        if (moveHistoryPanel) moveHistoryPanel.style.display = 'none';
    } else if (game.state === PLAYING) {
        game.drawBoard();
        document.getElementById('scoreboard').style.display = 'flex';
        document.getElementById('goats-available').textContent = `Goats Available: ${20 - (game.goatPositions.length + game.goatsEaten)} / 20`;
        document.getElementById('goats-on-board').textContent = `Goats on board: ${game.goatPositions.length}`;
        document.getElementById('goats-captured').textContent = `Goats Captured: ${game.goatsEaten} / 20`;
        document.getElementById('tigers-trapped').textContent = `Tigers Trapped: ${game.tigerPositions.filter(tiger => {
            let moves = (connections[tiger] || []).filter(m => !game.tigerPositions.includes(m) && !game.goatPositions.includes(m));
            return moves.length === 0;
        }).length} / 4`;
        document.getElementById('current-turn').textContent = `${game.currentTurn === 'goat' ? game.player1Name || 'Goat' : game.player2Name || 'Tiger'}`;
        document.getElementById('goat-turn').className = game.currentTurn === 'goat' ? '' : 'hidden';
        document.getElementById('tiger-turn').className = game.currentTurn === 'tiger' ? '' : 'hidden';
        game.updateTurnTimer();
        document.getElementById('turn-timer').style.display = 'block';
        const moveHistoryPanel = document.getElementById('move-history-panel');
        if (moveHistoryPanel) moveHistoryPanel.style.display = game.gameMode === ONLINE_MULTIPLAYER ? 'none' : 'block';
        const undoButton = document.getElementById('undo-button');
        const redoButton = document.getElementById('redo-button');
        if (undoButton) {
            undoButton.disabled = game.moveHistory.length === 0 || game.gameMode === ONLINE_MULTIPLAYER;
        }
        if (redoButton) {
            redoButton.disabled = game.redoStack.length === 0 || game.gameMode === ONLINE_MULTIPLAYER;
        }
        if (game.checkWinConditions()) {
            game.state = GAME_OVER;
            game.setMessage(`Game over: ${game.winner} wins!`, 120);
            if (game.gameMode === ONLINE_MULTIPLAYER) {
                game.sendGameState();
            }
        } else if (game.gameMode === SINGLE_PLAYER && game.currentTurn === game.aiSide && !game.undoPerformed && !mouseIsPressed) {
            if (game.currentTurn === 'tiger') {
                game.tigerAiMove();
            } else {
                game.goatAiMove();
            }
            if (game.checkWinConditions()) {
                game.state = GAME_OVER;
                game.setMessage(`Game over: ${game.winner} wins!`, 120);
            }
        }
    } else if (game.state === GAME_OVER) {
        game.drawGameOver();
        document.getElementById('scoreboard').style.display = 'none';
        document.getElementById('turn-timer').style.display = 'none';
        const moveHistoryPanel = document.getElementById('move-history-panel');
        if (moveHistoryPanel) moveHistoryPanel.style.display = 'none';
    } else if (game.state === RULES) {
        document.getElementById('scoreboard').style.display = 'flex';
        document.getElementById('turn-timer').style.display = 'none';
        const moveHistoryPanel = document.getElementById('move-history-panel');
        if (moveHistoryPanel) moveHistoryPanel.style.display = 'none';
    } else if (game.state === INVITE_PLAY) {
        game.drawInvitePlay();
        document.getElementById('scoreboard').style.display = 'none';
        document.getElementById('turn-timer').style.display = 'none';
        const moveHistoryPanel = document.getElementById('move-history-panel');
        if (moveHistoryPanel) moveHistoryPanel.style.display = 'none';
    }
}

// Global input handling functions
// Global input handling functions
function mousePressed() {
    if (game.state === PLAYING && game.gameMode === ONLINE_MULTIPLAYER && game.currentTurn !== game.playerSide) return;
    if (game.state === PLAYING) {
        let x = mouseX, y = mouseY;
        let nearestPoint = game.getNearestPoint(x, y);
        if (nearestPoint === null) return;
        let remainingGoats = game.MAX_GOATS - (game.goatPositions.length + game.goatsEaten);
        if (game.currentTurn === 'tiger' && game.playerSide === 'tiger') {
            if (game.tigerPositions.includes(nearestPoint) && game.selectedTiger === null) {
                game.selectedTiger = game.tigerPositions.indexOf(nearestPoint);
                game.possibleMoves = [];
                let tigerPos = game.tigerPositions[game.selectedTiger];
                for (let m of connections[tigerPos] || []) {
                    if (!game.tigerPositions.includes(m) && !game.goatPositions.includes(m)) {
                        game.possibleMoves.push(m);
                    }
                }
                for (let j = 0; j < game.goatPositions.length; j++) {
                    let goatPos = game.goatPositions[j];
                    if (game.isAdjacent(tigerPos, goatPos)) {
                        let capturePos = game.getCapturePosition(tigerPos, goatPos);
                        if (capturePos !== null) {
                            game.possibleMoves.push(capturePos);
                        }
                    }
                }
            } else if (game.tigerPositions.includes(nearestPoint) && game.selectedTiger !== null) {
                if (game.tigerPositions[game.selectedTiger] === nearestPoint) {
                    game.selectedTiger = null;
                    game.possibleMoves = [];
                } else {
                    game.selectedTiger = game.tigerPositions.indexOf(nearestPoint);
                    game.possibleMoves = [];
                    let tigerPos = game.tigerPositions[game.selectedTiger];
                    for (let m of connections[tigerPos] || []) {
                        if (!game.tigerPositions.includes(m) && !game.goatPositions.includes(m)) {
                            game.possibleMoves.push(m);
                        }
                    }
                    for (let j = 0; j < game.goatPositions.length; j++) {
                        let goatPos = game.goatPositions[j];
                        if (game.isAdjacent(tigerPos, goatPos)) {
                            let capturePos = game.getCapturePosition(tigerPos, goatPos);
                            if (capturePos !== null) {
                                game.possibleMoves.push(capturePos);
                            }
                        }
                    }
                }
            } else if (game.selectedTiger !== null && game.possibleMoves.includes(nearestPoint)) {
                let tigerPos = game.tigerPositions[game.selectedTiger];
                let captureSuccessful = false;
                let capturedGoatIndex = null;
                for (let i = 0; i < game.goatPositions.length; i++) {
                    let goatPos = game.goatPositions[i];
                    if (game.getCapturePosition(tigerPos, goatPos) === nearestPoint) {
                        game.saveState('capture', { tiger: game.selectedTiger, goat: i, newPosition: nearestPoint });
                        captureSuccessful = true;
                        capturedGoatIndex = i;
                        game.animatingPiece = {
                            type: 'tiger',
                            index: game.selectedTiger,
                            from: points[tigerPos],
                            to: points[nearestPoint],
                            targetIdx: nearestPoint,
                            progress: 0,
                            duration: 30,
                            goatIndex: i
                        };
                        game.sendMove('capture', { tigerIndex: game.selectedTiger, goatIndex: i, newPosition: nearestPoint });
                        break;
                    }
                }
                if (!captureSuccessful && game.isAdjacent(tigerPos, nearestPoint)) {
                    game.saveState('move_tiger', { from: tigerPos, to: nearestPoint });
                    game.animatingPiece = {
                        type: 'tiger',
                        index: game.selectedTiger,
                        from: points[tigerPos],
                        to: points[nearestPoint],
                        targetIdx: nearestPoint,
                        progress: 0,
                        duration: 30
                    };
                    game.sendMove('move_tiger', { index: game.selectedTiger, to: nearestPoint });
                }
                if (captureSuccessful || game.isAdjacent(tigerPos, nearestPoint)) {
                    game.currentTurn = 'goat';
                    game.selectedTiger = null;
                    game.possibleMoves = [];
                    game.undoPerformed = false;
                    game.bfsCache = {};
                    if (captureSuccessful) {
                        game.setMessage(`Tiger captured goat at position ${capturedGoatIndex}`, 60);
                    } else {
                        game.setMessage(`Tiger moved from ${tigerPos} to ${nearestPoint}`, 60);
                    }
                } else {
                    game.setMessage(`Invalid move!`, 60);
                }
            } else {
                game.setMessage("Select a valid tiger or move!", 60);
            }
        } else if (game.currentTurn === 'goat' && game.playerSide === 'goat') {
            if (game.phase === 'placement' && remainingGoats > 0) {
                if (!game.goatPositions.includes(nearestPoint) && !game.tigerPositions.includes(nearestPoint)) {
                    game.saveState('place_goat', { position: nearestPoint });
                    let newIndex = game.goatPositions.length;
                    game.goatPositions.push(nearestPoint);
                    game.animatingPiece = {
                        type: 'goat',
                        index: newIndex,
                        from: points[nearestPoint],
                        to: points[nearestPoint],
                        targetIdx: nearestPoint,
                        progress: 0,
                        duration: 30,
                        isPlacement: true
                    };
                    game.sendMove('place_goat', { position: nearestPoint });
                    game.currentTurn = 'tiger';
                    game.updatePhase();
                    game.undoPerformed = false;
                    game.bfsCache = {};
                    game.setMessage(`Goat placed at ${nearestPoint}`, 60);
                } else {
                    game.setMessage("Cannot place goat here!", 60);
                }
            } else if (game.phase === 'movement') {
                if (game.goatPositions.includes(nearestPoint) && game.selectedGoat === null) {
                    game.selectedGoat = game.goatPositions.indexOf(nearestPoint);
                    game.possibleMoves = (connections[nearestPoint] || []).filter(m => !game.goatPositions.includes(m) && !game.tigerPositions.includes(m));
                } else if (game.goatPositions.includes(nearestPoint) && game.selectedGoat !== null) {
                    if (game.goatPositions[game.selectedGoat] === nearestPoint) {
                        game.selectedGoat = null;
                        game.possibleMoves = [];
                    } else {
                        game.selectedGoat = game.goatPositions.indexOf(nearestPoint);
                        game.possibleMoves = (connections[nearestPoint] || []).filter(m => !game.goatPositions.includes(m) && !game.tigerPositions.includes(m));
                    }
                } else if (game.selectedGoat !== null && game.possibleMoves.includes(nearestPoint)) {
                    let fromPos = game.goatPositions[game.selectedGoat];
                    game.saveState('move_goat', { from: fromPos, to: nearestPoint });
                    game.animatingPiece = {
                        type: 'goat',
                        index: game.selectedGoat,
                        from: points[fromPos],
                        to: points[nearestPoint],
                        targetIdx: nearestPoint,
                        progress: 0,
                        duration: 30
                    };
                    game.goatPositions[game.selectedGoat] = nearestPoint;
                    game.sendMove('move_goat', { index: game.selectedGoat, to: nearestPoint });
                    game.selectedGoat = null;
                    game.possibleMoves = [];
                    game.currentTurn = 'tiger';
                    game.undoPerformed = false;
                    game.bfsCache = {};
                    game.setMessage(`Goat moved from ${fromPos} to ${nearestPoint}`, 60);
                } else {
                    game.setMessage("Invalid goat move!", 60);
                }
            }
        }
    } else if (game.state === MENU) {
        let modes = ["Play vs AI", "Local Multiplayer", "Invite Play"];
        for (let i = 0; i < modes.length; i++) {
            let textWidthValue = textWidth(modes[i]);
            let textHeight = 30;
            let x = WIDTH / 2 - textWidthValue / 2;
            let y = 220 + i * 60 - textHeight / 2;
            if (mouseX >= x && mouseX <= x + textWidthValue && 
                mouseY >= y && mouseY <= y + textHeight) {
                game.selectedMenuItem = i;
                if (i === 0) {
                    game.gameMode = SINGLE_PLAYER;
                    game.state = SIDE_SELECTION;
                    game.selectedMenuItem = 0;
                } else if (i === 1) {
                    game.gameMode = LOCAL_MULTIPLAYER;
                    game.state = NAME_INPUT;
                    game.inputFor = "player1";
                    game.inputActive = true;
                } else if (i === 2) {
                    game.gameMode = ONLINE_MULTIPLAYER;
                    game.state = INVITE_PLAY;
                    game.invitePlayState = CREATE_ROOM;
                    game.selectedMenuItem = 0;
                    game.initSocket();
                }
            }
        }
    } else if (game.state === SIDE_SELECTION) {
        let sides = ["Tigers", "Goats", "Random"];
        for (let i = 0; i < sides.length; i++) {
            let textWidthValue = textWidth(sides[i]);
            let textHeight = 30;
            let x = WIDTH / 2 - textWidthValue / 2;
            let y = 220 + i * 60 - textHeight / 2;
            if (mouseX >= x && mouseX <= x + textWidthValue && 
                mouseY >= y && mouseY <= y + textHeight) {
                game.selectedMenuItem = i;
                if (i === 0) {
                    game.playerSide = 'tiger';
                    game.aiSide = 'goat';
                } else if (i === 1) {
                    game.playerSide = 'goat';
                    game.aiSide = 'tiger';
                } else if (i === 2) {
                    let sides = ['tiger', 'goat'];
                    game.playerSide = random(sides);
                    game.aiSide = game.playerSide === 'tiger' ? 'goat' : 'tiger';
                }
                game.state = THEME_SELECTION;
                game.selectedMenuItem = 0;
            }
        }
    } else if (game.state === THEME_SELECTION) {
        let totalWidth = THEMES.length * (THEME_PREVIEW_WIDTH + THEME_PREVIEW_GAP) - THEME_PREVIEW_GAP;
        let startX = (WIDTH - totalWidth) / 2;
        
        // Check left arrow
        if (mouseX >= 50 && mouseX <= 50 + THEME_BUTTON_SIZE &&
            mouseY >= HEIGHT / 2 - THEME_BUTTON_SIZE / 2 &&
            mouseY <= HEIGHT / 2 + THEME_BUTTON_SIZE / 2 &&
            game.selectedMenuItem > 0) {
            game.selectedMenuItem--;
        }
        // Check right arrow
        else if (mouseX >= WIDTH - 50 - THEME_BUTTON_SIZE && mouseX <= WIDTH - 50 &&
                 mouseY >= HEIGHT / 2 - THEME_BUTTON_SIZE / 2 &&
                 mouseY <= HEIGHT / 2 + THEME_BUTTON_SIZE / 2 &&
                 game.selectedMenuItem < THEMES.length - 1) {
            game.selectedMenuItem++;
        }
        // Check theme previews
        else {
            let currentX = startX;
            for (let i = 0; i < THEMES.length; i++) {
                if (mouseX >= currentX && mouseX <= currentX + THEME_PREVIEW_WIDTH &&
                    mouseY >= HEIGHT / 2 - THEME_PREVIEW_HEIGHT / 2 &&
                    mouseY <= HEIGHT / 2 + THEME_PREVIEW_HEIGHT / 2) {
                    game.selectedMenuItem = i;
                    game.selectedTheme = i;
                    if (game.gameMode === SINGLE_PLAYER) {
                        game.state = DIFFICULTY_SELECTION;
                    } else {
                        game.state = PLAYING;
                        game.turnStartTime = null;
                        game.turnTimeLeft = TURN_TIMEOUT;
                    }
                    game.selectedMenuItem = 0;
                }
                currentX += THEME_PREVIEW_WIDTH + THEME_PREVIEW_GAP;
            }
        }
    } else if (game.state === DIFFICULTY_SELECTION) {
        let difficulties = ["Easy", "Medium", "Hard"];
        for (let i = 0; i < difficulties.length; i++) {
            let textWidthValue = textWidth(difficulties[i]);
            let textHeight = 30;
            let x = WIDTH / 2 - textWidthValue / 2;
            let y = 220 + i * 60 - textHeight / 2;
            if (mouseX >= x && mouseX <= x + textWidthValue && 
                mouseY >= y && mouseY <= y + textHeight) {
                game.selectedMenuItem = i;
                game.aiDifficulty = i;
                game.state = PLAYING;
                game.turnStartTime = null;
                game.turnTimeLeft = TURN_TIMEOUT;
            }
        }
    } else if (game.state === INVITE_PLAY && (game.invitePlayState === CREATE_ROOM || game.invitePlayState === JOIN_ROOM)) {
        let options = ["Create Room", "Join Room"];
        for (let i = 0; i < options.length; i++) {
            let textWidthValue = textWidth(options[i]);
            let textHeight = 30;
            let x = WIDTH / 2 - textWidthValue / 2;
            let y = 220 + i * 60 - textHeight / 2;
            if (mouseX >= x && mouseX <= x + textWidthValue && 
                mouseY >= y && mouseY <= y + textHeight) {
                game.selectedMenuItem = i;
                if (i === 0) {
                    game.invitePlayState = WAITING;
                    game.createGameRoom();
                } else if (i === 1) {
                    game.invitePlayState = JOIN_ROOM;
                    game.inputActive = true;
                    game.currentInput = "";
                }
            }
        }
    }
}


function touchStarted() {
    if (game.state === NAME_INPUT && game.inputActive) {
        // Create or reuse input element for name input
        let input = document.getElementById('name-input');
        if (!input) {
            input = document.createElement('input');
            input.id = 'name-input';
            input.type = 'text';
            input.maxLength = 20;
            input.style.position = 'absolute';
            input.style.left = `${WIDTH / 2 - 180}px`;
            input.style.top = `${HEIGHT / 2 - 5}px`;
            input.style.width = '360px';
            input.style.height = '40px';
            input.style.fontSize = '24px';
            input.style.textAlign = 'center';
            input.style.border = '2px solid #1A202C';
            input.style.borderRadius = '8px';
            input.value = game.currentInput;
            document.body.appendChild(input);
            input.focus();
            input.addEventListener('input', () => {
                game.currentInput = input.value;
            });
            input.addEventListener('blur', () => {
                if (game.currentInput.trim() === "") {
                    game.setMessage("Name cannot be empty!", 60);
                    input.focus();
                    return;
                }
                if (game.inputFor === 'player1') {
                    game.player1Name = game.currentInput.substring(0, 20).trim() || "Player 1";
                    game.currentInput = "";
                    if (game.gameMode === LOCAL_MULTIPLAYER) {
                        game.inputFor = "player2";
                        input.value = "";
                    } else {
                        game.inputActive = false;
                        game.state = SIDE_SELECTION;
                        game.selectedMenuItem = 0;
                        input.remove();
                    }
                } else if (game.inputFor === 'player2') {
                    game.player2Name = game.currentInput.substring(0, 20).trim() || "Player 2";
                    game.currentInput = "";
                    game.inputActive = false;
                    game.state = THEME_SELECTION;
                    game.selectedMenuItem = 0;
                    input.remove();
                }
            });
        }
        input.focus();
    } else if (game.state === INVITE_PLAY && game.invitePlayState === JOIN_ROOM && game.inputActive) {
        // Create or reuse input element for room code
        let input = document.getElementById('room-code-input');
        if (!input) {
            input = document.createElement('input');
            input.id = 'room-code-input';
            input.type = 'text';
            input.maxLength = 6;
            input.style.position = 'absolute';
            input.style.left = `${WIDTH / 2 - 100}px`;
            input.style.top = '320px';
            input.style.width = '200px';
            input.style.height = '40px';
            input.style.fontSize = '24px';
            input.style.textAlign = 'center';
            input.style.border = '2px solid #1A202C';
            input.style.borderRadius = '8px';
            input.style.textTransform = 'uppercase';
            input.value = game.currentInput;
            document.body.appendChild(input);
            input.focus();
            input.addEventListener('input', () => {
                game.currentInput = input.value.toUpperCase();
            });
            input.addEventListener('blur', () => {
                if (game.currentInput.trim() === "") {
                    game.setMessage("Room code cannot be empty!", 60);
                    input.focus();
                    return;
                }
                game.joinGameRoom(game.currentInput.trim().toUpperCase());
                game.inputActive = false;
                game.currentInput = "";
                input.remove();
            });
        }
        input.focus();
    } else if (game.state === PLAYING && game.gameMode === ONLINE_MULTIPLAYER && game.currentTurn !== game.playerSide) {
        return;
    } else if (game.state === PLAYING) {
        game.handleClick(mouseX, mouseY);
    } else if (game.state === MENU) {
        let modes = ["Play vs AI", "Local Multiplayer", "Invite Play"];
        for (let i = 0; i < modes.length; i++) {
            let textWidthValue = textWidth(modes[i]);
            let textHeight = 30;
            let x = WIDTH / 2 - textWidthValue / 2;
            let y = 220 + i * 60 - textHeight / 2;
            if (mouseX >= x && mouseX <= x + textWidthValue && 
                mouseY >= y && mouseY <= y + textHeight) {
                game.selectedMenuItem = i;
                if (i === 0) {
                    game.gameMode = SINGLE_PLAYER;
                    game.state = SIDE_SELECTION;
                    game.selectedMenuItem = 0;
                } else if (i === 1) {
                    game.gameMode = LOCAL_MULTIPLAYER;
                    game.state = NAME_INPUT;
                    game.inputFor = "player1";
                    game.inputActive = true;
                } else if (i === 2) {
                    game.gameMode = ONLINE_MULTIPLAYER;
                    game.state = INVITE_PLAY;
                    game.invitePlayState = CREATE_ROOM;
                    game.selectedMenuItem = 0;
                    game.initSocket();
                }
            }
        }
    } else if (game.state === SIDE_SELECTION) {
        let sides = ["Tigers", "Goats", "Random"];
        for (let i = 0; i < sides.length; i++) {
            let textWidthValue = textWidth(sides[i]);
            let textHeight = 30;
            let x = WIDTH / 2 - textWidthValue / 2;
            let y = 220 + i * 60 - textHeight / 2;
            if (mouseX >= x && mouseX <= x + textWidthValue && 
                mouseY >= y && mouseY <= y + textHeight) {
                game.selectedMenuItem = i;
                if (i === 0) {
                    game.playerSide = 'tiger';
                    game.aiSide = 'goat';
                } else if (i === 1) {
                    game.playerSide = 'goat';
                    game.aiSide = 'tiger';
                } else if (i === 2) {
                    let sides = ['tiger', 'goat'];
                    game.playerSide = random(sides);
                    game.aiSide = game.playerSide === 'tiger' ? 'goat' : 'tiger';
                }
                game.state = THEME_SELECTION;
                game.selectedMenuItem = 0;
            }
        }
    } else if (game.state === THEME_SELECTION) {
        let totalWidth = THEMES.length * (THEME_PREVIEW_WIDTH + THEME_PREVIEW_GAP) - THEME_PREVIEW_GAP;
        let startX = (WIDTH - totalWidth) / 2;
        if (mouseX >= 50 && mouseX <= 50 + THEME_BUTTON_SIZE &&
            mouseY >= HEIGHT / 2 - THEME_BUTTON_SIZE / 2 &&
            mouseY <= HEIGHT / 2 + THEME_BUTTON_SIZE / 2 &&
            game.selectedMenuItem > 0) {
            game.selectedMenuItem--;
        } else if (mouseX >= WIDTH - 50 - THEME_BUTTON_SIZE && mouseX <= WIDTH - 50 &&
                   mouseY >= HEIGHT / 2 - THEME_BUTTON_SIZE / 2 &&
                   mouseY <= HEIGHT / 2 + THEME_BUTTON_SIZE / 2 &&
                   game.selectedMenuItem < THEMES.length - 1) {
            game.selectedMenuItem++;
        } else {
            let currentX = startX;
            for (let i = 0; i < THEMES.length; i++) {
                if (mouseX >= currentX && mouseX <= currentX + THEME_PREVIEW_WIDTH &&
                    mouseY >= HEIGHT / 2 - THEME_PREVIEW_HEIGHT / 2 &&
                    mouseY <= HEIGHT / 2 + THEME_PREVIEW_HEIGHT / 2) {
                    game.selectedMenuItem = i;
                    game.selectedTheme = i;
                    if (game.gameMode === SINGLE_PLAYER) {
                        game.state = DIFFICULTY_SELECTION;
                    } else {
                        game.state = PLAYING;
                        game.turnStartTime = null;
                        game.turnTimeLeft = TURN_TIMEOUT;
                    }
                    game.selectedMenuItem = 0;
                }
                currentX += THEME_PREVIEW_WIDTH + THEME_PREVIEW_GAP;
            }
        }
    } else if (game.state === DIFFICULTY_SELECTION) {
        let difficulties = ["Easy", "Medium", "Hard"];
        for (let i = 0; i < difficulties.length; i++) {
            let textWidthValue = textWidth(difficulties[i]);
            let textHeight = 30;
            let x = WIDTH / 2 - textWidthValue / 2;
            let y = 220 + i * 60 - textHeight / 2;
            if (mouseX >= x && mouseX <= x + textWidthValue && 
                mouseY >= y && mouseY <= y + textHeight) {
                game.selectedMenuItem = i;
                game.aiDifficulty = i;
                game.state = PLAYING;
                game.turnStartTime = null;
                game.turnTimeLeft = TURN_TIMEOUT;
            }
        }
    } else if (game.state === INVITE_PLAY && (game.invitePlayState === CREATE_ROOM || game.invitePlayState === JOIN_ROOM)) {
        let options = ["Create Room", "Join Room"];
        for (let i = 0; i < options.length; i++) {
            let textWidthValue = textWidth(options[i]);
            let textHeight = 30;
            let x = WIDTH / 2 - textWidthValue / 2;
            let y = 220 + i * 60 - textHeight / 2;
            if (mouseX >= x && mouseX <= x + textWidthValue && 
                mouseY >= y && mouseY <= y + textHeight) {
                game.selectedMenuItem = i;
                if (i === 0) {
                    game.invitePlayState = WAITING;
                    game.createGameRoom();
                } else if (i === 1) {
                    game.invitePlayState = JOIN_ROOM;
                    game.inputActive = true;
                    game.currentInput = "";
                }
            }
        }
    }
}
function keyPressed() {
    // Handle keyboard input only for non-mobile devices
    if (!/Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        if (game.state === MENU) {
            if (keyCode === UP_ARROW) {
                game.selectedMenuItem = (game.selectedMenuItem - 1 + 3) % 3;
            } else if (keyCode === DOWN_ARROW) {
                game.selectedMenuItem = (game.selectedMenuItem + 1) % 3;
            } else if (keyCode === ENTER) {
                if (game.selectedMenuItem === 0) {
                    game.gameMode = SINGLE_PLAYER;
                    game.state = SIDE_SELECTION;
                    game.selectedMenuItem = 0;
                } else if (game.selectedMenuItem === 1) {
                    game.gameMode = LOCAL_MULTIPLAYER;
                    game.state = NAME_INPUT;
                    game.inputFor = "player1";
                    game.inputActive = true;
                } else if (game.selectedMenuItem === 2) {
                    game.gameMode = ONLINE_MULTIPLAYER;
                    game.state = INVITE_PLAY;
                    game.invitePlayState = CREATE_ROOM;
                    game.selectedMenuItem = 0;
                    game.initSocket();
                }
            } else if (key === '1' || key === '2' || key === '3') {
                game.selectedMenuItem = parseInt(key) - 1;
                if (game.selectedMenuItem === 0) {
                    game.gameMode = SINGLE_PLAYER;
                    game.state = SIDE_SELECTION;
                    game.selectedMenuItem = 0;
                } else if (game.selectedMenuItem === 1) {
                    game.gameMode = LOCAL_MULTIPLAYER;
                    game.state = NAME_INPUT;
                    game.inputFor = "player1";
                    game.inputActive = true;
                } else if (game.selectedMenuItem === 2) {
                    game.gameMode = ONLINE_MULTIPLAYER;
                    game.state = INVITE_PLAY;
                    game.invitePlayState = CREATE_ROOM;
                    game.selectedMenuItem = 0;
                    game.initSocket();
                }
            } else if (key === 'q' || key === 'Q') {
                window.close();
            }
        } else if (game.state === SIDE_SELECTION) {
            if (keyCode === UP_ARROW) {
                game.selectedMenuItem = (game.selectedMenuItem - 1 + 3) % 3;
            } else if (keyCode === DOWN_ARROW) {
                game.selectedMenuItem = (game.selectedMenuItem + 1) % 3;
            } else if (keyCode === ENTER) {
                if (game.selectedMenuItem === 0) {
                    game.playerSide = 'tiger';
                    game.aiSide = 'goat';
                } else if (game.selectedMenuItem === 1) {
                    game.playerSide = 'goat';
                    game.aiSide = 'tiger';
                } else if (game.selectedMenuItem === 2) {
                    let sides = ['tiger', 'goat'];
                    game.playerSide = random(sides);
                    game.aiSide = game.playerSide === 'tiger' ? 'goat' : 'tiger';
                }
                game.state = THEME_SELECTION;
                game.selectedMenuItem = 0;
            } else if (key === '1' || key === '2' || key === '3') {
                game.selectedMenuItem = parseInt(key) - 1;
                if (game.selectedMenuItem === 0) {
                    game.playerSide = 'tiger';
                    game.aiSide = 'goat';
                } else if (game.selectedMenuItem === 1) {
                    game.playerSide = 'goat';
                    game.aiSide = 'tiger';
                } else if (game.selectedMenuItem === 2) {
                    let sides = ['tiger', 'goat'];
                    game.playerSide = random(sides);
                    game.aiSide = game.playerSide === 'tiger' ? 'goat' : 'tiger';
                }
                game.state = THEME_SELECTION;
                game.selectedMenuItem = 0;
            }
        } else if (game.state === THEME_SELECTION) {
            if (keyCode === LEFT_ARROW && game.selectedMenuItem > 0) {
                game.selectedMenuItem--;
            } else if (keyCode === RIGHT_ARROW && game.selectedMenuItem < THEMES.length - 1) {
                game.selectedMenuItem++;
            } else if (keyCode === ENTER) {
                game.selectedTheme = game.selectedMenuItem;
                if (game.gameMode === SINGLE_PLAYER) {
                    game.state = DIFFICULTY_SELECTION;
                } else {
                    game.state = PLAYING;
                    game.turnStartTime = null;
                    game.turnTimeLeft = TURN_TIMEOUT;
                }
                game.selectedMenuItem = 0;
            } else if (key >= '1' && key <= String(THEMES.length)) {
                game.selectedMenuItem = parseInt(key) - 1;
                game.selectedTheme = game.selectedMenuItem;
                if (game.gameMode === SINGLE_PLAYER) {
                    game.state = DIFFICULTY_SELECTION;
                } else {
                    game.state = PLAYING;
                    game.turnStartTime = null;
                    game.turnTimeLeft = TURN_TIMEOUT;
                }
                game.selectedMenuItem = 0;
            }
        } else if (game.state === DIFFICULTY_SELECTION) {
            if (keyCode === UP_ARROW) {
                game.selectedMenuItem = (game.selectedMenuItem - 1 + 3) % 3;
            } else if (keyCode === DOWN_ARROW) {
                game.selectedMenuItem = (game.selectedMenuItem + 1) % 3;
            } else if (keyCode === ENTER) {
                game.aiDifficulty = game.selectedMenuItem;
                game.state = PLAYING;
                game.turnStartTime = null;
                game.turnTimeLeft = TURN_TIMEOUT;
            } else if (key === '1' || key === '2' || key === '3') {
                game.selectedMenuItem = parseInt(key) - 1;
                game.aiDifficulty = game.selectedMenuItem;
                game.state = PLAYING;
                game.turnStartTime = null;
                game.turnTimeLeft = TURN_TIMEOUT;
            }
        } else if (game.state === NAME_INPUT && game.inputActive) {
            if (keyCode === ENTER) {
                if (game.currentInput.trim() === "") {
                    game.setMessage("Name cannot be empty!", 60);
                    return;
                }
                if (game.inputFor === 'player1') {
                    game.player1Name = game.currentInput.substring(0, 20).trim() || "Player 1";
                    game.currentInput = "";
                    if (game.gameMode === LOCAL_MULTIPLAYER) {
                        game.inputFor = "player2";
                    } else {
                        game.inputActive = false;
                        game.state = SIDE_SELECTION;
                        game.selectedMenuItem = 0;
                    }
                } else if (game.inputFor === 'player2') {
                    game.player2Name = game.currentInput.substring(0, 20).trim() || "Player 2";
                    game.currentInput = "";
                    game.inputActive = false;
                    game.state = THEME_SELECTION;
                    game.selectedMenuItem = 0;
                }
            } else if (keyCode === BACKSPACE) {
                game.currentInput = game.currentInput.slice(0, -1);
            } else if (/[\w\s]/.test(key) && game.currentInput.length < 20) {
                game.currentInput += key;
            }
        } else if (game.state === INVITE_PLAY && game.invitePlayState === JOIN_ROOM && game.inputActive) {
            if (keyCode === ENTER) {
                if (game.currentInput.trim() === "") {
                    game.setMessage("Room code cannot be empty!", 60);
                    return;
                }
                game.joinGameRoom(game.currentInput.trim().toUpperCase());
                game.inputActive = false;
                game.currentInput = "";
            } else if (keyCode === BACKSPACE) {
                game.currentInput = game.currentInput.slice(0, -1);
            } else if (/[\w]/.test(key) && game.currentInput.length < 6) {
                game.currentInput += key.toUpperCase();
            }
        } else if (game.state === INVITE_PLAY && game.invitePlayState === CREATE_ROOM) {
            if (keyCode === UP_ARROW) {
                game.selectedMenuItem = (game.selectedMenuItem - 1 + 2) % 2;
            } else if (keyCode === DOWN_ARROW) {
                game.selectedMenuItem = (game.selectedMenuItem + 1) % 2;
            } else if (keyCode === ENTER) {
                if (game.selectedMenuItem === 0) {
                    game.invitePlayState = WAITING;
                    game.createGameRoom();
                } else if (game.selectedMenuItem === 1) {
                    game.invitePlayState = JOIN_ROOM;
                    game.inputActive = true;
                    game.currentInput = "";
                }
            } else if (key === '1' || key === '2') {
                game.selectedMenuItem = parseInt(key) - 1;
                if (game.selectedMenuItem === 0) {
                    game.invitePlayState = WAITING;
                    game.createGameRoom();
                } else if (game.selectedMenuItem === 1) {
                    game.invitePlayState = JOIN_ROOM;
                    game.inputActive = true;
                    game.currentInput = "";
                }
            } else if (key === 'm' || key === 'M') {
                game.state = MENU;
                game.setMessage("Returned to menu", 60);
                if (game.socket) {
                    game.socket.disconnect();
                    game.socket = null;
                }
            } else if (key === 'q' || key === 'Q') {
                window.close();
            }
        } else if (game.state === INVITE_PLAY && game.invitePlayState === WAITING) {
            if (key === 'm' || key === 'M') {
                game.state = MENU;
                game.setMessage("Returned to menu", 60);
                if (game.socket) {
                    game.socket.disconnect();
                    game.socket = null;
                }
            } else if (key === 'q' || key === 'Q') {
                window.close();
            }
        } else if (game.state === PLAYING && (game.gameMode === SINGLE_PLAYER || game.gameMode === LOCAL_MULTIPLAYER)) {
            if (key === 'z' || key === 'Z') {
                game.undoMove();
            } else if (key === 'y' || key === 'Y') {
                game.redoMove();
            } else if (key === 'b' || key === 'B' && game.aiDifficulty === HARD) {
                game.useMinimax = false;
                game.useMcts = false;
                game.setMessage("Switched to BFS", 60);
            } else if (key === 'm' || key === 'M' && game.aiDifficulty === HARD) {
                game.useMinimax = true;
                game.useMcts = false;
                game.setMessage("Switched to Minimax", 60);
            } else if (key === 't' || key === 'T' && game.aiDifficulty === HARD) {
                game.useMinimax = false;
                game.useMcts = true;
                game.setMessage("Switched to MCTS", 60);
            } else if (key === 'h' || key === 'H') {
                game.requestHint();
            } else if (key === 'v' || key === 'V') {
                game.showBfs = !game.showBfs;
                game.setMessage(`BFS Viz: ${game.showBfs ? 'ON' : 'OFF'}`, 60);
            } else if (key === 'g' || key === 'G') {
                game.giveUp();
            }
        } else if (game.state === GAME_OVER) {
            if (key === 'r' || key === 'R') {
                const overlay = document.querySelector('.game-overlay');
                if (overlay) overlay.remove();
                game.resetGame();
                game.state = game.gameMode === ONLINE_MULTIPLAYER ? INVITE_PLAY : PLAYING;
                game.invitePlayState = game.gameMode === ONLINE_MULTIPLAYER ? WAITING : CREATE_ROOM;
                game.setMessage("Game restarted", 60);
                if (game.gameMode === ONLINE_MULTIPLAYER) {
                    game.createGameRoom();
                }
            } else if (key === 'm' || key === 'M') {
                const overlay = document.querySelector('.game-overlay');
                if (overlay) overlay.remove();
                game.resetGame();
                game.state = MENU;
                game.setMessage("Returned to menu", 60);
                if (game.socket) {
                    game.socket.disconnect();
                    game.socket = null;
                }
            } else if (key === 'q' || key === 'Q') {
                const overlay = document.querySelector('.game-overlay');
                if (overlay) overlay.remove();
                window.close();
            }
        }
    }
}
