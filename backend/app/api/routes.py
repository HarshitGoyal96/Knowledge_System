from fastapi import APIRouter,UploadFile, File,Query
from app.services.nlp_services import extract_keywords, extract_summary, highlight_words,analyze_large_text
from app.services.ocr_services import extract_text
from app.services.pdf_services import extract_text_from_pdf
from app.models.pdf import PDF
from app.services.semantic_service import (
    search_chunks,
    store_pdf_chunks,
    get_all_documents,
    get_relevant_documents,
    collection
)
from app.services.chat_service import generate_answer
from app.services.learning_service import generate_learning_content
from app.services.chat_service import explain_topic
from app.services.chunk_service import chunk_text
from app.models.message import Message
from app.models.chat import Chat
from fastapi.responses import StreamingResponse
from app.db.database import SessionLocal

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
async def upload_pdf(
    file: UploadFile = File(...)
):

    content = await file.read()

    text = extract_text_from_pdf(
        content
    )

    store_pdf_chunks(
        text,
        file.filename
    )

    return {
        "message": "PDF uploaded"
    }
    

@router.post("/search-pdf")
async def search_pdf(
    query: str = Query(...)
):

    try:

        results = search_chunks(query)

        formatted_results = [

    {
        "text": item["text"],
        "source": item["metadata"]["source"]
    }

    for item in results

]

        return {

            "query": query,

            "results": formatted_results

        }

    except Exception as e:

        print("ERROR:", str(e))

        return {
            "error": str(e)
        }

@router.post("/chat-pdf")
async def chat_pdf(
    query: str = Query(...),
    chat_id: int = Query(...)
):

    db = SessionLocal()

    # SAVE USER MESSAGE ONLY IF LOGGED IN

    if chat_id != 0:

        user_message = Message(

            role="user",

            content=query,

            chat_id=chat_id

        )

        db.add(user_message)

        db.commit()

    # STREAM RESPONSE

    def generate_stream():

        full_answer = ""

        for chunk in generate_answer(
            query,
            ""
        ):

            full_answer += chunk

            yield chunk

        # SAVE AI MESSAGE

        if chat_id != 0:

            ai_message = Message(

                role="assistant",

                content=full_answer,

                chat_id=chat_id

                )   

            db.add(ai_message)

            db.commit()

    return StreamingResponse(
        generate_stream(),
        media_type="text/plain"
    )
    
@router.get("/chat-history/{chat_id}")
def get_chat_history(chat_id: int):

    db = SessionLocal()

    messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).all()

    return messages


@router.post("/analyze-notes")
async def analyze_notes():

    # GET ALL PDF TEXT FROM CHROMADB

    text = get_relevant_documents()

    # GENERATE AI CONTENT

    result = generate_learning_content(
        text
    )

    return result

@router.post("/explain-node")
async def explain_node(
    topic: str = Query(...)
):

    try:

        explanation = ""

        response = explain_topic(
            topic,
            ""
        )

        # HANDLE NORMAL STRING

        if isinstance(response, str):

            explanation = response

        else:

            # HANDLE GENERATOR

            for chunk in response:

                explanation += chunk

        return {

            "success": True,

            "explanation": explanation

        }

    except Exception as e:

        print("EXPLAIN NODE ERROR:", e)

        return {

            "success": False,

            "error": str(e)

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
@router.delete("/clear-history/{chat_id}")
def clear_history(chat_id: int):

    db = SessionLocal()

    messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).all()

    for message in messages:

        db.delete(message)

    db.commit()

    return {
        "message": "History cleared"
    }
    
@router.get("/list-pdfs")
def list_pdfs():

    results = collection.get()

    metadatas = results["metadatas"]

    pdfs = list(

        set(

            [

                meta["source"]

                for meta in metadatas

                if meta and "source" in meta

            ]

        )

    )

    return {
        "pdfs": pdfs
    }
@router.post("/reset-memory")
async def reset_memory():

    # GET ALL IDS

    results = collection.get()

    ids = results["ids"]

    # DELETE ALL DOCUMENTS

    if ids:

        collection.delete(
            ids=ids
        )

    return {
        "message": "Memory cleared"
    }