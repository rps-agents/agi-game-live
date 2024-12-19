const express = require('express');
const {createServer} = require('http');
const {Server} = require('socket.io');
const OpenAI = require('openai');
const {PORT, CORS_OPTIONS, OPENAI_API_KEY} = require('./config');
const {generateEmotionResponse, generateTouchResponse} = require("./qaUtils");

process.noDeprecation = true;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: CORS_OPTIONS
});

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

io.on('connection', (socket) => {
    socket.on('screenCapture', async ({image, type, refer}) => {
        console.log(`Received request - Type: ${type}, Refer: ${refer}, Image length: ${image ? image.length : 0}`);

        try {
            let message;
            switch (type) {
                case 'emotion':
                    const currentMilliseconds = new Date().getMilliseconds();
                    message = (currentMilliseconds % 2 === 0) ? '' : generateEmotionResponse();
                    break;

                case 'touch':
                    message = generateTouchResponse();
                    break;

                case 'analyze-1':
                case 'analyze-2':
                    const textContent = caseType === 'analyze-1' ? `The game hasn't started yet. Based on the current bets, consider your strategy. 
           Should you bet on Rock, Paper, or Scissors? Analyze the existing bets and decide 
           where it's best to place your bet. Simple. 10 words or less. ${refer ? 'Hint: ' + refer : ''}` : `The match has started. Analyze and predict the winning item (rock/paper/scissors) 
           based on current information. You can't say it can't be analyzed, you have to say something, 
           even if it's simply to provide emotional value. Simple. 10 words or less. ${refer ? 'Hint: ' + refer : ''}`;
                    const response = await openai.chat.completions.create({
                        model: "gpt-4o-mini", messages: [{
                            role: "user", content: [{
                                type: "text", text: textContent
                            }, {
                                type: "image_url", image_url: {
                                    url: image
                                }
                            }],
                        }], max_tokens: 50, temperature: 0.7
                    });
                    message = response.choices[0].message.content;
                    break;

                default:
                    break;
            }
            console.log(`Sending response - Type: ${type}, Message: ${message}`);
            if (!!message) {
                socket.emit('screenCaptureResponse', message);
            }

        } catch (error) {
            console.error('Error screenCaptureResponse:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
