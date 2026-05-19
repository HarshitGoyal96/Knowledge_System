import pytesseract
import cv2
import numpy as np
import re
from textblob import TextBlob


# OPTIONAL FOR WINDOWS LOCALHOST
# Uncomment if needed locally

# pytesseract.pytesseract.tesseract_cmd = (
#     r"C:\Program Files\Tesseract-OCR\tesseract.exe"
# )


def clean_text(text):

    text = re.sub(r"[|]", "", text)

    text = re.sub(r"\s+", " ", text)

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


def preprocess_image(img):

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    gray = cv2.GaussianBlur(gray, (5, 5), 0)

    thresh = cv2.adaptiveThreshold(

        gray,

        255,

        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,

        cv2.THRESH_BINARY,

        11,

        2

    )

    thresh = cv2.medianBlur(thresh, 3)

    return thresh


def extract_text(image_bytes):

    nparr = np.frombuffer(image_bytes, np.uint8)

    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:

        return ""

    # upscale image for better OCR

    img = cv2.resize(

        img,

        None,

        fx=2,

        fy=2,

        interpolation=cv2.INTER_CUBIC

    )

    processed = preprocess_image(img)

    config = r'--oem 3 --psm 6'

    text = pytesseract.image_to_string(

        processed,

        config=config

    )

    text = clean_text(text)

    text = correct_text(text)

    return text