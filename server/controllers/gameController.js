const Game = require('../models/Game');
const { v4: uuidv4 } = require('uuid'); // Assume we usually install uuid, or use simple random string

// Simple random ID generator if uuid is not installed, but let's assume we might need it.
// For now, using Math.random for simplicity or adding uuid to package.
const generateRoomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

exports.createGame = async (req, res) => {
    try {
        const { playerName } = req.body;
        const roomId = generateRoomId();

        // Create new game logic
        const newGame = new Game({
            roomId,
            players: [{
                id: 'host-' + Date.now(), // Temporary ID until socket connects
                name: playerName || 'Player 1',
                color: 'red', // Default colors: red, blue, green, yellow
                isTurn: true // Host starts first? Or randomize
            }],
            gameState: 'waiting'
        });

        await newGame.save();
        res.status(201).json(newGame);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.joinGame = async (req, res) => {
    try {
        const { roomId, playerName } = req.body;
        const game = await Game.findOne({ roomId });

        if (!game) return res.status(404).json({ error: 'Game not found' });
        if (game.gameState !== 'waiting') return res.status(400).json({ error: 'Game already in progress' });
        if (game.players.length >= 4) return res.status(400).json({ error: 'Room full' });

        const colors = ['red', 'blue', 'green', 'yellow'];
        const assignedColor = colors[game.players.length];

        game.players.push({
            id: 'player-' + Date.now(),
            name: playerName || `Player ${game.players.length + 1}`,
            color: assignedColor,
            isTurn: false,
            position: 0,
            hasWon: false
        });

        await game.save();

        if (req.io) {
            req.io.to(roomId).emit('gameStateUpdate', game);
        }

        res.status(200).json(game);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const { SNAKES, LADDERS } = require('../utils/constants');

exports.rollDice = async (req, res) => {
    try {
        const { roomId, playerId } = req.body;
        const game = await Game.findOne({ roomId });

        if (!game) return res.status(404).json({ error: 'Game not found' });

        // Find player index
        const playerIndex = game.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return res.status(404).json({ error: 'Player not found' });

        // Check turn
        if (playerIndex !== game.currentTurnIndex) {
            return res.status(400).json({ error: 'Not your turn' });
        }

        const roll = Math.floor(Math.random() * 6) + 1;
        let currentPlayer = game.players[playerIndex];
        let newPosition = currentPlayer.position + roll;

        // Exact landing rule
        if (newPosition > 100) {
            newPosition = currentPlayer.position; // Stay put if overshot
        } else {
            // Check Snakes and Ladders
            if (SNAKES[newPosition]) {
                newPosition = SNAKES[newPosition];
            } else if (LADDERS[newPosition]) {
                newPosition = LADDERS[newPosition];
            }
        }

        // Update position
        const oldPosition = currentPlayer.position;
        currentPlayer.position = newPosition;

        // Check Win
        if (newPosition === 100) {
            currentPlayer.hasWon = true;
            game.gameState = 'finished';
            game.winner = currentPlayer.name;
        }

        // Add to history
        game.boardHistory.push({
            playerId,
            from: oldPosition,
            to: newPosition,
            roll
        });

        // Next turn (if game not finished and also no extra turn for 6? Prompt didn't specify extra turn for 6, so standard round robin)
        if (game.gameState !== 'finished') {
            game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;
        }

        await game.save();

        // Emit socket event (accessing io instance somehow or letting client poll? Prompt asked for socket support)
        // For now, client can listen to updates. Ideally controller should emit. 
        // We can attach io to req in server.js middleware.
        if (req.io) {
            req.io.to(roomId).emit('gameStateUpdate', game);
        }

        res.json({ game, roll });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getGame = async (req, res) => {
    try {
        const { roomId } = req.params;
        const game = await Game.findOne({ roomId });
        if (!game) return res.status(404).json({ error: 'Game not found' });
        res.json(game);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
