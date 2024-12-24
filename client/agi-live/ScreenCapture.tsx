// ScreenCapture.tsx

import React, {useEffect, useRef} from 'react';
import html2canvas from 'html2canvas';
import io from 'socket.io-client';
import {throttle} from 'throttle-debounce';
import {showSpeech} from "./SpeechBubble";
import {screenCaptureManager} from './ScreenCaptureManager';
import {CaptureType} from './CaptureType'; // Adjust the import path as needed

interface ScreenCaptureProps {
    socketUrl?: string;
    children: React.ReactNode;
}

const ScreenCapture: React.FC<ScreenCaptureProps> = React.memo(({
                                                                    socketUrl = "http://localhost:3001",
                                                                    children
                                                                }) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<any>(null);
    const captureIntervalRef = useRef<NodeJS.Timeout>();

    // Function to perform screen capture
    const doScreenCapture = async (type: CaptureType, refer: string = '') => {
        console.log(`Capturing screen... Type: ${type}, Refer: ${refer}, isAuto: ${screenCaptureManager.isEnabled()},`);
        if (!componentRef.current) return;


        try {
            let base64Image = '';
            if ([CaptureType.Analyze1, CaptureType.Analyze2].includes(type)) {
                const canvas = await html2canvas(componentRef.current);
                base64Image = canvas.toDataURL('image/png');
            }
            if (socketRef.current?.connected) {
                socketRef.current.emit('screenCapture', {image: base64Image, type, refer});
                console.log('Screenshot sent');
            }
        } catch (error) {
            console.error('Screenshot failed:', error);
        }
    };

    const throttledCapture = useRef(
        throttle(1000, () => doScreenCapture(screenCaptureManager.getReportType()))
    ).current;

    useEffect(() => {
        socketRef.current = io(socketUrl);

        socketRef.current.on('connect', () => {
            console.log('Socket connected');
            screenCaptureManager.enable();
        });

        socketRef.current.on('screenCaptureResponse', (response: string) => {
            showSpeech(response);
        });

        return () => {
            console.log('Socket disconnected');
            socketRef.current?.disconnect();
            screenCaptureManager.disable();
        };
    }, [socketUrl]);

    const scheduleCapture = () => {
        if (!screenCaptureManager.isEnabled()) return;

        const interval = screenCaptureManager.getInterval();
        captureIntervalRef.current = setTimeout(() => {
            throttledCapture();
            scheduleCapture();
        }, interval);
    };

    useEffect(() => {
        const updateCaptureSettings = () => {
            if (captureIntervalRef.current) {
                clearTimeout(captureIntervalRef.current);
            }
            if (screenCaptureManager.isEnabled()) {
                scheduleCapture();
            }
        };

        screenCaptureManager.subscribe(updateCaptureSettings);

        return () => {
            screenCaptureManager.unsubscribe(updateCaptureSettings);
            if (captureIntervalRef.current) {
                clearTimeout(captureIntervalRef.current);
            }
        };
    }, [throttledCapture]);

    useEffect(() => {
        // Start capturing immediately if enabled
        if (screenCaptureManager.isEnabled()) {
            scheduleCapture();
        }
    }, []);

    useEffect(() => {
        const handleCaptureOnce = (type: CaptureType, refer: string) => {
            doScreenCapture(type, refer);
        };

        screenCaptureManager.onCaptureOnce(handleCaptureOnce);

        return () => {
            screenCaptureManager.offCaptureOnce(handleCaptureOnce);
        };
    }, []);

    return (
        <div ref={componentRef} className="screen-capture-container">
            {children}
        </div>
    );
});

export default ScreenCapture;
