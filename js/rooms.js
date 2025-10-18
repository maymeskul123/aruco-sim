class RoomManager {
    constructor() {
        this.rooms = {
            1: { 
                name: "Комната 1", 
                x: 300, y: 100, 
                width: 200, height: 150, 
                connections: { right: 2, left: 4 } 
            },
            2: { 
                name: "Комната 2", 
                x: 550, y: 200, 
                width: 150, height: 200, 
                connections: { left: 3 } 
            },
            3: { 
                name: "Комната 3", 
                x: 350, y: 350, 
                width: 150, height: 150, 
                connections: {} 
            },
            4: { 
                name: "Комната 4", 
                x: 100, y: 200, 
                width: 150, height: 200, 
                connections: { right: 5 } 
            },
            5: { 
                name: "Комната 5", 
                x: 50, y: 350, 
                width: 150, height: 150, 
                connections: {} 
            }
        };
    }

    drawRooms(ctx) {
        // Очищаем canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Рисуем соединения между комнатами
        this.drawConnections(ctx);
        
        // Рисуем комнаты
        for (const roomId in this.rooms) {
            this.drawRoom(ctx, this.rooms[roomId], roomId);
        }
    }

    drawRoom(ctx, room, roomId) {
        // Рисуем прямоугольник комнаты
        ctx.fillStyle = '#e8f4f8';
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.fillRect(room.x, room.y, room.width, room.height);
        ctx.strokeRect(room.x, room.y, room.width, room.height);
        
        // Добавляем название комнаты
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(room.name, room.x + room.width/2, room.y + 25);
        
        // Добавляем номер комнаты
        ctx.font = 'bold 24px Arial';
        ctx.fillText(roomId, room.x + room.width/2, room.y + room.height/2 + 8);
    }

    drawConnections(ctx) {
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 3;
        
        // Рисуем все возможные соединения
        for (const roomId in this.rooms) {
            const room = this.rooms[roomId];
            
            for (const direction in room.connections) {
                const targetRoomId = room.connections[direction];
                const targetRoom = this.rooms[targetRoomId];
                
                const start = this.getConnectionPoint(room, direction);
                const end = this.getConnectionPoint(targetRoom, this.getReverseDirection(direction));
                
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
                
                // Стрелка направления
                this.drawArrow(ctx, start, end);
            }
        }
    }

    drawArrow(ctx, start, end) {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        
        if (length < 50) return; // Не рисуем стрелки для коротких соединений
        
        const arrowHeadLength = 15;
        const arrowHeadAngle = Math.PI / 6;
        
        const midX = start.x + (end.x - start.x) * 0.5;
        const midY = start.y + (end.y - start.y) * 0.5;
        
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(midX, midY);
        ctx.lineTo(
            midX - arrowHeadLength * Math.cos(angle - arrowHeadAngle),
            midY - arrowHeadLength * Math.sin(angle - arrowHeadAngle)
        );
        ctx.lineTo(
            midX - arrowHeadLength * Math.cos(angle + arrowHeadAngle),
            midY - arrowHeadLength * Math.sin(angle + arrowHeadAngle)
        );
        ctx.closePath();
        ctx.fill();
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
        const opposites = { 
            left: 'right', 
            right: 'left', 
            up: 'down', 
            down: 'up' 
        };
        return opposites[direction] || direction;
    }

    findPath(startRoomId, endRoomId) {
        if (startRoomId === endRoomId) {
            return [startRoomId];
        }
        
        // Алгоритм BFS для поиска пути
        const queue = [[startRoomId]];
        const visited = new Set([startRoomId]);
        
        while (queue.length > 0) {
            const path = queue.shift();
            const currentRoomId = path[path.length - 1];
            
            if (currentRoomId === endRoomId) {
                return path;
            }
            
            const currentRoom = this.rooms[currentRoomId];
            
            // Проверяем все соединения из текущей комнаты
            for (const direction in currentRoom.connections) {
                const nextRoomId = currentRoom.connections[direction];
                
                if (!visited.has(nextRoomId)) {
                    visited.add(nextRoomId);
                    const newPath = [...path, nextRoomId];
                    queue.push(newPath);
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