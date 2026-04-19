from fastapi import APIRouter,UploadFile, File,Query
from app.services.nlp_services import extract_keywords, extract_summary, highlight_words,analyze_large_text
from app.services.ocr_services import extract_text
from app.services.pdf_services import extract_text_from_pdf
from app.services.semantic_service import semantic_search

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
    
@router.post("/search-pdf")
async def search_pdf(file: UploadFile = File(...), query: str = Query(...)):
    try:
        content = await file.read()

        print("Query:", query)

        text = extract_text_from_pdf(content)

        results = semantic_search(query, text)

        return {
            "query": query,
            "results": results
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {"error": str(e)}