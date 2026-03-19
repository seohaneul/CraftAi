import os
import replicate
from dotenv import load_dotenv

load_dotenv(r"c:\Users\user\Desktop\PROJECT\CraftAi\ai\.env")
print("Token:", os.getenv("REPLICATE_API_TOKEN"))

try:
    output = replicate.run(
        "jagilley/controlnet-canny:aff48af9c68d162388d230a2ab003f68d2638d88307baf1c56960b5e02e1c166",
        input={
            "image": "https://craftai-storage.s3.ap-northeast-2.amazonaws.com/dummy-client-img.jpeg",
            "prompt": "a highly detailed premium rich leather bag, masterpiece, 8k resolution, photorealistic, luxury leather texture, fashion photography",
            "n_prompt": "low quality, bad texture, distorted, ugly, blurry, background noise",
            "ddim_steps": 20,
            "scale": 7.0
        }
    )
    print("SUCCESS")
    print(output)
except Exception as e:
    print("ERROR:")
    print(e)
