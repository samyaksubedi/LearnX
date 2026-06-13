# extract_pdf_pages(pdf_path)
# [{"page": 1, "text": "..."}, {"page": 2, "text": "..."}]
from langchain_community.document_loaders import PyPDFLoader


def extract_pdf_pages(pdf_path):
    loader = PyPDFLoader(pdf_path)
    docs = loader.load()  # one Document per page, with metadata["page"]

    return [
        {"page": doc.metadata["page"] + 1, "text": doc.page_content} for doc in docs
    ]
