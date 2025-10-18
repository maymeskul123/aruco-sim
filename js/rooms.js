class RoomManager {
    constructor() {
        this.rooms = {
            1: { name: "Комната 1", x: 400, y: 100, width: 200, height: 150, connections: { left: 4, right: 2 } },
            2: { name: "Комната 2", x: 650, y: 200, width: 150, height: 200, connections: { left: 3 } },
            3: { name: "Комната 3", x: 450, y: 350, width: 150, height: 150, connections: {} },
            4: { name: "Комната 4", x: 150, y: 200, width: 150, height: 200, connections: { right: 5 } },
            5: { name: "Комната 5", x: 50, y: 350, width: 150, height: 150, connections: {} }
        };
        
        this.connections = [
            { from: 1, to: 2, type: 'right' },
            { from: 1, to: 4, type: 'left' },
            { from: 2, to: 3, type: 'left' },
            { from: 4, to: 5, type: 'right' }
        ];
    }

    drawRooms(ctx) {
        // Очищаем canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Рисуем соединения между комнатами
        this.drawConnections(ctx);
        
        // Рисуем комнаты
        for (const roomId in this.rooms) {
            this.drawRoom(ctx, this.rooms[roomId]);
        }
    }

    drawRoom(ctx, room) {
        // Рисуем прямоугольник комнаты
        ctx.fillStyle = '#e8f4f8';
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.fillRect(room.x, room.y, room.width, room.height);
        ctx.strokeRect(room.x, room.y, room.width, room.height);
        
        // Добавляем название комнаты
        ctx.fillStyle = '#2c3e50';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(room.name, room.x + room.width/2, room.y + 25);
        
        // Добавляем номер комнаты
        ctx.font = 'bold 20px Arial';
        ctx.fillText(roomId, room.x + room.width/2, room.y + room.height/2 + 8);
    }

    drawConnections(ctx) {
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        this.connections.forEach(conn => {
            const fromRoom = this.rooms[conn.from];
            const toRoom = this.rooms[conn.to];
            
            const start = this.getConnectionPoint(fromRoom, conn.type);
            const end = this.getConnectionPoint(toRoom, this.getReverseDirection(conn.type));
            
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        });
        
        ctx.setLineDash([]);
    }

    getConnectionPoint(room, direction) {
        switch(direction) {
            case 'left':
                return { x: room.x, y: room.y + room.height/2 };
            case 'right':
                return { x: room.x + room.width, y: room.y + room.height/2 };
            case 'up':
                return { x: room.x + room.width/2, y: room.y };
            case 'down':
                return { x: room.x + room.width/2, y: room.y + room.height };
            default:
                return { x: room.x + room.width/2, y: room.y + room.height/2 };
        }
    }

    getReverseDirection(direction) {
        const opposites = { left: 'right', right: 'left', up: 'down', down: 'up' };
        return opposites[direction] || direction;
    }

    findPath(startRoomId, endRoomId) {
        // Простой алгоритм поиска пути (BFS)
        const queue = [[startRoomId]];
        const visited = new Set([startRoomId]);
        
        while (queue.length > 0) {
            const path = queue.shift();
            const currentRoomId = path[path.length - 1];
            
            if (currentRoomId === endRoomId) {
                return path;
            }
            
            const currentRoom = this.rooms[currentRoomId];
            for (const direction in currentRoom.connections) {
                const nextRoomId = currentRoom.connections[direction];
                if (!visited.has(nextRoomId)) {
                    visited.add(nextRoomId);
                    queue.push([...path, nextRoomId]);
                }
            }
        }
        
        return null; // Путь не найден
    }

    getRoomCenter(roomId) {
        const room = this.rooms[roomId];
        return {
            x: room.x + room.width / 2,
            y: room.y + room.height / 2
        };
    }
}