import os
import io
import base64
import urllib.request
import traceback
import numpy as np
from PIL import Image, ImageOps, ImageFilter, ImageEnhance
from fastapi import FastAPI
from pydantic import BaseModel

# === 전역 U2Net 세션 초기화 (속도 최적화) ===
# 매 요청마다 모델을 로드하는 병목을 제거하여 합성 속도를 3배 이상 단축합니다.
try:
    from rembg import remove, new_session
    print("[INFO] Loading U2Net Model into memory...")
    u2net_session = new_session('u2net')
    print("[SUCCESS] U2Net Model loaded successfully.")
except Exception as e:
    print(f"[ERROR] Failed to load U2Net Model: {e}")
    u2net_session = None

app = FastAPI(title="CraftAI Image Synthesis API")

class SynthesisRequest(BaseModel):
    leather_url: str
    template_url: str

def get_image_data(url: str):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as res:
            return res.read()
    except Exception as e:
        print(f"[WARNING] Image download failed ({url}): {e}")
        return None

def apply_texture_with_mask(leather_bytes: bytes, template_bytes: bytes) -> bytes:
    leather_img = Image.open(io.BytesIO(leather_bytes)).convert("RGB")
    template_img = Image.open(io.BytesIO(template_bytes)).convert("RGB")
    
    # 1. 원본 템플릿 해상도 기록 (최종 출력물을 무조건 이 해상도로 맞춤)
    orig_w, orig_h = template_img.size
    
    # 2. OOM 방지용 리사이즈
    max_dim = 1024
    if orig_w > max_dim or orig_h > max_dim:
        template_img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        
    w, h = template_img.size

    # === 마스크 추출 (1순위: rembg AI, 2순위: 수동 임계값) ===
    mask = None
    if u2net_session:
        try:
            # 이미지가 화면에 꽉 찬 경우(여백 없음) AI가 피사체를 배경으로 착각하는 버그 방지용 여백 추가
            pad_size = 50
            padded_img = ImageOps.expand(template_img, border=pad_size, fill='white')
            isolated = remove(padded_img, session=u2net_session, post_process_mask=True)
            mask_padded = isolated.split()[-1]
            mask = mask_padded.crop((pad_size, pad_size, template_img.width + pad_size, template_img.height + pad_size))
            
            # 마스크 유효성 검사 (마스크가 아예 텅 비었을 때만 실패로 간주)
            mask_arr = np.array(mask)
            white_ratio = np.sum(mask_arr > 128) / mask_arr.size
            if white_ratio <= 0.001:
                mask = None
        except Exception as e:
            print(f"[ERROR] U2Net AI 마스크 에러: {e}")
            mask = None

    gray = template_img.convert("L")
    gray_arr = np.array(gray).astype(float)
    
    if mask is None:
        print("[INFO] 수동 임계값 마스크 (Threshold Mask) 생성 중...")
        # 배경색이 흰색/밝은회색(230 이상)이라고 가정하고 누끼 따기
        bg_mask = gray_arr > 230
        fg_mask_arr = (~bg_mask) * 255
        mask = Image.fromarray(fg_mask_arr.astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
    
    # === 텍스처 리사이즈 및 바둑판 배열 ===
    lw, lh = leather_img.size
    # 텍스처가 템플릿 안에서 최소 2~3번 반복되도록 스케일 조정 (바둑판 무늬 형성)
    target_lw = min(200, max(50, int(w * 0.4)))
    scale = target_lw / lw if lw > 0 else 1.0
    scaled_leather = leather_img.resize((int(lw*scale), int(lh*scale)), Image.Resampling.LANCZOS)
    slw, slh = scaled_leather.size
    
    tiled_leather = Image.new("RGB", (w, h))
    for i in range(0, w, slw):
        for j in range(0, h, slh):
            tiled_leather.paste(scaled_leather, (i, j))
            
    tiled_arr = np.array(tiled_leather)
    
    # === 가방 주름(명암) 정규화 및 3D 왜곡(Displacement) 래핑 ===
    from PIL import ImageFilter, ImageEnhance
    smooth_gray = np.array(gray.filter(ImageFilter.GaussianBlur(5.0))).astype(float)
    
    # 명암을 0~1로 정규화하여 가죽이 너무 어두워지지 않도록 방지
    g_min = gray_arr.min()
    g_max = gray_arr.max()
    fg = (gray_arr - g_min) / (g_max - g_min + 1e-5)
    
    dy, dx = np.gradient(smooth_gray)
    distortion_strength = 2.5 
    
    Y, X = np.mgrid[0:h, 0:w]
    map_y = np.clip(Y + dy * distortion_strength, 0, h - 1).astype(int)
    map_x = np.clip(X + dx * distortion_strength, 0, w - 1).astype(int)
    
    warped_leather_arr = tiled_arr[map_y, map_x, :]
    
    # === Hard Light 블렌딩 (가죽 텍스처 + 가방 명암) ===
    bg = warped_leather_arr.astype(float) / 255.0
    
    result = np.zeros_like(bg)
    cond = fg > 0.5
    for c in range(3):
        bg_channel = bg[:,:,c]
        res_channel = np.empty_like(bg_channel)
        res_channel[~cond] = 2.0 * fg[~cond] * bg_channel[~cond]
        res_channel[cond] = 1.0 - 2.0 * (1.0 - fg[cond]) * (1.0 - bg_channel[cond])
        result[:,:,c] = res_channel
        
    final_textured = Image.fromarray((result * 255).astype(np.uint8))
    
    # 색감 부스팅
    final_textured = ImageEnhance.Color(final_textured).enhance(1.15)
    final_textured = ImageEnhance.Contrast(final_textured).enhance(1.05)
    
    # 마스크를 이용해 원본 배경과 합성 (가장 중요한 배경 보존 단계)
    final_img = Image.composite(final_textured, template_img, mask)
    
    # 원본 이미지가 투명도(Alpha)를 가지고 있다면 투명도 복원
    original_template_img = Image.open(io.BytesIO(template_bytes))
    if original_template_img.mode in ('RGBA', 'LA') or (original_template_img.mode == 'P' and 'transparency' in original_template_img.info):
        alpha_channel = original_template_img.convert("RGBA").split()[-1]
        # 리사이즈 된 경우 크기 맞추기
        if alpha_channel.size != final_img.size:
            alpha_channel = alpha_channel.resize(final_img.size, Image.Resampling.LANCZOS)
        final_img.putalpha(alpha_channel)
    
    # 원래 해상도로 1:1 복원
    if final_img.size != (orig_w, orig_h):
        final_img = final_img.resize((orig_w, orig_h), Image.Resampling.LANCZOS)
    
    out_buf = io.BytesIO()
    final_img.save(out_buf, format="PNG")
    return out_buf.getvalue()

@app.post("/api/v1/synthesize")
async def synthesize(req: SynthesisRequest):
    print("\n[INFO] 로컬 3D 마스킹 합성 파이프라인 시작...")
    print(f"[DEBUG] Leather URL: {req.leather_url}")
    print(f"[DEBUG] Template URL: {req.template_url}")
    
    leather_bytes = get_image_data(req.leather_url)
    template_bytes = get_image_data(req.template_url)

    if not leather_bytes or not template_bytes:
        print("[WARNING] Could not download images.")
        return {"result_image_url": req.leather_url}
    
    try:
        # 로컬 엔진으로 래핑
        result_bytes = apply_texture_with_mask(leather_bytes, template_bytes)
        b64_image = base64.b64encode(result_bytes).decode('utf-8')
        
        print("[SUCCESS] Synthesis complete! Returning correctly blended image.")
        return {"result_image_url": f"data:image/png;base64,{b64_image}"}
        
    except Exception as e:
        print(f"[ERROR] Synthesis failed: {e}")
        with open("error_log.txt", "w", encoding="utf-8") as f:
            f.write(traceback.format_exc())

    return {"result_image_url": req.leather_url}


