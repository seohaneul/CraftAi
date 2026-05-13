import os
import io
import base64
import urllib.request
import re
import requests
from PIL import Image, ImageFilter
from fastapi import FastAPI
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# === 설정 ===
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

app = FastAPI(title="CraftAI Nano-Banana Synthesis API")

class SynthesisRequest(BaseModel):
    leather_url: str
    template_url: str

def get_image_data(url: str):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as res:
            return res.read()
    except: return None

@app.post("/api/v1/synthesize")
async def synthesize(req: SynthesisRequest):
    print("\n[INFO] === NANO-BANANNA SYNTHESIS START ===")
    
    leather_data = get_image_data(req.leather_url)
    product_data = get_image_data(req.template_url)

    if not leather_data or not product_data:
        return {"result_image_url": req.template_url}
    
    try:
        client = genai.Client(api_key=GOOGLE_API_KEY)
        
        # 1. 원본 이미지 준비
        orig_img = Image.open(io.BytesIO(product_data)).convert("RGB")
        w, h = orig_img.size
        
        # 2. 파트 준비 (Nano-Banana는 멀티모달 합성을 지원)
        product_part = types.Part.from_bytes(data=product_data, mime_type="image/png")
        leather_part = types.Part.from_bytes(data=leather_data, mime_type="image/png")
        
        # Nano-Banana 전용 합성 프롬프트
        prompt = (
            "You are a professional luxury product synthesizer. "
            "Take the product structure from the first image and apply the leather texture/color from the second image. "
            "Maintain the exact shape, shadows, and background of the original product. "
            "Generate the final synthesized image in high resolution."
        )

        print(f"[INFO] Requesting Nano-Banana (Gemini 3 Pro)...")
        # Nano-Banana (Gemini 3 Pro) 호출
        response = client.models.generate_content(
            model="nano-banana-pro-preview",
            contents=[prompt, product_part, leather_part]
        )
        
        # 결과 처리
        # Nano-Banana는 response.candidates[0].content.parts[0].inline_data.data에 이미지 바이너리를 담아줍니다.
        if response.candidates and response.candidates[0].content.parts:
            img_part = response.candidates[0].content.parts[0]
            if hasattr(img_part, 'inline_data'):
                final_image_data = img_part.inline_data.data
                b64_res = base64.b64encode(final_image_data).decode('utf-8')
                print(f"[SUCCESS] Nano-Banana Synthesis Complete!")
                return {"result_image_url": f"data:image/png;base64,{b64_res}"}
        
        print("[ERROR] Nano-Banana failed to return image data.")
        return {"result_image_url": req.template_url}
        
    except Exception as e:
        print(f"[ERROR] Nano-Banana Synthesis failed: {e}")
        return {"result_image_url": req.template_url}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
