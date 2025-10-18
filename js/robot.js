class Robot {
    constructor(roomManager) {
        this.roomManager = roomManager;
        this.currentRoom = 1;
        this.position = roomManager.getRoomCenter(1);
        this.targetPosition = null;
        this.isMoving = false;
        this.movementCompleted = true;
        this.speed = 0.8; // пикселей в миллисекунду
        this.detectedMarkers = new Set();
        this.targetPath = null;
        this.currentPathIndex = 0;
    }

    draw(ctx) {
        // Рисуем робота как круг с направлением
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Добавляем направление движения
        if (this.targetPosition && this.isMoving) {
            const angle = Math.atan2(
                this.targetPosition.y - this.position.y,
                this.targetPosition.x - this.position.x
            );
            
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(
                this.position.x + Math.cos(angle) * 20,
                this.position.y + Math.sin(angle) * 20
            );
            ctx.stroke();
        }
        
        // Глаза робота
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(this.position.x - 5, this.position.y - 5, 3, 0, Math.PI * 2);
        ctx.arc(this.position.x + 5, this.position.y - 5, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    moveToRoom(targetRoomId) {
        const path = this.roomManager.findPath(this.currentRoom, targetRoomId);
        if (!path || path.length < 2) {
            console.error('Путь не найден!');
            return false;
        }
        
        this.targetPath = path;
        this.currentPathIndex = 1;
        this.movementCompleted = false;
        this.targetPosition = this.roomManager.getRoomCenter(this.targetPath[this.currentPathIndex]);
        this.isMoving = true;
        
        console.log('Найден путь:', path);
        return true;
    }

    update(deltaTime) {
        if (!this.isMoving || !this.targetPosition) return;
        
        const moveDistance = this.speed * deltaTime;
        const dx = this.targetPosition.x - this.position.x;
        const dy = this.targetPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= moveDistance) {
            // Достигли целевой позиции
            this.position = { ...this.targetPosition };
            this.currentRoom = this.targetPath[this.currentPathIndex];
            
            // Переходим к следующей комнате в пути
            this.currentPathIndex++;
            
            if (this.currentPathIndex < this.targetPath.length) {
                // Продолжаем движение к следующей комнате
                this.targetPosition = this.roomManager.getRoomCenter(this.targetPath[this.currentPathIndex]);
                console.log(`Перемещаемся в комнату ${this.targetPath[this.currentPathIndex]}`);
            } else {
                // Маршрут завершен
                this.isMoving = false;
                this.movementCompleted = true;
                this.targetPath = null;
                this.currentPathIndex = 0;
                console.log('Маршрут завершен!');
            }
            
            this.updateStatus();
        } else {
            // Продолжаем движение
            this.position.x += (dx / distance) * moveDistance;
            this.position.y += (dy / distance) * moveDistance;
        }
    }

    updateStatus() {
        const statusElement = document.getElementById('robot-status');
        if (this.isMoving && this.targetPath) {
            const nextRoom = this.targetPath[this.currentPathIndex];
            statusElement.textContent = 
                `Движение: ${this.roomManager.rooms[this.currentRoom].name} → ${this.roomManager.rooms[nextRoom].name}`;
        } else {
            statusElement.textContent = 
                `Текущее положение: ${this.roomManager.rooms[this.currentRoom].name}`;
        }
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

    detectMarker(markerLabel) {
        this.detectedMarkers.add(markerLabel);
        this.updateDetectedMarkers();
        
        // Визуальная обратная связь
        const statusElement = document.getElementById('robot-status');
        const originalText = statusElement.textContent;
        statusElement.textContent = `Обнаружена метка: ${markerLabel}`;
        
        setTimeout(() => {
            statusElement.textContent = originalText;
        }, 2000);
    }

    reset() {
        this.currentRoom = 1;
        this.position = this.roomManager.getRoomCenter(1);
        this.targetPosition = null;
        this.isMoving = false;
        this.movementCompleted = true;
        this.targetPath = null;
        this.currentPathIndex = 0;
        this.detectedMarkers.clear();
        this.updateStatus();
        this.updateDetectedMarkers();
    }
}