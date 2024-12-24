// types.ts
export interface Position {
    x: number;
    y: number;
}

export interface State {
    isDragging: boolean;
    lastX: number;
    lastY: number;
    velocityX: number;
    velocityY: number;
    timestamp: number;
    animationFrameId: number;
    position: Position;
}
