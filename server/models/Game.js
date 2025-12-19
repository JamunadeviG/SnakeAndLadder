const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Socket ID or User ID
    name: { type: String, required: true },
    color: { type: String, required: true },
    position: { type: Number, default: 0 },
    isTurn: { type: Boolean, default: false },
    hasWon: { type: Boolean, default: false },
});

const gameSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    players: [playerSchema],
    gameState: {
        type: String,
        enum: ['waiting', 'playing', 'finished'],
        default: 'waiting'
    },
    currentTurnIndex: { type: Number, default: 0 },
    winner: { type: String, default: null }, // Player Name
    boardHistory: [{
        playerId: String,
        from: Number,
        to: Number,
        roll: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', gameSchema);
