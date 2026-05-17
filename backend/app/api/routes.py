from fastapi import APIRouter,UploadFile, File,Query
from app.services.nlp_services import extract_keywords, extract_summary, highlight_words,analyze_large_text
from app.services.ocr_services import extract_text
from app.services.pdf_services import extract_text_from_pdf
from app.services.semantic_service import semantic_search
from app.services.chat_service import generate_answer
from app.services.learning_service import generate_learning_content
from app.services.chat_service import explain_topic
from app.services.chunk_service import chunk_text
from app.models.message import Message
from app.models.chat import Chat
from app.db.database import SessionLocal
from app.services.vector_service import (
    store_chunks
)
router = APIRouter()
@router.get("/health")
def health_check():
    return {"status":"Ok"}


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content  = await file.read()
    text = extract_text(content)
    
    return {"extracted_text":text}

@router.post("/analyze")
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

@router.post("/chat-pdf")
async def chat_pdf(file: UploadFile = File(...), query: str = Query(...),chat_id: int = Query(...)):
    content = await file.read()
    text = extract_text_from_pdf(content)
    db = SessionLocal()
    user_message = Message(
    role="user",
    content=query,
    chat_id=chat_id
    )

    db.add(user_message)

    db.commit()
    answer = generate_answer(query, text)
    ai_message = Message(
    role="assistant",
    content=answer,
    chat_id=1
    )

    db.add(ai_message)

    db.commit()
    return {
        "query": query,
        "answer": answer
    }

@router.get("/chat-history/{chat_id}")
def get_chat_history(chat_id: int):

    db = SessionLocal()

    messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).all()

    return messages


@router.post("/analyze-notes")
async def analyze_notes(file: UploadFile = File(...)):
    content = await file.read()

    text = extract_text_from_pdf(content)
    chunks = chunk_text(text)

    store_chunks(chunks)
    result = generate_learning_content(text)

    return {
        "analysis": result
    }

@router.post("/explain-node")
async def explain_node(
    file: UploadFile = File(...),
    topic: str = Query(...)
):

    contents = await file.read()

    text = extract_text_from_pdf(contents)

    explanation = explain_topic(topic, text)

    return {
        "topic": topic,
        "explanation": explanation
    }
@router.post("/create-chat")
def create_chat():

    db = SessionLocal()

    new_chat = Chat(
        title="New Chat",
        workspace_id=1
    )

    db.add(new_chat)

    db.commit()

    db.refresh(new_chat)

    return {
        "chat_id": new_chat.id,
        "title": new_chat.title
    }
@router.get("/all-chats")
def get_all_chats():

    db = SessionLocal()

    chats = db.query(Chat).all()

    return chats

@router.delete("/delete-chat/{chat_id}")
def delete_chat(chat_id: int):

    db = SessionLocal()

    chat = db.query(Chat).filter(
        Chat.id == chat_id
    ).first()

    if not chat:

        return {
            "error": "Chat not found"
        }

    db.delete(chat)

    db.commit()

    return {
        "message": "Chat deleted"
    }