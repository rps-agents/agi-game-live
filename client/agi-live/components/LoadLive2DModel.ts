export const loadLive2DModel = (
    canvasId: string,
    modelPath: string,
    maxRetries = 0
): Promise<boolean> => {
    // @ts-ignore
    return new Promise((resolve, reject) => {
        let retryCount = 0;

        const checkCanvas = (): boolean => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
            if (!canvas) {
                console.error(`Canvas with ID '${canvasId}' not found.`);
                return false;
            }

            const context = canvas.getContext('2d');
            if (!context) {
                console.error(`2D context not available for canvas with ID '${canvasId}'.`);
                return false;
            }

            // Checking the canvas for content
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            return !imageData.data.every(pixel => pixel === 0);
        };

        const tryLoad = () => {
            const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
            if (!canvas) {
                reject(new Error(`Canvas with ID '${canvasId}' is not available for loading.`));
                return;
            }

            try {
                // @ts-ignore
                window.loadlive2d(canvasId, modelPath);
            } catch (error) {
                console.error(`Error calling loadlive2d: ${error}`);
                reject(new Error(`Failed to initiate Live2D loading for canvas ID '${canvasId}'.`));
                return;
            }

            // Allow some time for loading
            setTimeout(() => {
                if (checkCanvas()) {
                    resolve(true);
                } else {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        console.log(`Live2D model loading retry ${retryCount}/${maxRetries}`);
                        tryLoad();
                    } else {
                        reject(new Error(`Failed to load Live2D model after ${maxRetries} attempts`));
                    }
                }
            }, 1000);
        };

        tryLoad();
    });
};
