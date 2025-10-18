class MarkerManager {
    constructor(roomManager) {
        this.roomManager = roomManager;
        this.markers = new Map(); // roomId -> array of markers
        this.initializeDefaultMarkers();
    }

    initializeDefaultMarkers() {
        // Добавляем минимально необходимые метки по умолчанию
        this.addMarker(1, { x: 450, y: 120, type: 'landmark', label: 'Вход' });
        this.addMarker(2, { x: 700, y: 250, type: 'landmark', label: 'Поворот' });
        this.addMarker(4, { x: 200, y: 250, type: 'landmark', label: 'Развилка' });
    }

    addMarker(roomId, marker) {
        if (!this.markers.has(roomId)) {
            this.markers.set(roomId, []);
        }
        this.markers.get(roomId).push({
            ...marker,
            id: Date.now() + Math.random() // Простой ID
        });
    }

    drawMarkers(ctx) {
        for (const [roomId, roomMarkers] of this.markers) {
            roomMarkers.forEach(marker => {
                this.drawMarker(ctx, marker);
            });
        }
    }

    drawMarker(ctx, marker) {
        let color, symbol;
        
        switch(marker.type) {
            case 'landmark':
                color = '#2ecc71';
                symbol = '★';
                break;
            case 'target':
                color = '#e74c3c';
                symbol = '⚑';
                break;
            case 'hazard':
                color = '#f39c12';
                symbol = '⚠';
                break;
            default:
                color = '#95a5a6';
                symbol = '•';
        }
        
        ctx.fillStyle = color;
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(symbol, marker.x, marker.y);
        
        // Подпись метки
        ctx.font = '12px Arial';
        ctx.fillStyle = '#2c3e50';
        ctx.fillText(marker.label, marker.x, marker.y + 20);
    }

    clearAllMarkers() {
        this.markers.clear();
        this.initializeDefaultMarkers(); // Восстанавливаем метки по умолчанию
    }

    getMarkersInRoom(roomId) {
        return this.markers.get(roomId) || [];
    }

    handleCanvasClick(x, y, markerType, currentRoom) {
        // Проверяем, попадает ли клик в текущую комнату
        const room = this.roomManager.rooms[currentRoom];
        if (x >= room.x && x <= room.x + room.width && 
            y >= room.y && y <= room.y + room.height) {
            
            const label = prompt('Введите название метки:', `Метка ${this.getMarkersInRoom(currentRoom).length + 1}`);
            if (label) {
                this.addMarker(currentRoom, {
                    x: x,
                    y: y,
                    type: markerType,
                    label: label
                });
                return true;
            }
        }
        return false;
    }
}