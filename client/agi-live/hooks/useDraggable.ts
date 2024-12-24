import { useRef, useState } from 'react';
import { Position, State } from '../types';

export const useDraggable = (initX: number, initY: number, scale: number) => {
    const [position, setPosition] = useState<Position>({ x: initX, y: initY });
    const state = useRef<State>({
        isDragging: false,
        lastX: 0,
        lastY: 0,
        velocityX: 0,
        velocityY: 0,
        timestamp: 0,
        animationFrameId: 0,
        position: { x: initX, y: initY }
    }).current;

    const updatePosition = (canvas: HTMLCanvasElement, x: number, y: number) => {
        state.position.x = x;
        state.position.y = y;
        setPosition({ x, y });
        canvas.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    };

    const startInertia = (canvas: HTMLCanvasElement) => {
        const FRICTION = 0.85;
        const MINIMUM_VELOCITY = 0.1;

        const animate = () => {
            if (Math.abs(state.velocityX) > MINIMUM_VELOCITY ||
                Math.abs(state.velocityY) > MINIMUM_VELOCITY) {
                state.velocityX *= FRICTION;
                state.velocityY *= FRICTION;
                updatePosition(
                    canvas,
                    state.position.x + state.velocityX,
                    state.position.y + state.velocityY
                );
                state.animationFrameId = requestAnimationFrame(animate);
            }
        };

        animate();
    };

    return { state, position, updatePosition, startInertia };
};
