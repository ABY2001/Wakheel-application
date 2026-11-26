import { academyApi } from "@/lib/academyApi";

export interface BookChapter {
  id: string;
  chapterNumber: number;
  title: string;
  pageNumber: number;
  content: string;
}

export interface LawBook {
  id: string;
  title: string;
  author: string;
  department: string;
  edition: string;
  fileSize: string;
  totalPages: number;
  format: "PDF" | "EPUB";
  coverGradient: string;
  description: string;
  uploadedBy: string;
  uploadedDate: string;
  downloadCount: number;
  chapters: BookChapter[];
}

export const INITIAL_BOOKS: LawBook[] = [];

const STORAGE_KEY = "wakheel_academy_books_catalog";

export function getStoredBooks(): LawBook[] {
  if (typeof window === "undefined") return INITIAL_BOOKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_BOOKS;
  } catch {
    return INITIAL_BOOKS;
  }
}

export async function syncBooksWithServer(): Promise<LawBook[]> {
  if (typeof window === "undefined") return INITIAL_BOOKS;
  try {
    const res = await academyApi.getBooks();
    if (res.success && Array.isArray(res.books)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res.books));
      window.dispatchEvent(new Event("storage"));
      return res.books;
    }
  } catch (err) {
    console.warn("Failed to sync books with server:", err);
  }
  return getStoredBooks();
}

export function saveBook(newBook: LawBook): LawBook[] {
  if (typeof window === "undefined") return [newBook, ...INITIAL_BOOKS];
  try {
    const current = getStoredBooks();
    const updated = [newBook, ...current.filter((b) => b.id !== newBook.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    academyApi.createBook(newBook).catch((err) => console.warn("saveBook remote sync:", err));
    return updated;
  } catch {
    return [newBook, ...INITIAL_BOOKS];
  }
}

export function deleteBook(bookId: string): LawBook[] {
  if (typeof window === "undefined") return INITIAL_BOOKS;
  try {
    const current = getStoredBooks();
    const updated = current.filter((b) => b.id !== bookId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    academyApi.deleteBook(bookId).catch((err) => console.warn("deleteBook remote sync:", err));
    return updated;
  } catch {
    return INITIAL_BOOKS;
  }
}

export function incrementDownloadCount(bookId: string): LawBook[] {
  if (typeof window === "undefined") return INITIAL_BOOKS;
  try {
    const current = getStoredBooks();
    const updated = current.map((b) =>
      b.id === bookId ? { ...b, downloadCount: b.downloadCount + 1 } : b
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    academyApi.incrementBookDownload(bookId).catch((err) => console.warn("incrementDownloadCount remote sync:", err));
    return updated;
  } catch {
    return INITIAL_BOOKS;
  }
}

export function downloadBookFile(book: LawBook) {
  if (typeof window === "undefined") return;

  const content = `================================================================================
${book.title.toUpperCase()}
================================================================================
Author / Faculty: ${book.author}
Department: ${book.department}
Edition: ${book.edition}
Format: ${book.format} • Total Pages: ${book.totalPages}
Published By: ${book.uploadedBy}
Date: ${book.uploadedDate}

--------------------------------------------------------------------------------
SYLLABUS & OVERVIEW
--------------------------------------------------------------------------------
${book.description}

--------------------------------------------------------------------------------
TABLE OF CONTENTS & CHAPTER TRANSCRIPTS
--------------------------------------------------------------------------------
${book.chapters
  .map(
    (ch) => `
================================================================================
CHAPTER ${ch.chapterNumber}: ${ch.title} (Page ${ch.pageNumber})
================================================================================
${ch.content}
`
  )
  .join("\n")}

--------------------------------------------------------------------------------
Published via Wakheel Legal Academy Courseware Repository
All Rights Reserved • Verified Faculty Manuscript
================================================================================
`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${book.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Wakheel_Academy.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
