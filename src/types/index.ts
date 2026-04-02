// ── Google Books API ─────────────────────────────────────────────────────────

export interface ImageLinks {
  smallThumbnail: string;
  thumbnail: string;
}

export interface VolumeInfo {
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  imageLinks?: ImageLinks;
  language?: string;
  previewLink?: string;
  infoLink?: string;
}

export interface Volume {
  id: string;
  kind: string;
  etag: string;
  selfLink: string;
  volumeInfo: VolumeInfo;
}

export interface BooksApiResponse {
  kind: string;
  totalItems: number;
  items?: Volume[];
}

// ── Search params ─────────────────────────────────────────────────────────────

export type OrderBy = 'relevance' | 'newest';

export interface BookSearchParams {
  query: string;
  category?: string;   // appended as +subject:<category>
  orderBy?: OrderBy;
  startIndex?: number;
  maxResults?: number;
}

// ── Domain ────────────────────────────────────────────────────────────────────

export type BookStatus = 'available' | 'borrowed' | 'reserved';

export interface Loan {
  id: string;
  volumeId: string;
  volumeInfo: Pick<VolumeInfo, 'title' | 'authors' | 'imageLinks'>;
  borrowedAt: string;   // ISO 8601
  dueDate: string;      // ISO 8601
  returnedAt?: string;  // ISO 8601 — undefined while still on loan
  status: 'active' | 'returned' | 'overdue';
}
