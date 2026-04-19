import io
import hashlib
from PyPDF2 import PdfReader
from pdf2image import convert_from_bytes
import pytesseract
import cv2
import numpy as np

# 🔥 In-memory cache (can upgrade to Redis later)
CACHE = {}


# 🔹 Generate unique key for file
def get_file_hash(file_bytes):
    return hashlib.md5(file_bytes).hexdigest()


# 🔹 Fast text extraction (no OCR)
def extract_text_fast(file_bytes):
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    return text.strip()


def extract_text_ocr(file_bytes, max_pages=10):
    images = convert_from_bytes(file_bytes)

    text = ""
    for i, img in enumerate(images):
        if i >= max_pages:   
            break

        img = np.array(img)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)

        page_text = pytesseract.image_to_string(thresh)
        text += page_text + "\n"

    return text

def extract_text_from_pdf(file_bytes):

    file_key = get_file_hash(file_bytes)

 
    if file_key in CACHE:
        print("⚡ Using cached text")
        return CACHE[file_key]

    print("📄 Extracting text...")


    text = extract_text_fast(file_bytes)

    if len(text) < 50:
        print("⚡ Switching to OCR...")
        text = extract_text_ocr(file_bytes)

    CACHE[file_key] = text

    return text