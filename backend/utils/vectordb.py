import chromadb
from chromadb.config import Settings
import os

# Initialize ChromaDB client
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Get or create collection for research papers
papers_collection = chroma_client.get_or_create_collection(
    name="research_papers",
    metadata={"description": "Vector embeddings of research papers"}
)

def add_paper_to_vectordb(paper_id: int, chunks: list[str], metadatas: list[dict]):
    """Add paper chunks to vector database"""
    ids = [f"paper_{paper_id}_chunk_{i}" for i in range(len(chunks))]
    papers_collection.add(
        documents=chunks,
        metadatas=metadatas,
        ids=ids
    )

def search_papers(query: str, n_results: int = 5):
    """Search for relevant paper chunks"""
    results = papers_collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results

def delete_paper_from_vectordb(paper_id: int):
    """Delete all chunks of a paper from vector database"""
    # Get all IDs for this paper
    results = papers_collection.get(
        where={"paper_id": paper_id}
    )
    if results['ids']:
        papers_collection.delete(ids=results['ids'])
