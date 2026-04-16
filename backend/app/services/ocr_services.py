import pytesseract
import cv2
import numpy as np
import re
import easyocr
from textblob import TextBlob


pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

reader = easyocr.Reader(['en'], gpu=False)


def clean_text(text):
    text = re.sub(r'[|]', '', text)          
    text = re.sub(r'\s+', ' ', text)         
    return text.strip()

def correct_text(text):
    corrections = {
        "Wwi": "www",
        "ImgOcR": "imgOCR",
        "HOw": "HOW",
        "EXTRAGT": "EXTRACT",
        "GUIDBFOR": "GUIDE FOR",
        "EVERYONB": "EVERYONE"
    }

    for wrong, right in corrections.items():
        text = text.replace(wrong, right)

    try:
        text = str(TextBlob(text).correct())
    except:
        pass

    return text


def extract_text_tesseract(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Adaptive threshold
    thresh = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        11,
        2
    )

    thresh = cv2.medianBlur(thresh, 3)

    config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(thresh, config=config)

    return text


def extract_text_easyocr(img):
    result = reader.readtext(img)
    text = " ".join([item[1] for item in result])
    return text


def extract_text(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    img = cv2.convertScaleAbs(img, alpha=1.5, beta=0)
    text = extract_text_tesseract(img)
    if len(text.strip()) < 30:
        print("⚡ Switching to EasyOCR...")
        text = extract_text_easyocr(img)
    text = clean_text(text)
    text = correct_text(text)

    return text