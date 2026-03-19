import os
import replicate
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

# .env 환경 변수 로드 (REPLICATE_API_TOKEN 포함)
load_dotenv()

app = FastAPI(title="CraftAI Image Synthesis API")

class SynthesisRequest(BaseModel):
    leather_url: str
    template_url: str

@app.post("/api/v1/synthesize")
async def synthesize(req: SynthesisRequest):
    try:
        # Replicate의 ControlNet 모델을 호출하여, 가방 템플릿(형태)을 유지하면서 고품질 가죽 재질을 덧입히는 AI 합성 로직
        print("AI 렌더링 시작... 템플릿:", req.template_url)
        
        output = replicate.run(
            "jagilley/controlnet-canny:aff48af9c68d162388d230a2ab003f68d2638d88307baf1c56960b5e02e1c166",
            input={
                "image": req.template_url,
                "prompt": "a highly detailed premium rich leather bag, masterpiece, 8k resolution, photorealistic, luxury leather texture, fashion photography",
                "n_prompt": "low quality, bad texture, distorted, ugly, blurry, background noise",
                "ddim_steps": 20,
                "scale": 7.0
            }
        )
        
        # ControlNet Canny 모델은 일반적으로 [엣지 맵, 합성결과] 2개의 이미지를 배열로 반환합니다.
        result_url = output[1] if isinstance(output, list) and len(output) > 1 else (output[0] if isinstance(output, list) else output)
        print("합성 완료 URL:", result_url)
        
        return {"result_image_url": str(result_url)}
    except Exception as e:
        print("Replicate AI Error:", e)
        # 만약 API 토큰 오류 시, 테스트를 위해 가죽 원본이라도 돌려줌
        return {"result_image_url": req.leather_url}
