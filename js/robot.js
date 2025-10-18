class Robot {
    constructor(roomManager) {
        this.roomManager = roomManager;
        this.currentRoom = 1;
        this.position = roomManager.getRoomCenter(1);
        this.targetPosition = null;
        this.isMoving = false;
        this.speed = 3;
        this.detectedMarkers = new Set();
    }

    draw(ctx) {
        // Рисуем робота как круг
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Добавляем детали робота
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(this.position.x - 5, this.position.y - 5, 3, 0, Math.PI * 2);
        ctx.arc(this.position.x + 5, this.position.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    moveToRoom(targetRoomId) {
        const path = this.roomManager.findPath(this.currentRoom, targetRoomId);
        if (!path || path.length < 2) return false;
        
        this.targetPath = path;
        this.currentPathIndex = 1;
        this.moveToNextRoomInPath();
        return true;
    }

    moveToNextRoomInPath() {
        if (this.currentPathIndex >= this.targetPath.length) {
            this.isMoving = false;
            return;
        }
        
        const nextRoomId = this.targetPath[this.currentPathIndex];
        this.targetPosition = this.roomManager.getRoomCenter(nextRoomId);
        this.isMoving = true;
    }

    update() {
        if (!this.isMoving || !this.targetPosition) return;
        
        const dx = this.targetPosition.x - this.position.x;
        const dy = this.targetPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.speed) {
            this.position = { ...this.targetPosition };
            this.currentRoom = this.targetPath[this.currentPathIndex];
            this.currentPathIndex++;
            this.moveToNextRoomInPath();
            
            // Обновляем статус
            this.updateStatus();
        } else {
            this.position.x += (dx / distance) * this.speed;
            this.position.y += (dy / distance) * this.speed;
        }
    }

    updateStatus() {
        const statusElement = document.getElementById('robot-status');
        statusElement.textContent = `Текущее положение: ${this.roomManager.rooms[this.currentRoom].name}`;
        
        // Обновляем обнаруженные метки
        this.updateDetectedMarkers();
    }

    updateDetectedMarkers() {
        const detectionElement = document.getElementById('detection-status');
        if (this.detectedMarkers.size > 0) {
            const markersList = Array.from(this.detectedMarkers).join(', ');
            detectionElement.textContent = `Обнаруженные метки: ${markersList}`;
        } else {
            detectionElement.textContent = 'Обнаруженные метки: Нет';
        }
    }

    detectMarker(marker) {
        this.detectedMarkers.add(marker);
        this.updateDetectedMarkers();
    }
}