from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from routes.rag_engine import JACRAGService

app = FastAPI(
    title="JAC Chandigarh AI Assistant API",
    description="RAG-powered Knowledge Engine for JAC Counselling"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_service = JACRAGService()

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    citations: list[int]

@app.get("/")
async def root():
    return {"message": "Welcome"}


@app.post("/api/ask", response_model=QueryResponse)
def ask_counselling_question(request: QueryRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    
    try:
        result = rag_service.query_counselling_info(request.question)
        return QueryResponse(
            answer=result["answer"],
            citations=result["citations"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))