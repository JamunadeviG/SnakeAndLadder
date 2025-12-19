import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import Board from '../components/Board';
import Dice from '../components/Dice';
import ErrorBoundary from '../components/ErrorBoundary';

// Use relative path for socket, let proxy handle it or fallback
const socket = io({ path: '/socket.io' });

const GameRoomContent = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [game, setGame] = useState(null);
    const [rolling, setRolling] = useState(false);
    const [lastRoll, setLastRoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Retrieve player identity from storage
    const playerId = localStorage.getItem(`player_${roomId}`);
    // const playerName = localStorage.getItem(`name_${roomId}`);

    useEffect(() => {
        if (!playerId) {
            alert("You need to join this game first!");
            navigate('/');
            return;
        }

        const fetchGame = async () => {
            try {
                const res = await axios.get(`/api/game/${roomId}`);
                setGame(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching game:", err);
                setError("Failed to load game data. It might not exist.");
                setLoading(false);
            }
        };

        fetchGame();

        socket.emit('joinRoom', roomId);

        socket.on('gameStateUpdate', (updatedGame) => {
            console.log('Game update received:', updatedGame);
            setGame(updatedGame);
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        return () => {
            socket.off('gameStateUpdate');
            socket.off('connect_error');
        };
    }, [roomId, navigate, playerId]);

    const handleRoll = async () => {
        if (!game) return;
        setRolling(true);
        try {
            const res = await axios.post('/api/game/roll', {
                roomId,
                playerId
            });
            setLastRoll(res.data.roll);
            console.log("Roll result:", res.data);
        } catch (err) {
            console.error("Roll error:", err);
            alert(err.response?.data?.error || 'Roll failed');
        } finally {
            setRolling(false);
        }
    };

    if (loading) return <div className="text-white text-center mt-20 text-xl">Loading game environment...</div>;
    if (error) return <div className="text-red-400 text-center mt-20 text-xl">{error} <br /><button onClick={() => navigate('/')} className="mt-4 text-white underline">Go Home</button></div>;
    if (!game) return null;

    const currentPlayer = game.players.find(p => p.id === playerId);
    const isMyTurn = game.players[game.currentTurnIndex]?.id === playerId;
    const currentTurnPlayer = game.players[game.currentTurnIndex];

    return (
        <div className="min-h-screen bg-slate-800 p-2 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-center">

            {/* Sidebar / Info */}
            <div className="bg-white p-4 rounded-lg shadow-lg w-full md:w-80 h-fit">
                <h2 className="text-xl font-bold mb-4 text-slate-900 border-b pb-2">Room: {roomId}</h2>

                <div className="space-y-2 mb-6">
                    <h3 className="font-semibold text-slate-700">Players:</h3>
                    {game.players.map((p, i) => (
                        <div key={p.id} className={`flex items-center justify-between p-2 rounded ${i === game.currentTurnIndex ? 'bg-yellow-100 border border-yellow-300' : 'bg-slate-50'}`}>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color }}></div>
                                <span className={p.id === playerId ? 'font-bold' : ''}>
                                    {p.name} {p.id === playerId && '(You)'}
                                </span>
                            </div>
                            <span className="font-mono text-lg">{p.position}</span>
                        </div>
                    ))}
                </div>

                <div className="text-center p-4 bg-slate-100 rounded-lg">
                    <h3 className="text-slate-600 mb-2">Current Turn</h3>
                    <div className="text-xl font-bold text-blue-600 mb-4">
                        {isMyTurn ? "YOUR TURN!" : `${currentTurnPlayer?.name}'s Turn`}
                    </div>

                    <div className="flex justify-center mb-4">
                        <Dice
                            value={lastRoll}
                            rolling={rolling}
                            onRoll={handleRoll}
                            disabled={!isMyTurn || rolling || game.gameState === 'finished'}
                        />
                    </div>

                    {lastRoll && (
                        <div className="mt-4 text-slate-800">
                            Last Roll: <span className="font-bold text-2xl">{lastRoll}</span>
                        </div>
                    )}
                </div>

                {game.gameState === 'finished' && (
                    <div className="mt-6 p-4 bg-yellow-400 text-yellow-900 rounded font-bold text-center animate-bounce">
                        🏆 Winner: {game.winner} 🏆
                    </div>
                )}
            </div>

            {/* Game Board */}
            <Board players={game.players} />

        </div>
    );
};

export default function GameRoom() {
    return (
        <ErrorBoundary>
            <GameRoomContent />
        </ErrorBoundary>
    );
}
