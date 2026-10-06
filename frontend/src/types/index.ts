export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string; rejectedValue?: any }>;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface HealthData {
  status: string;
  app: string;
  timestamp: string;
  uptimeMs: number;
  activeProfiles: string[];
  database: {
    status: string;
    connectivity: string;
    error?: string;
  };
  features: {
    nluSearch: boolean;
    semanticSearch: boolean;
    recommendations: boolean;
    ocrIntake: boolean;
    riskScoring: boolean;
  };
}

export type UserRole = 'ROLE_ADMIN' | 'ROLE_LIBRARIAN' | 'ROLE_MEMBER';

export interface UserSummary {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: UserRole[];
  membershipStatus: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserSummary;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

// Catalog Types
export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Author {
  id: number;
  name: string;
  biography?: string;
}

export interface BookCopy {
  id: number;
  bookId: number;
  barcode: string;
  conditionNote: string;
  status: 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'LOST' | 'MAINTENANCE';
  qrCodeImage?: string;
  bookTitle?: string;
  bookIsbn?: string;
  bookCategory?: string;
  bookLanguage?: string;
  bookAuthors?: string[];
}

export interface Book {
  id: number;
  title: string;
  isbn: string;
  publicationYear?: number;
  summary?: string;
  categoryId?: number;
  categoryName?: string;
  authors: string[];
  totalCopies: number;
  availableCopies: number;
  available: boolean;
  language: string;
  originalLanguage?: string;
  translatedFromId?: number;
  translatedFromTitle?: string;
}

export interface BookDetail {
  id: number;
  title: string;
  isbn: string;
  publicationYear?: number;
  summary?: string;
  language: string;
  originalLanguage?: string;
  translatedFromId?: number;
  translatedFromTitle?: string;
  category?: Category;
  authors: Author[];
  copies: BookCopy[];
  translations: Book[];
  totalCopies: number;
  availableCopies: number;
  available: boolean;
  createdAt: string;
}

export interface CreateBookRequest {
  title: string;
  isbn: string;
  publicationYear?: number;
  summary?: string;
  language?: string;
  originalLanguage?: string;
  translatedFromId?: number;
  categoryId?: number;
  categoryName?: string;
  authors: string[];
  initialCopies: number;
}

export interface BookRating {
  id: number;
  bookId: number;
  bookTitle: string;
  userId: number;
  username: string;
  memberFullName: string;
  rating: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookRatingsSummary {
  bookId: number;
  averageRating: number;
  totalRatings: number;
  reviews: PageResponse<BookRating>;
  userRating?: BookRating;
}

export interface RateBookRequest {
  rating: number;
  review?: string;
}

export interface Loan {
  id: number;
  bookId: number;
  bookTitle: string;
  bookIsbn: string;
  bookLanguage?: string;
  bookCategory?: string;
  bookAuthors?: string[];
  bookCopyId: number;
  barcode: string;
  userId: number;
  username: string;
  memberFullName: string;
  userEmail?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  renewalCount: number;
  fineAmount?: number;
  lateDays?: number;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST';
  overdue: boolean;
  accruedFine: number;
  currentOverdueDays?: number;
  rentalFee?: number;
  paymentReference?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  bookingPeriodDays?: number;
  dailyRentalRate?: number;
}

export interface BookRentalRequest {
  bookId: number;
  barcode?: string;
  rentalPeriodDays: number;
  paymentMethod?: string;
  paymentReference?: string;
}

export interface RentalQuote {
  bookId: number;
  bookTitle: string;
  bookLanguage: string;
  rentalPeriodDays: number;
  dailyRentalRate: number;
  totalRentalFee: number;
  dueDatePreview: string;
  availableForRental: boolean;
  availableCopies: number;
}

export interface MemberLoanStats {
  userId: number;
  username: string;
  totalLoans: number;
  activeLoans: number;
  returnedLoans: number;
  overdueLoans: number;
  averageLateDays: number;
  totalFinesAccrued: number;
}

export interface Fine {
  id: number;
  loanId: number;
  bookTitle: string;
  barcode: string;
  userId: number;
  username: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'WAIVED';
  createdAt: string;
}

export interface Reservation {
  id: number;
  bookId: number;
  bookTitle: string;
  bookIsbn: string;
  userId: number;
  username: string;
  reservationDate: string;
  expiryDate?: string;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
}

export interface IssueLoanRequest {
  barcode: string;
  username: string;
  loanPeriodDays?: number;
}

export interface ReturnLoanRequest {
  barcode: string;
}

export interface PayFineRequest {
  amount: number;
}

// Analytics & Audit Types
export interface TopBook {
  bookId: number;
  title: string;
  category: string;
  borrowCount: number;
}

export interface CategoryStat {
  categoryName: string;
  bookCount: number;
}

export interface DashboardStats {
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  activeLoans: number;
  overdueLoans: number;
  totalMembers: number;
  totalFinesCollected: number;
  outstandingFines: number;
  topBorrowedBooks: TopBook[];
  categoryDistribution: CategoryStat[];
}

export interface AuditLog {
  id: number;
  userId?: number;
  username?: string;
  action: string;
  entityType: string;
  entityId?: number;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

// AI Subsystem Types
export interface SemanticSearchResult {
  book: Book;
  relevanceScore: number;
  matchReason: string;
}

export interface AiSearchResponse {
  originalQuery: string;
  interpretedIntent: string;
  results: SemanticSearchResult[];
}

export interface ToolExecution {
  toolName: string;
  arguments: Record<string, any>;
  status: string;
  summary: string;
}

export interface ChatMessageRequest {
  message: string;
  sessionId?: string;
  bookContext?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  groundedInCatalog: boolean;
  isDegraded?: boolean;
  toolExecutions?: ToolExecution[];
  suggestedFollowUps?: string[];
  referencedBookIds?: number[];
  timestamp?: string;
}

export interface AiChatRequest {
  message: string;
  sessionId?: string;
  bookContext?: string;
}

export interface AiChatResponse {
  reply: string;
  sessionId?: string;
  groundedInCatalog?: boolean;
  isDegraded?: boolean;
  toolExecutions?: ToolExecution[];
  suggestedFollowUps?: string[];
  referencedBookIds?: number[];
}

export interface Citation {
  bookId: number;
  title: string;
  format: 'APA' | 'MLA' | 'CHICAGO' | 'HARVARD' | 'BIBTEX';
  citationText: string;
}

export interface PatronRisk {
  username: string;
  memberName: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  totalHistoricalLoans: number;
  overdueLoansCount: number;
  unpaidFines: number;
  riskFactors: string[];
  recommendation: string;
}

export interface AiRecommendation {
  rationale: string;
  recommendedBooks: Book[];
}

// Admin Types
export interface UserManagement {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  membershipStatus: string;
  createdAt: string;
}

export interface SystemConfig {
  maxBooksPerMember: number;
  maxRenewalCount: number;
  defaultLoanPeriodDays: number;
  dailyFineRate: number;
  nluSearchEnabled: boolean;
  semanticSearchEnabled: boolean;
  aiRecommendationsEnabled: boolean;
}

export interface UpdateSystemConfigRequest {
  maxBooksPerMember?: number;
  maxRenewalCount?: number;
  defaultLoanPeriodDays?: number;
  dailyFineRate?: number;
}

export interface SeedingReport {
  totalImported: number;
  totalSkipped: number;
  totalCopiesSeeded: number;
  languagesCoveredCount: number;
  languageBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  durationSeconds: number;
  status: string;
  timestamp: string;
}

export interface BookDemandPrediction {
  bookId: number;
  title: string;
  isbn: string;
  categoryName: string;
  language: string;
  totalCopies: number;
  availableCopies: number;
  borrowCount: number;
  averageRating?: number;
  demandScore: number;
  recommendedCopiesToAcquire: number;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  heuristicRationale: string;
}

export interface MemberOverdueRisk {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  lateReturnsCount: number;
  avgLateDays: number;
  activeLoansCount: number;
  totalHistoricalLoans: number;
  membershipAgeDays: number;
  unpaidFines: number;
  riskFactors: string[];
  heuristicDisclaimer: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  username: string;
  loanId?: number;
  bookTitle?: string;
  bookAuthor?: string;
  bookBarcode?: string;
  type: 'DUE_SOON' | 'OVERDUE' | 'SYSTEM' | string;
  title: string;
  message: string;
  channel: string;
  isRead: boolean;
  sentAt: string;
  createdAt: string;
}

export interface NotificationBatchResult {
  dueSoonCount: number;
  overdueCount: number;
  totalProcessed: number;
  executedAt: string;
  statusMessage: string;
}

export interface CategoryCount {
  categoryName: string;
  count: number;
}

export interface MemberProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  membershipStatus: string;
  roles: string[];
  createdAt: string;
  membershipAgeDays: number;
}

export interface MemberLifetimeStats {
  totalLoans: number;
  activeLoans: number;
  returnedLoans: number;
  overdueLoans: number;
  totalFinesAssessed: number;
  totalFinesPaid: number;
  outstandingFines: number;
  avgReturnDelayDays: number;
  topCategories: CategoryCount[];
}

export interface MemberDetail {
  profile: MemberProfile;
  overdueRisk: MemberOverdueRisk;
  lifetimeStats: MemberLifetimeStats;
  activeLoans: Loan[];
  borrowingHistory: Loan[];
  ratings: BookRating[];
  reservations: Reservation[];
}

