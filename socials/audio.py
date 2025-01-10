from fish_audio_sdk import Session, TTSRequest, ReferenceAudio
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv('FISH_AUDIO_API_KEY')
if not api_key:
    raise ValueError("Missing FISH_AUDIO_API_KEY in environment variables")

session = Session(api_key)

# Option 1: Using a reference_id
with open("output1.mp3", "wb") as f:
    for chunk in session.tts(TTSRequest(
        reference_id="5ac6fb7171ba419190700620738209d8",
        text="Hello, world!"
    )):
        f.write(chunk)

# # Option 2: Using reference audio
# with open("reference_audio.mp3", "rb") as audio_file:
#     with open("output2.mp3", "wb") as f:
#         for chunk in session.tts(TTSRequest(
#             text="Hello, world!",
#             references=[
#                 ReferenceAudio(
#                     audio=audio_file.read(),
#                     text="Text in reference audio",
#                 )
#             ]
#         )):
#             f.write(chunk)
