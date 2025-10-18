class RobotSimulatorApp {
    constructor() {
        this.roomManager = new RoomManager();
        this.markerManager = new MarkerManager(this.roomManager);
        this.robot = new Robot(this.roomManager);
        
        this.canvas = document.getElementById('rooms-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.isPlacingMarker = false;
        this.selectedMarkerType = 'landmark';
        
        this.initializeEventListeners();
        this.animationFrameId = null;
        this.lastTimestamp = 0;
        
        this.startAnimation();
    }

    initializeEventListeners() {
        // Кнопка запуска робота
        document.getElementById('start-btn').addEventListener('click', () => {
            const startRoom = parseInt(document.getElementById('start-room').value);
            const endRoom = parseInt(document.getElementById('end-room').value);
            
            if (startRoom === endRoom) {
                alert('Робот уже в целевой комнате!');
                return;
            }
            
            this.robot.currentRoom = startRoom;
            this.robot.position = this.roomManager.getRoomCenter(startRoom);
            
            if (this.robot.moveToRoom(endRoom)) {
                document.getElementById('start-btn').disabled = true;
                document.getElementById('robot-status').textContent = 
                    `Робот начал движение из ${this.roomManager.rooms[startRoom].name} в ${this.roomManager.rooms[endRoom].name}`;
            } else {
                alert('Путь не найден!');
            }
        });

        // Кнопка добавления метки
        document.getElementById('add-marker-btn').addEventListener('click', () => {
            this.isPlacingMarker = true;
            this.selectedMarkerType = document.getElementById('marker-type').value;
            document.getElementById('placement-hint').style.display = 'block';
        });

        // Обработка кликов по canvas для размещения меток
        this.canvas.addEventListener('click', (e) => {
            if (this.isPlacingMarker) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (this.markerManager.handleCanvasClick(x, y, this.selectedMarkerType, this.robot.currentRoom)) {
                    document.getElementById('placement-hint').style.display = 'none';
                    this.isPlacingMarker = false;
                } else {
                    alert('Метку можно размещать только в текущей комнате робота!');
                }
            }
        });

        // Кнопка очистки меток
        document.getElementById('clear-markers-btn').addEventListener('click', () => {
            this.markerManager.clearAllMarkers();
            this.robot.detectedMarkers.clear();
            this.robot.updateDetectedMarkers();
        });

        // Сброс робота
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.robot.reset();
            document.getElementById('start-btn').disabled = false;
        });
    }

    startAnimation() {
        const animate = (timestamp) => {
            const deltaTime = timestamp - this.lastTimestamp || 0;
            this.lastTimestamp = timestamp;
            
            this.update(deltaTime);
            this.render();
            
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        this.animationFrameId = requestAnimationFrame(animate);
    }

    update(deltaTime) {
        this.robot.update(deltaTime);
        
        // Если робот завершил движение
        if (this.robot.movementCompleted && document.getElementById('start-btn').disabled) {
            document.getElementById('start-btn').disabled = false;
            document.getElementById('robot-status').textContent = 
                `Робот прибыл в ${this.roomManager.rooms[this.robot.currentRoom].name}`;
        }
        
        // Проверяем обнаружение меток в текущей комнате
        const currentMarkers = this.markerManager.getMarkersInRoom(this.robot.currentRoom);
        currentMarkers.forEach(marker => {
            const distance = Math.sqrt(
                Math.pow(marker.x - this.robot.position.x, 2) + 
                Math.pow(marker.y - this.robot.position.y, 2)
            );
            
            if (distance < 40 && !this.robot.detectedMarkers.has(marker.label)) {
                this.robot.detectMarker(marker.label);
            }
        });
    }

    render() {
        this.roomManager.drawRooms(this.ctx);
        this.markerManager.drawMarkers(this.ctx);
        this.robot.draw(this.ctx);
        
        // Рисуем путь, если робот движется
        if (this.robot.targetPath) {
            this.drawPath(this.robot.targetPath);
        }
    }

    drawPath(path) {
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 3]);
        
        this.ctx.beginPath();
        for (let i = 0; i < path.length - 1; i++) {
            const start = this.roomManager.getRoomCenter(path[i]);
            const end = this.roomManager.getRoomCenter(path[i + 1]);
            
            if (i === 0) {
                this.ctx.moveTo(start.x, start.y);
            }
            this.ctx.lineTo(end.x, end.y);
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.robotSimulator = new RobotSimulatorApp();
});