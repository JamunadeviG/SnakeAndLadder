const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        socket.on('playerRolling', ({ roomId, playerId }) => {
            socket.to(roomId).emit('playerRolling', { playerId });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

module.exports = socketHandler;
