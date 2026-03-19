import os
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import asyncio

# .env 환경 변수 로드
load_dotenv()

app = FastAPI(title="CraftAI Image Synthesis API")

class SynthesisRequest(BaseModel):
    image_url: str
    prompt: str

class SynthesisResponse(BaseModel):
    status: str
    result_image_url: str
    message: str

@app.post("/api/v1/synthesize", response_model=SynthesisResponse)
async def synthesize_image(request: SynthesisRequest):
    """
    가죽공방 주문제작 이미지 합성 더미 엔드포인트
    실제로는 비동기로 AI 모델 추론이 진행될 부분을 시뮬레이션
    """
    # 2초간 딜레이 (AI 처리 흉내)
    await asyncio.sleep(2)
    
    return SynthesisResponse(
        status="success",
        result_image_url="https://craftai-storage.s3.ap-northeast-2.amazonaws.com/dummy-result.jpeg",
        message=f"Image processed successfully with prompt: '{request.prompt}'"
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
