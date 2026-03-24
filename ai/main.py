import os
import json
import base64
import random
import urllib.request
from google import genai
from google.genai import types
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Google Gemini / Imagen API 구성
google_api_key = os.getenv("GOOGLE_API_KEY")
client = None
if google_api_key:
    try:
        client = genai.Client(api_key=google_api_key)
        print("✅ Google Gemini (Multimodal & Imagen) 클라이언트 준비 완료.")
    except Exception as e:
        print(f"❌ Gemini 클라이언트 초기화 실패: {e}")

app = FastAPI(title="CraftAI Image Synthesis API (Premium Dual-Gen)")

class SynthesisRequest(BaseModel):
    leather_url: str
    template_url: str

def get_image_data(url: str):
    """URL에서 이미지 바이너리를 가져옵니다."""
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as res:
            return res.read()
    except Exception as e:
        print(f"⚠️ 이미지 다운로드 실패 ({url}): {e}")
        return None

@app.post("/api/v1/synthesize")
async def synthesize(req: SynthesisRequest):
    print("🚀 2단계 프리미엄 AI 합성 프로세스 시작...")
    
    if not client:
        print("❌ [Warning] API 클라이언트 없음. 원본 반환.")
        return {"result_image_url": req.leather_url}

    try:
        # Step 1: 이미지 다운로드
        leather_bytes = get_image_data(req.leather_url)
        template_bytes = get_image_data(req.template_url)

        if not leather_bytes or not template_bytes:
            print("⚠️ 원본 이미지를 불러올 수 없습니다.")
            return {"result_image_url": req.leather_url}

        # Step 2: Gemini 1.5 Flash를 사용하여 맞춤형 프롬프트 생성 (Multimodal Analysis)
        print("🔍 1단계: 가죽 질감 및 디자인 형태 분석 중 (Gemini 1.5 Flash)...")
        
        analysis_prompt = (
            "Analyze these two images. Image 1 is a leather material texture. Image 2 is a specific leather craft item template (shape). "
            "Task: Generate a highly detailed professional prompt for an AI image generator (Imagen). "
            "The prompt must describe a product shot of the ITEM SHAPE in image 2, but made with the EXACT TEXTURE AND COLOR of the leather in image 1. "
            "The prompt should focus on '8k resolution, luxury craftsmanship, studio lighting'. "
            "Response should only contain the final prompt text without any other comments."
        )

        custom_prompt = (
            "A high-end luxury leather craft masterpiece, extremely rich and detailed leather grain texture, "
            "professional product photography, studio lighting, 8k resolution, elegant styling."
        )

        try:
            # SDK 규격에 맞게 Part 객체로 변환
            part1 = types.Part.from_bytes(data=leather_bytes, mime_type="image/jpeg")
            part2 = types.Part.from_bytes(data=template_bytes, mime_type="image/jpeg")

            # 가장 안정적인 기본 모델명 사용
            response_text = client.models.generate_content(
                model="gemini-1.5-flash-001",
                contents=[analysis_prompt, part1, part2]
            )
            if response_text and response_text.text:
                custom_prompt = response_text.text.strip()
                print(f"✨ 분석 완료! 생성된 커스텀 프롬프트: {custom_prompt}")
            else:
                print("⚠️ 프롬프트가 비어있어 기본값을 사용합니다.")
        except Exception as prompt_e:
            print(f"⚠️ Gemini 프롬프트 생성 에러 (기본 프롬프트로 대체): {prompt_e}")

        # Step 3: 생성된 맞춤형 프롬프트로 Imagen 4.0 이미지 생성
        print("🎨 2단계: 프리미엄 이미지 렌더링 중 (Imagen 4.0)...")
        
        response_img = client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=custom_prompt,
            config={'number_of_images': 1}
        )
        
        if response_img and response_img.generated_images:
            img_obj = response_img.generated_images[0]
            
            # 이미지 바이너리 추출 (다양한 속성명 체크)
            img_bytes = None
            if hasattr(img_obj.image, 'image_bytes'):
                img_bytes = img_obj.image.image_bytes
            elif hasattr(img_obj.image, 'bytes'):
                img_bytes = img_obj.image.bytes
            elif hasattr(img_obj, 'as_bytes'):
                img_bytes = img_obj.as_bytes()
            
            if img_bytes:
                b64_image = base64.b64encode(img_bytes).decode('utf-8')
                print("🎉 2단계 프리미엄 합성 완료! 최종 이미지를 전송합니다.")
                return {"result_image_url": f"data:image/png;base64,{b64_image}"}

    except Exception as e:
        print(f"💥 합성 프로세스 에러: {e}")
        
    # 실패 시 원본 가죽 이미지를 안전하게 반환
    return {"result_image_url": req.leather_url}




