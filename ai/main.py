import os
import io
import base64
import urllib.request
import re
import numpy as np
from PIL import Image, ImageOps, ImageFilter, ImageDraw
from fastapi import FastAPI
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# === 설정 ===
CREDENTIALS_PATH = os.path.join(os.path.dirname(__file__), "google-credentials.json")
# 환경 변수에 구글 인증 파일 경로 등록
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = CREDENTIALS_PATH

app = FastAPI(title="CraftAI Luxury Imagen 3 Synthesis API")

class SynthesisRequest(BaseModel):
    leather_url: str
    template_url: str

def get_image_data(url: str):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as res:
            return res.read()
    except: return None

def get_product_box_with_gemini(product_bytes: bytes) -> list:
    """제미나이 1.5 플래시로 지갑의 위치를 추적"""
    try:
        # 인증 파일 없이 서비스 계정 자동 로드됨
        client = genai.Client(vertexai=True, project="craft-ai-496214", location="us-central1")
        product_part = types.Part.from_bytes(data=product_bytes, mime_type="image/png")
        prompt = "Detect the bounding box of the main product. Return [ymin, xmin, ymax, xmax] (0-1000)."
        res = client.models.generate_content(model="gemini-1.5-flash-002", contents=[prompt, product_part])
        nums = re.findall(r'\d+', res.text)
        if len(nums) >= 4:
            return [int(n) for n in nums[:4]]
    except Exception as e:
        print(f"[WARNING] Gemini box detection failed: {e}")
    return [200, 200, 800, 800]

def analyze_leather_with_gemini(leather_bytes: bytes) -> str:
    """가죽의 질감과 색상을 상세 분석"""
    try:
        client = genai.Client(vertexai=True, project="craft-ai-496214", location="us-central1")
        part = types.Part.from_bytes(data=leather_bytes, mime_type="image/png")
        res = client.models.generate_content(model="gemini-1.5-flash-002", contents=["Describe this leather material grain and color precisely in 5 words.", part])
        return res.text.strip()
    except: return "premium luxury leather material"

@app.post("/api/v1/synthesize")
async def synthesize(req: SynthesisRequest):
    print("\n[INFO] === IMAGEN 3 LUXURY SYNTHESIS START ===")
    
    leather_data = get_image_data(req.leather_url)
    product_data = get_image_data(req.template_url)

    if not leather_data or not product_data:
        return {"result_image_url": req.template_url}
    
    try:
        orig_img = Image.open(io.BytesIO(product_data)).convert("RGB")
        w, h = orig_img.size
        
        # 1. 지갑 위치 추적
        ymin, xmin, ymax, xmax = get_product_box_with_gemini(product_data)
        left, top, right, bottom = xmin * w / 1000, ymin * h / 1000, xmax * w / 1000, ymax * h / 1000
        
        # 2. 지갑 영역 크롭 및 패딩
        pad = 40
        crop_box = (max(0, left-pad), max(0, top-pad), min(w, right+pad), min(h, bottom+pad))
        wallet_crop = orig_img.crop(crop_box)
        cw, ch = wallet_crop.size
        
        # 3. 가죽 분석
        leather_desc = analyze_leather_with_gemini(leather_data)
        print(f"[INFO] Material analysis: {leather_desc}")
        
        # 4. Imagen 3 호출 (Edit/Inpaint 모드)
        print(f"[INFO] Requesting Imagen 3.0 Pro...")
        client = genai.Client(vertexai=True, project="craft-ai-496214", location="us-central1")
        
        # Imagen 3는 'edit_image'를 통해 마스크 기반 합성을 지원합니다.
        # 크롭된 영역 전체를 마스크로 사용하여 지갑을 새 가죽으로 재창조합니다.
        crop_bytes = io.BytesIO()
        wallet_crop.save(crop_bytes, format="PNG")
        
        # 이미지 편집용 마스크 (전체 흰색)
        mask_img = Image.new("L", (cw, ch), 255)
        mask_bytes = io.BytesIO()
        mask_img.save(mask_bytes, format="PNG")

        response = client.models.edit_image(
            model="imagen-3.0-capability-001",
            prompt=f"A professional luxury product made of {leather_desc}, identical shape, extreme detail",
            reference_images=[
                {
                    "image": types.Image(image_bytes=crop_bytes.getvalue()),
                    "reference_id": 1,
                    "reference_type": "BASE_IMAGE_REFERENCE"
                },
                {
                    "image": types.Image(image_bytes=mask_bytes.getvalue()),
                    "reference_id": 2,
                    "reference_type": "MASK_REFERENCE"
                }
            ],
            config=types.EditImageConfig(
                number_of_images=1,
                edit_mode="INPAINT_REMOVAL"
            )
        )
        
        if not response.generated_images:
            print("[ERROR] Imagen 3 failed to generate images.")
            return {"result_image_url": req.template_url}

        # 5. 최종 결과물 합성 (원본 배경에 붙이기)
        print(f"[INFO] Final Assembly: Pasting Imagen 3 result onto original background...")
        ai_wallet_bytes = response.generated_images[0].image_bytes
        ai_wallet = Image.open(io.BytesIO(ai_wallet_bytes)).convert("RGB").resize((cw, ch))
        
        final_img = orig_img.copy()
        # 자연스러운 경계를 위한 부드러운 마스크
        soft_mask = Image.new("L", (cw, ch), 255).filter(ImageFilter.GaussianBlur(15))
        final_img.paste(ai_wallet, (int(crop_box[0]), int(crop_box[1])), soft_mask)
        
        # 6. 결과 반환
        out_buf = io.BytesIO()
        final_img.save(out_buf, format="PNG")
        b64_res = base64.b64encode(out_buf.getvalue()).decode('utf-8')
        
        print(f"[SUCCESS] Imagen 3 Luxury Synthesis complete!")
        return {"result_image_url": f"data:image/png;base64,{b64_res}"}
        
    except Exception as e:
        print(f"[ERROR] Luxury Synthesis failed: {e}")
        return {"result_image_url": req.template_url}
