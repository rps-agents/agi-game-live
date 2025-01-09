import datetime
import tweepy
from typing import Optional, List
import logging
import os
from dotenv import load_dotenv
from litellm import completion, image_generation
import requests
import time
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "")

class TwitterPoster:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv('TWITTER_API_KEY')
        api_secret = os.getenv('TWITTER_API_SECRET') 
        access_token = os.getenv('TWITTER_ACCESS_TOKEN')
        access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        bearer_token = os.getenv('TWITTER_BEARER_TOKEN')

        if not all([api_key, api_secret, access_token, access_token_secret, bearer_token]):
            raise ValueError("Missing required Twitter credentials in environment variables")

        self.client = tweepy.Client(
            bearer_token=bearer_token,
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

    def post_tweet(self, text: str, media_paths: Optional[List[str]] = None, reply_to: Optional[str] = None) -> dict:
        """Post a tweet with optional media attachments and reply functionality."""
        try:
            media_ids = []
            if media_paths:
                for path in media_paths:
                    media = self.api.media_upload(path)
                    media_ids.append(media.media_id)

            response = self.client.create_tweet(
                text=text,
                media_ids=media_ids if media_ids else None,
                in_reply_to_tweet_id=reply_to
            )
            
            self.logger.info(f"Tweet posted successfully: {response.data['id']}")
            return response.data
            
        except Exception as e:
            self.logger.error(f"Error posting tweet: {str(e)}")
            raise

    def generate_and_post(self, prompt: str, media_paths: Optional[List[str]] = None, generate_image_prompt: Optional[str] = None, reply_to: Optional[str] = None) -> dict:
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

        return self.post_tweet(tweet_content, media_paths, reply_to)

    def listen_and_respond(self):
        """Listen for mentions and respond to them."""
        self.logger.info("Starting mention listener...")
        
        try:
            # Add more detailed error logging
            me = self.client.get_me()
            if not me[0]:
                self.logger.error("Failed to get user information")
                raise tweepy.TweepyException("Failed to verify authentication")
            self.logger.info(f"Authentication successful for user: {me[0].username}")
            
            # Keep track of the last mention we've responded to
            last_mention_id = None
            
            while True:
                try:
                    # Get mentions timeline from last 5 minutes
                    current_time = datetime.datetime.utcnow()
                    five_mins_ago = current_time - datetime.timedelta(minutes=5)
                    
                    # Format timestamp in correct RFC3339 format
                    start_time = five_mins_ago.strftime('%Y-%m-%dT%H:%M:%S.000Z')
                    
                    mentions = self.client.get_users_mentions(
                        id=me[0].id,
                        start_time=start_time
                    ).data
                    
                    if mentions:
                        # Process mentions only if we got some data back
                        mentions_with_created = []
                        for mention in mentions:
                            if hasattr(mention, 'created_at'):
                                mentions_with_created.append(mention)
                        
                        if mentions_with_created:
                            # Sort mentions by created_at and get only the most recent one
                            most_recent = max(mentions_with_created, key=lambda x: x.created_at)
                            
                            # Log mention details
                            self.logger.info(f"Processing most recent mention - ID: {most_recent.id}, Text: {most_recent.text}, From: {most_recent.author_id}, Created at: {most_recent.created_at}")
                            
                            # Generate a response tweet
                            tweet_content = self.generate_tweet_content(
                                f"Respond to this tweet: {most_recent.text}"
                            )
                            
                            # Post the response as a reply
                            response = self.post_tweet(
                                text=tweet_content,
                                reply_to=most_recent.id
                            )
                            
                            self.logger.info(f"Responded to mention {most_recent.id} with tweet: {tweet_content}")
                    
                    # Wait before checking for new mentions
                    time.sleep(15)
                    
                except Exception as e:
                    self.logger.error(f"Error in mention listener: {str(e)}")
                    time.sleep(15)  # Wait before retrying
        except tweepy.TweepyException as e:
            self.logger.error(f"Twitter API Error: {str(e)}")
            self.logger.error(f"Error Response: {getattr(e, 'response', 'No response data')}")
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error: {str(e)}")
            raise
# Usage example
if __name__ == "__main__":
    twitter = TwitterPoster()
    
    # Start listening for mentions and responding
    twitter.listen_and_respond()
    # Example of posting a tweet
    # response = twitter.generate_and_post(
    #     prompt="Share an interesting fact about technology and AI",
    #     generate_image_prompt="A stylish digital art piece related to technology"
    # )
    # print(f"Tweet posted with ID: {response['id']}")
