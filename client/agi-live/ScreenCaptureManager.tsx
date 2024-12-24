// ScreenCaptureManager.ts

import {CaptureType} from './CaptureType';
import {clearSpeechQueue} from "./SpeechBubble"; // Adjust the import path as needed

type Callback = () => void;
type CaptureOnceCallback = (type: CaptureType, refer: string) => void;

class ScreenCaptureManager {
    private static instance: ScreenCaptureManager;
    private enabled: boolean = false;
    private interval: number = 5000; // Default interval in milliseconds
    private reportType: CaptureType = CaptureType.Emotion;
    private callbacks: Callback[] = [];
    private captureOnceCallbacks: CaptureOnceCallback[] = [];

    private constructor() {
    }

    public static getInstance(): ScreenCaptureManager {
        if (!ScreenCaptureManager.instance) {
            ScreenCaptureManager.instance = new ScreenCaptureManager();
        }
        return ScreenCaptureManager.instance;
    }

    public enable(reportType: CaptureType = CaptureType.Emotion, interval: number = 15) {
        this.interval = interval * 1000;
        this.enabled = true;
        this.reportType = reportType;
        clearSpeechQueue();
        console.log('Screen capturing enabled, interval:', this.interval, 'ms, report type:', this.reportType);
        this.notify();
    }

    public disable() {
        this.enabled = false;
        console.log('Screen capturing disabled');
        this.notify();
    }

    public isEnabled() {
        return this.enabled;
    }

    public getInterval() {
        return this.interval;
    }

    public getReportType() {
        return this.reportType;
    }

    public subscribe(callback: Callback) {
        this.callbacks.push(callback);
    }

    public unsubscribe(callback: Callback) {
        this.callbacks = this.callbacks.filter(cb => cb !== callback);
    }

    public onCaptureOnce(callback: CaptureOnceCallback) {
        this.captureOnceCallbacks.push(callback);
    }

    public offCaptureOnce(callback: CaptureOnceCallback) {
        this.captureOnceCallbacks = this.captureOnceCallbacks.filter(cb => cb !== callback);
    }

    public trigger() {
        if (this.enabled) {
            this.callbacks.forEach(callback => callback());
        }
    }

    public captureScreenOnce(type: CaptureType = CaptureType.Analyze1, refer: string = '') {
        this.captureOnceCallbacks.forEach(callback => callback(type, refer));
    }

    private notify() {
        this.callbacks.forEach(callback => callback());
    }
}

export const screenCaptureManager = ScreenCaptureManager.getInstance();
