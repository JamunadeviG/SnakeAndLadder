import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const Home = () => {
    const [name, setName] = useState('');
    const [roomId, setRoomId] = useState('');
    const navigate = useNavigate();

    const handleCreate = async () => {
        try {
            const res = await axios.post(`${API_URL}/game/create`, { playerName: name });
            const { roomId, players } = res.data;
            const myPlayerId = players[0].id; // Host is first

            localStorage.setItem(`player_${roomId}`, myPlayerId);
            localStorage.setItem(`name_${roomId}`, name);

            navigate(`/game/${roomId}`);
        } catch (err) {
            console.error(err);
            alert(`Error creating game.\n\nTrying to connect to: ${API_URL}\n\nDetails: ${err.message}`);
        }
    };

    const handleJoin = async () => {
        try {
            const res = await axios.post(`${API_URL}/game/join`, { roomId, playerName: name });
            const { players } = res.data;

            // We need to identify which player we are. 
            // Simplified: we assume we are the last one added if we just joined.
            // Ideally backend returns "yourPlayerId".
            const myPlayerId = players[players.length - 1].id;

            localStorage.setItem(`player_${roomId}`, myPlayerId);
            localStorage.setItem(`name_${roomId}`, name);

            navigate(`/game/${roomId}`);
        } catch (err) {
            console.error(err);
            alert('Error joining game');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-8 text-slate-800">Snake & Ladder</h1>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter your name"
                        className="w-full p-3 border rounded text-lg text-black"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />

                    <div className="border-t pt-4">
                        <button
                            onClick={handleCreate}
                            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-semibold mb-2 disabled:bg-gray-300"
                        >
                            Create New Game
                        </button>
                        <div className="text-center text-gray-500 my-2">- OR -</div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Room Enter ID"
                                className="flex-1 p-3 border rounded text-black"
                                value={roomId}
                                onChange={e => setRoomId(e.target.value)}
                            />
                            <button
                                onClick={handleJoin}
                                disabled={!roomId}
                                className="bg-green-600 text-white px-6 rounded hover:bg-green-700 font-semibold disabled:bg-gray-300"
                            >
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
