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
export type PrintType = 'all' | 'books' | 'magazines';

export interface BookSearchParams {
  query: string;
  category?: string;   // appended as +subject:<category>
  orderBy?: OrderBy;
  printType?: PrintType;
  startIndex?: number;
  maxResults?: number;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

// ── Domain ────────────────────────────────────────────────────────────────────

export type BookStatus = 'available' | 'borrowed' | 'reserved';

export type ReadingStatus = 'reading' | 'completed';

export interface Loan {
  id: string;
  volumeId: string;
  volumeInfo: Pick<VolumeInfo, 'title' | 'authors' | 'imageLinks'>;
  borrowedAt: string;        // ISO 8601
  dueDate: string;           // ISO 8601
  returnedAt?: string;       // ISO 8601 — undefined while still on loan
  status: 'active' | 'returned' | 'overdue';
  readingStatus?: ReadingStatus;
}

export interface WishlistItem {
  volumeId: string;
  volumeInfo: Pick<VolumeInfo, 'title' | 'authors' | 'imageLinks'>;
  addedAt: string;           // ISO 8601
}
