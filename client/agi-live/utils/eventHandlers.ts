import {State} from '../types';
import {screenCaptureManager} from "../ScreenCaptureManager";
import {CaptureType} from "../CaptureType";
import {showSpeech} from "../SpeechBubble";

export const createEventHandlers = (
    canvas: HTMLCanvasElement,
    state: State,
    updatePosition: (canvas: HTMLCanvasElement, x: number, y: number) => void,
    startInertia: (canvas: HTMLCanvasElement) => void,
) => {
    const handleStart = (clientX: number, clientY: number) => {
        cancelAnimationFrame(state.animationFrameId);
        state.isDragging = true;
        state.lastX = clientX;
        state.lastY = clientY;
        state.timestamp = Date.now();
        canvas.style.transition = 'none';
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!state.isDragging) return;

        const deltaX = clientX - state.lastX;
        const deltaY = clientY - state.lastY;
        const timestamp = Date.now();
        const timeDelta = timestamp - state.timestamp;

        if (timeDelta > 0) {
            state.velocityX = deltaX / timeDelta * 16;
            state.velocityY = deltaY / timeDelta * 16;
        }

        updatePosition(
            canvas,
            state.position.x + deltaX,
            state.position.y + deltaY
        );

        state.lastX = clientX;
        state.lastY = clientY;
        state.timestamp = timestamp;
    };

    const handleEnd = () => {
        state.isDragging = false;
        startInertia(canvas);
    };

    return {
        handleMouseDown: (e: MouseEvent) => {
            if (e.button !== 0) return;
            e.preventDefault();
            screenCaptureManager.captureScreenOnce(CaptureType.Touch);
            handleStart(e.clientX, e.clientY);
        },
        handleMouseMove: (e: MouseEvent) => {
            e.preventDefault();
            handleMove(e.clientX, e.clientY);
        },
        handleMouseUp: (e: MouseEvent) => {
            if (e.button !== 0) return;
            handleEnd();
        },
        handleTouchStart: (e: TouchEvent) => {
            e.preventDefault();
            screenCaptureManager.captureScreenOnce(CaptureType.Touch);
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY);
        },
        handleTouchMove: (e: TouchEvent) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        },
        handleTouchEnd: () => {
            handleEnd();
        }
    };
};
