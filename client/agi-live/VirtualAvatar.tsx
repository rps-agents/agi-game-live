// components/VirtualAvatar.tsx
import React, {useEffect, useRef, useState} from 'react';
import {useDraggable} from './hooks/useDraggable';
import {createEventHandlers} from './utils/eventHandlers';
import SpeechBubble, {showSpeech} from "./SpeechBubble";
import {loadLive2DModel} from "./components/LoadLive2DModel"
import {useVisibility} from "./contexts/AvatarVisibilityContext";
import {screenCaptureManager} from "./ScreenCaptureManager";

interface VirtualAvatarProps {
    scale?: number;
    initX?: number;
    initY?: number;
}

const VirtualAvatar: React.FC<VirtualAvatarProps> = ({
                                                         scale = 1.0,
                                                         initX = 100,
                                                         initY = 10
                                                     }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [initMessage] = useState("Hello！I'm Haru！");
    const {state, position, updatePosition, startInertia} = useDraggable(initX, initY, scale);
    const {isVisible} = useVisibility();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.log('Canvas not found');
            return;
        }

        // @ts-ignore
        loadLive2DModel("live2d", '/model/haru/haru_01.model.json')
            .then(() => {
                setTimeout(() => showSpeech(initMessage), 1000);
            })
            .catch((error) => {
                console.error('Failed to load Live2D model:', error);
            });

        const handlers = createEventHandlers(
            canvas,
            state,
            updatePosition,
            startInertia,
        );

        // Add event listeners
        canvas.addEventListener('mousedown', handlers.handleMouseDown);
        window.addEventListener('mousemove', handlers.handleMouseMove);
        window.addEventListener('mouseup', handlers.handleMouseUp);
        canvas.addEventListener('touchstart', handlers.handleTouchStart);
        window.addEventListener('touchmove', handlers.handleTouchMove);
        window.addEventListener('touchend', handlers.handleTouchEnd);

        // Initialize position
        updatePosition(canvas, position.x, position.y);
        screenCaptureManager.enable();

        return () => {
            cancelAnimationFrame(state.animationFrameId);
            // Remove event listeners
            canvas.removeEventListener('mousedown', handlers.handleMouseDown);
            window.removeEventListener('mousemove', handlers.handleMouseMove);
            window.removeEventListener('mouseup', handlers.handleMouseUp);
            canvas.removeEventListener('touchstart', handlers.handleTouchStart);
            window.removeEventListener('touchmove', handlers.handleTouchMove);
            window.removeEventListener('touchend', handlers.handleTouchEnd);
        };
    }, [scale, isVisible]);

    if (!isVisible) {
        screenCaptureManager.disable();
        return null;
    }

    return (
        <div style={{
            position: 'relative',
            overflow: 'visible',
            width: '1px',
            height: '1px',
        }}>
            <div style={{
                position: 'absolute',
                left: '50%',
                bottom: '100%',
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                pointerEvents: 'none',
            }}>
                <SpeechBubble
                    // @ts-ignore
                    style={{
                        marginBottom: '10px'
                    }}
                />
            </div>
            <canvas
                id="live2d"
                ref={canvasRef}
                width={400}
                height={600}
                style={{
                    position: 'absolute',
                    willChange: 'transform',
                    transformOrigin: '0 0',
                    touchAction: 'none',
                    userSelect: 'none',
                    cursor: 'move',
                }}
            />
        </div>
    );
};

export default VirtualAvatar;
