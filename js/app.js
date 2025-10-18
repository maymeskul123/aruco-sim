class RobotSimulatorApp {
    constructor() {
        this.roomManager = new RoomManager();
        this.markerManager = new MarkerManager(this.roomManager);
        this.robot = new Robot(this.roomManager);
        
        this.canvas = document.getElementById('rooms-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.initializeEventListeners();
        this.animationFrameId = null;
        this.lastTimestamp = 0;
        
        this.startAnimation();
    }

    initializeEventListeners() {
        // Кнопка перемещения робота
        document.getElementById('move-btn').addEventListener('click', () => {
            const startRoom = parseInt(document.getElementById('start-room').value);
            const endRoom = parseInt(document.getElementById('end-room').value);
            
            this.robot.currentRoom = startRoom;
            this.robot.position = this.roomManager.getRoomCenter(startRoom);
            this.robot.moveToRoom(endRoom);
        });

        // Кнопка добавления метки
        document.getElementById('add-marker-btn').addEventListener('click', () => {
            this.isPlacingMarker = true;
            this.selectedMarkerType = document.getElementById('marker-type').value;
            alert('Кликните на карте в текущей комнате робота, чтобы разместить метку');
        });

        // Обработка кликов по canvas для размещения меток
        this.canvas.addEventListener('click', (e) => {
            if (this.isPlacingMarker) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                if (this.markerManager.handleCanvasClick(x, y, this.selectedMarkerType, this.robot.currentRoom)) {
                    this.robot.detectMarker(this.selectedMarkerType);
                }
                
                this.isPlacingMarker = false;
            }
        });

        // Кнопка очистки меток
        document.getElementById('clear-markers-btn').addEventListener('click', () => {
            this.markerManager.clearAllMarkers();
            this.robot.detectedMarkers.clear();
            this.robot.updateDetectedMarkers();
        });
    }

    startAnimation() {
        const animate = (timestamp) => {
            const deltaTime = timestamp - this.lastTimestamp;
            this.lastTimestamp = timestamp;
            
            this.update(deltaTime);
            this.render();
            
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        this.animationFrameId = requestAnimationFrame(animate);
    }

    update(deltaTime) {
        this.robot.update();
        
        // Проверяем обнаружение меток в текущей комнате
        const currentMarkers = this.markerManager.getMarkersInRoom(this.robot.currentRoom);
        currentMarkers.forEach(marker => {
            const distance = Math.sqrt(
                Math.pow(marker.x - this.robot.position.x, 2) + 
                Math.pow(marker.y - this.robot.position.y, 2)
            );
            
            if (distance < 50) { // Порог обнаружения
                this.robot.detectMarker(marker.label);
            }
        });
    }

    render() {
        this.roomManager.drawRooms(this.ctx);
        this.markerManager.drawMarkers(this.ctx);
        this.robot.draw(this.ctx);
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