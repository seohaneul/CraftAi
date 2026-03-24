import os
import io
import time
import urllib.request
import replicate
from google import genai
from google.genai import types
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CraftAI Image Synthesis API (Ultimate AI Pipeline)")

class SynthesisRequest(BaseModel):
    leather_url: str
    template_url: str

def get_image_data(url: str):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as res:
            return res.read()
    except Exception as e:
        print(f"⚠️ 이미지 다운로드 실패 ({url}): {e}")
        return None

@app.post("/api/v1/synthesize")
async def synthesize(req: SynthesisRequest):
    print("🚀 Ultimate AI 파이프라인(Gemini 분석 + ControlNet 형태 보존) 시작...")
    
    replicate_api_token = os.getenv("REPLICATE_API_TOKEN")
    google_api_key = os.getenv("GOOGLE_API_KEY")
    
    if not replicate_api_token:
        print("❌ [Warning] REPLICATE_API_TOKEN이 없습니다. 원본 반환.")
        return {"result_image_url": req.leather_url}

    # 기본 프롬프트 (안전을 위해)
    texture_description = "premium luxury rich leather, highly detailed continuous texture"

    # Step 1: Gemini를 이용한 가죽 질감 정밀 분석 (멀티모달)
    if google_api_key:
        try:
            print("🔍 1단계: 업로드된 가죽의 색상/질감 패턴 분석 중 (Gemini 1.5 Vision)...")
            client = genai.Client(api_key=google_api_key)
            leather_bytes = get_image_data(req.leather_url)
            
            if leather_bytes:
                part = types.Part.from_bytes(data=leather_bytes, mime_type="image/jpeg")
                prompt = (
                    "Analyze this leather texture. "
                    "In exactly one short sentence, describe its precise color, grain, pattern, and finish "
                    "(e.g., 'glossy dark brown crocodile embossed leather', 'smooth matte tan cowhide'). "
                    "Return ONLY the description text, no other words."
                )
                
                res = client.models.generate_content(
                    model="gemini-1.5-flash-001",
                    contents=[prompt, part]
                )
                if res and res.text:
                    texture_description = res.text.strip()
                    print(f"✨ 가죽 분석 완료! 질감 키워드: {texture_description}")
        except Exception as e:
            print(f"⚠️ Gemini 분석 에러 (기본 질감으로 진행): {e}")

    # Step 2: 분석된 질감 값을 ControlNet 프롬프트에 동적으로 삽입하여 완벽한 모양으로 렌더링
    print("🎨 2단계: 템플릿 형태 고정 및 AI 텍스처 렌더링 중 (Stable Diffusion ControlNet)...")
    final_prompt = f"A photo-realistic masterpiece product shot of a bag made of {texture_description}. 8k resolution, studio lighting, hyper-realistic, luxury craftsmanship."
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            output = replicate.run(
                "jagilley/controlnet-canny:aff48af9c68d162388d230a2ab003f68d2638d88307baf1c56960b5e02e1c166",
                input={
                    "image": req.template_url,
                    "prompt": final_prompt,
                    "a_prompt": "best quality, extremely detailed, photo-real",
                    "n_prompt": "longbody, lowres, bad anatomy, bad hands, missing fingers, cropped, worst quality, low quality",
                    "num_samples": 1,
                    "image_resolution": 512,
                    "ddim_steps": 20,
                    "scale": 9.0
                }
            )
            
            if output and len(output) > 1:
                result_url = output[1]
                print(f"🎉 완벽한 AI 합성 성공! (형태 유지 + 질감 맞춤) 결과 URL: {result_url}")
                return {"result_image_url": result_url}
            elif output and len(output) == 1:
                result_url = output[0]
                print(f"🎉 완벽한 AI 합성 성공! 결과 URL: {result_url}")
                return {"result_image_url": result_url}
            else:
                print("⚠️ ControlNet 결과가 비어있습니다.")
                break # Not a rate limit error, break early
                
        except Exception as e:
            error_str = str(e).lower()
            if "429" in error_str or "rate limit" in error_str or "throttled" in error_str:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt + 3 # 4s, 5s...
                    print(f"⏳ Replicate 무료 제한(429) 초과. {wait_time}초 후 재시도 합니다... ({attempt+1}/{max_retries})")
                    time.sleep(wait_time)
                else:
                    print(f"💥 최대한 재시도 에도 불구하고 Replicate ControlNet 에러 발생: {e}")
            else:
                print(f"💥 Replicate ControlNet 치명적 에러: {e}")
                break # Not a rate limit error
        
    return {"result_image_url": req.leather_url}

