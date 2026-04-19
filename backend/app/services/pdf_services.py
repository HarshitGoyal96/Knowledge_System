from pdf2image import convert_from_bytes
import numpy as np
import cv2
from app.services.ocr_services import extract_text

MAX_PAGES = 10

def extract_text_from_pdf(pdf_bytes):
    images = convert_from_bytes(pdf_bytes,poppler_path=r"C:\Users\goyal\poppler\poppler-25.12.0\Library\bin")
    full_text = ""
    
    for i , img in enumerate(images[:MAX_PAGES]):
        print(f"Processing Page {i+1}...")
        img_np = np.array(img)
        
        img_cv = cv2.cvtColor(img_np,cv2.COLOR_RGB2BGR)
        
        _, buffer = cv2.imencode('.jpg',img_cv)
        text = extract_text(buffer.tobytes())
        
        full_text +=text +"\n"
        
    return full_text
        