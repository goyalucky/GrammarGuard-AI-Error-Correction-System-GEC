# backend/api/document_routes.py
import io
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from sqlalchemy.orm import Session
from database import get_db
from pypdf import PdfReader
import docx
from services.document_processor import document_processor
from services.analytics_service import analytics_service

doc_router = APIRouter(prefix="/api/v1/documents", tags=["Document Processing"])

def extract_text_from_file(file: UploadFile, content: bytes) -> str:
    filename = file.filename.lower()
    if filename.endswith(".txt"):
        return content.decode("utf-8", errors="ignore")
    
    if filename.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(content))
        extracted = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                extracted.append(text)
        return "\n".join(extracted)
        
    if filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(content))
        return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
        
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Unsupported file format. Please upload .txt, .pdf, or .docx."
    )

@doc_router.post("/review")
async def review_document(
    file: UploadFile = File(...),
    context_type: str = Form("general"),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        raw_text = extract_text_from_file(file, content).strip()
        
        if not raw_text:
            raise HTTPException(status_code=400, detail="The uploaded document contains no readable text.")

        result = document_processor.process_document_text(raw_text, context_type=context_type)

        # Persist document review session to SQLite
        analytics_service.log_activity(
            db=db,
            activity_type="document_review",
            title=f"Document: {file.filename}",
            text=raw_text,
            error_count=result["error_count"],
            confidence_score=0.95,
            categories=result["categories"]
        )

        return {
            "filename": file.filename,
            **result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")