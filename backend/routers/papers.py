from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Body, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models.paper import Paper
from schemas.paper import PaperResponse
from utils.pdf_processor import (
    extract_text_from_pdf, chunk_text, summarize_text, 
    extract_metadata_from_pdf, generate_synthesized_report,
    create_docx_report, create_pdf_report
)
from utils.vectordb import add_paper_to_vectordb, search_papers, delete_paper_from_vectordb
from typing import List, Optional
import os
import shutil

router = APIRouter(
    prefix="/papers",
    tags=["Papers"]
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_current_user_id():
    return 1  # Mock user ID

@router.post("/upload", response_model=PaperResponse)
async def upload_paper(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a PDF research paper"""
    user_id = get_current_user_id()
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Save file
    file_path = os.path.join(UPLOAD_DIR, f"{user_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Extract text
        text = extract_text_from_pdf(file_path)
        
        # Extract metadata
        metadata = extract_metadata_from_pdf(text)
        
        # Generate summary
        summary = summarize_text(text)
        
        # Create paper record
        paper = Paper(
            user_id=user_id,
            title=metadata['title'],
            authors=metadata['authors'],
            file_path=file_path,
            file_name=file.filename,
            summary=summary
        )
        db.add(paper)
        db.commit()
        db.refresh(paper)
        
        # Chunk text and add to vector database
        chunks = chunk_text(text)
        metadatas = [{"paper_id": paper.id, "chunk_index": i} for i in range(len(chunks))]
        add_paper_to_vectordb(paper.id, chunks, metadatas)
        
        return paper
    except Exception as e:
        # Clean up file if processing fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.get("/", response_model=List[PaperResponse])
def get_papers(db: Session = Depends(get_db)):
    """Get all papers for current user"""
    user_id = get_current_user_id()
    papers = db.query(Paper).filter(Paper.user_id == user_id).order_by(Paper.uploaded_at.desc()).all()
    return papers

@router.get("/{paper_id}", response_model=PaperResponse)
def get_paper(paper_id: int, db: Session = Depends(get_db)):
    """Get specific paper"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper

@router.delete("/{paper_id}")
def delete_paper(paper_id: int, db: Session = Depends(get_db)):
    """Delete a paper"""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    # Delete file
    if os.path.exists(paper.file_path):
        os.remove(paper.file_path)
    
    # Delete from vector database
    delete_paper_from_vectordb(paper_id)
    
    # Delete from database
    db.delete(paper)
    db.commit()
    
    return {"message": "Paper deleted successfully"}

@router.post("/search")
def search_in_papers(query: dict, db: Session = Depends(get_db)):
    """Search across all papers using vector similarity"""
    try:
        results = search_papers(query.get("query", ""), n_results=5)
        return {
            "query": query.get("query"),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.post("/upload-batch", response_model=List[PaperResponse])
async def upload_batch(
    files: List[UploadFile] = File(...), 
    titles: List[str] = Form(...),
    db: Session = Depends(get_db)
):
    """Upload multiple PDF research papers with custom titles"""
    user_id = get_current_user_id()
    results = []
    
    # Process files and titles in pairs
    for i, file in enumerate(files):
        title = titles[i] if i < len(titles) else file.filename
        if not file.filename.endswith('.pdf'):
            continue
            
        file_path = os.path.join(UPLOAD_DIR, f"{user_id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        try:
            print(f"Processing file: {file.filename}")
            text = extract_text_from_pdf(file_path)
            print(f"Extracted text length: {len(text)}")
            metadata = extract_metadata_from_pdf(text)
            print(f"Metadata extracted: {metadata}")
            summary = summarize_text(text)
            print(f"Summary generated: {summary[:50]}...")
            
            paper = Paper(
                user_id=user_id,
                title=title,  # Use custom title from user
                authors=metadata['authors'],
                file_path=file_path,
                file_name=file.filename,
                summary=summary
            )
            db.add(paper)
            db.commit()
            db.refresh(paper)
            
            chunks = chunk_text(text)
            metadatas = [{"paper_id": paper.id, "chunk_index": i} for i in range(len(chunks))]
            add_paper_to_vectordb(paper.id, chunks, metadatas)
            
            results.append(paper)
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            print(f"Failed to process {file.filename}: {str(e)}")
            # We don't raise here, just skip and continue to allow partial success
            continue
            
    return results

@router.post("/synthesize-report")
def synthesize_report(paper_ids: List[int] = Body(...), db: Session = Depends(get_db)):
    """Synthesize a report from multiple papers"""
    papers = db.query(Paper).filter(Paper.id.in_(paper_ids)).all()
    if not papers:
        raise HTTPException(status_code=404, detail="No papers found")
    
    summaries = [f"Title: {p.title}\nAuthors: {p.authors}\nSummary: {p.summary}" for p in papers if p.summary]
    
    if not summaries:
        raise HTTPException(status_code=400, detail="No summaries available to synthesize")
        
    report = generate_synthesized_report(summaries)
    return {"report": report}

@router.post("/export")
def export_report(data: dict = Body(...)):
    """Export report to PDF or DOCX"""
    content = data.get("content")
    export_format = data.get("format", "pdf").lower()
    
    print(f"Exporting report in {export_format} format...")
    if not content:
        print("Export failed: No content provided")
        raise HTTPException(status_code=400, detail="No content provided")
        
    os.makedirs("exports", exist_ok=True)
    
    try:
        if export_format == "docx":
            file_path = "exports/research_report.docx"
            create_docx_report(content, file_path)
            print(f"Docx created: {file_path}")
            return FileResponse(file_path, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", filename="research_report.docx")
        else:
            file_path = "exports/research_report.pdf"
            create_pdf_report(content, file_path)
            print(f"PDF created: {file_path}")
            return FileResponse(file_path, media_type="application/pdf", filename="research_report.pdf")
    except Exception as e:
        print(f"Export logic failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
