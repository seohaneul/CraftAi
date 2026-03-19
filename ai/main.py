import os
import json
import random
import urllib.request
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="CraftAI Image Synthesis API")

class SynthesisRequest(BaseModel):
    leather_url: str
    template_url: str

@app.post("/api/v1/synthesize")
async def synthesize(req: SynthesisRequest):
    print("Stability AI (Stable Diffusion) 공식 렌더링 진입...")
    sd_api_key = os.getenv("STABILITY_API_KEY")
    
    if not sd_api_key:
        print("토큰 없음.")
        return {"result_image_url": req.leather_url}

    # 공식 Stable Diffusion XL 1.0 이미지 생성 API
    url = "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
    
    # 텍스트 구조 설계
    prompt = "A high-end luxury leather bag masterpiece, extremely rich leather texture, studio quality, fashion photography, 8k resolution, elegant styling"
    
    payload = {
        "steps": 40,
        "width": 1024,
        "height": 1024,
        "seed": random.randint(1, 4294967295), # 매번 새로운 이미지가 나오도록 난수 설정
        "cfg_scale": 7,
        "samples": 1,
        "text_prompts": [{"text": prompt, "weight": 1}]
    }
    
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {sd_api_key}"
    }
    
    try:
        # 외장 라이브러리(requests 등) 충돌이 없도록 파이썬 내장 라이브러리 urllib만 사용!
        request_obj = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
        response = urllib.request.urlopen(request_obj)
        response_body = response.read().decode('utf-8')
        
        data = json.loads(response_body)
        # Stability API는 이미지를 base64 형식으로 바로 쏴줍니다.
        base64_image = data["artifacts"][0]["base64"]
        
        # 브라우저 `<img>` 태그가 곧바로 주소로 읽을 수 있는 데이터 포맷으로 완성
        result_url = f"data:image/png;base64,{base64_image}"
        
        print("🎉 Stability AI 렌더링 대성공! 브라우저로 전송합니다.")
        return {"result_image_url": result_url}
        
    except Exception as e:
        print("💥 Stability API 에러:", e)
        if hasattr(e, 'read'):
            try:
                print("상세 에러 내용:", e.read().decode("utf-8"))
            except:
                pass
        # 에러 발생 시 시스템이 다운되지 않도록 임시로 가죽 원본 뱉어주기
        return {"result_image_url": req.leather_url}
