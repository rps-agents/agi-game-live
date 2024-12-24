// SpeechBubble.tsx
// @ts-ignore
import React, {forwardRef, useEffect, useRef, useState} from 'react';

// Global controller for speech bubble
interface SpeechController {
    show: (text: string) => void;
    clear: () => void;
}

let globalSpeechControl: SpeechController | null = null;

interface SpeechBubbleProps {
    style?: React.CSSProperties;
}

const SpeechBubble = forwardRef<unknown, SpeechBubbleProps>(({style}, ref) => {
    const isSpeakingRef = useRef(false);
    const speechQueue = useRef<string[]>([]);
    const [visible, setVisible] = useState(false);
    const [currentText, setCurrentText] = useState('');

    // Initialize speech synthesis
    useEffect(() => {
        try {
            // Try to initialize speech synthesis
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance('');
            window.speechSynthesis.speak(utterance);
        } catch (error) {
            console.log('Speech synthesis initialization failed:', error);
        }
    }, []);

    // @ts-ignore
    const speak = async (text: string): Promise<void> => {
        // @ts-ignore
        return new Promise<void>((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-EN';
            utterance.pitch = 1.0;
            utterance.rate = 1.0;
            utterance.volume = 1.0;

            // Handle speech end event
            utterance.onend = () => {
                isSpeakingRef.current = false;
                resolve();
                processQueue();
            };

            // Handle speech error event
            utterance.onerror = (event) => {
                isSpeakingRef.current = false;
                resolve();
                processQueue();
            };

            // Reset state and process queue after 3 seconds
            setTimeout(() => {
                setVisible(false);
                isSpeakingRef.current = false;
                resolve();
                processQueue();
            }, 3000);

            // Show bubble and start speaking
            setVisible(true);
            isSpeakingRef.current = true;

            // Resume if paused and start speaking
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
            }
            window.speechSynthesis.speak(utterance);
        });
    };

    // @ts-ignore
    const processQueue = async (): Promise<void> => {
        if (speechQueue.current.length > 0 && !isSpeakingRef.current) {
            const nextText = speechQueue.current.shift();
            if (nextText) {
                setCurrentText(nextText);
                await speak(nextText);
            }
        }
    };

    const addToQueue = (text: string): void => {
        speechQueue.current.push(text);
        if (!isSpeakingRef.current) {
            processQueue();
        }
    };

    const clearQueue = (): void => {
        speechQueue.current = [];
    };

    // Initialize global controller
    useEffect(() => {
        globalSpeechControl = {
            show: addToQueue,
            clear: clearQueue
        };

        // Cleanup on unmount
        return () => {
            window.speechSynthesis.cancel();
            speechQueue.current = [];
            isSpeakingRef.current = false;
            globalSpeechControl = null;
        };
    }, []);

    if (!visible) return null;

    return (
        <div style={{
            position: 'absolute',
            backgroundColor: 'white',
            padding: '10px 15px',
            borderRadius: '20px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            maxWidth: '200px',
            minWidth: '120px',
            transform: 'translateX(-50%)',
            ...style
        }}>
            {currentText}
            <div style={{
                content: '""',
                position: 'absolute',
                bottom: '-10px',
                left: '50%',
                marginLeft: '-10px',
                border: '10px solid transparent',
                borderTopColor: 'white'
            }}/>
        </div>
    );
});

// Export global method
export const showSpeech = (text: string): void => {
    console.debug('Showing speech:', text);
    globalSpeechControl?.show(text);
};

export const clearSpeechQueue = (): void => {
    console.debug('Clearing speech queue');
    globalSpeechControl?.clear();
};

export default SpeechBubble;
