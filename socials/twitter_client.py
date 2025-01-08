import tweepy
from typing import Optional, List
import logging
import os
from dotenv import load_dotenv
from litellm import completion, image_generation
import requests
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "")

class TwitterPoster:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv('TWITTER_API_KEY')
        api_secret = os.getenv('TWITTER_API_SECRET') 
        access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')

        if not all([api_key, api_secret, access_token, access_token_secret]):
            raise ValueError("Missing required Twitter credentials in environment variables")

        self.client = tweepy.Client(
            consumer_key=api_key,
            consumer_secret=api_secret,
            access_token=access_token,
            access_token_secret=access_token_secret
        )
        # For media uploads
        self.auth = tweepy.OAuth1UserHandler(api_key, api_secret, access_token, access_token_secret)
        self.api = tweepy.API(self.auth)
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)

    def generate_tweet_content(self, prompt: str) -> str:
        """Generate tweet content using LiteLLM."""
        try:
            response = completion(
                model="gpt-4o",
                messages=[{
                    "role": "system",
                    "content": "You are a social media expert who writes engaging tweets."
                }, {
                    "role": "user", 
                    "content": f"Generate a tweet about: {prompt}"
                }],
                max_tokens=280  # Twitter's character limit
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            self.logger.error(f"Error generating tweet content: {str(e)}")
            raise

    def generate_image(self, prompt: str, output_path: str) -> str:
        """Generate an image using LiteLLM and save it locally."""
        try:
            response = image_generation(prompt=prompt, model="dall-e-3")
            # Save the image URL to a local file
            image_url = response.data[0].url
            image_data = requests.get(image_url).content
            with open(output_path, 'wb') as f:
                f.write(image_data)
            return output_path
        except Exception as e:
            self.logger.error(f"Error generating image: {str(e)}")
            raise

    def post_tweet(self, text: str, media_paths: Optional[List[str]] = None) -> dict:
        """Post a tweet with optional media attachments."""
        try:
            media_ids = []
            if media_paths:
                for path in media_paths:
                    media = self.api.media_upload(path)
                    media_ids.append(media.media_id)

            response = self.client.create_tweet(
                text=text,
                media_ids=media_ids if media_ids else None
            )
            
            self.logger.info(f"Tweet posted successfully: {response.data['id']}")
            return response.data
            
        except Exception as e:
            self.logger.error(f"Error posting tweet: {str(e)}")
            raise

    def generate_and_post(self, prompt: str, media_paths: Optional[List[str]] = None, generate_image_prompt: Optional[str] = None) -> dict:
        """Generate and post a tweet in one step, optionally generating an AI image."""
        tweet_content = self.generate_tweet_content(prompt)
        self.logger.info(f"Generated tweet content: {tweet_content}")
        # Handle image generation if requested
        if generate_image_prompt:
            generated_image_path = self.generate_image(
                generate_image_prompt,
                f"generated_image_{os.urandom(4).hex()}.png"
            )
            if media_paths:
                media_paths.append(generated_image_path)
            else:
                media_paths = [generated_image_path]

        return self.post_tweet(tweet_content, media_paths)

# Usage example
if __name__ == "__main__":
    twitter = TwitterPoster()

    # Generate and post AI content with generated image
    twitter.generate_and_post(
        "Share an interesting fact about space exploration",
        generate_image_prompt="A stunning view of a spiral galaxy with vibrant colors"
    )
