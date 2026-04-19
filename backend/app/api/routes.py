from fastapi import APIRouter,UploadFile, File
from app.services.nlp_services import extract_keywords, extract_summary, highlight_words,analyze_large_text
from app.services.ocr_services import extract_text
from app.services.pdf_services import extract_text_from_pdf

router = APIRouter()
@router.get("/health")
def health_check():
    return {"status":"Ok"}


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content  = await file.read()
    text = extract_text(content)
    
    return {"extracted_text":text}

@router.post("/ana;yze")
async def analyze(file: UploadFile = File(...)):
    content = await file.read()
    
    text = extract_text(content)
    
    keywords = extract_keywords(text)
    summary = extract_summary(text)
    highlights = highlight_words(text , keywords)
    
    return {
        "text":text,
        "Keywords": keywords,
        "summary":summary,
        "highlighted_text": highlights
    }

@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    content = await file.read()

    text = extract_text_from_pdf(content)
    keywords = analyze_large_text(text)

    return {
        "pages_processed": 10,
        "keywords": keywords
    }