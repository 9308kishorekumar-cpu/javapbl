import axios from 'axios';
import {
  ApiResponse,
  HealthData,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserSummary,
  Book,
  BookDetail,
  Category,
  Author,
  CreateBookRequest,
  BookCopy,
  BookRating,
  BookRatingsSummary,
  RateBookRequest,
  PageResponse,
  Loan,
  MemberLoanStats,
  Fine,
  Reservation,
  IssueLoanRequest,
  ReturnLoanRequest,
  PayFineRequest,
  BookRentalRequest,
  RentalQuote,
  DashboardStats,
  BookDemandPrediction,
  MemberOverdueRisk,
  AuditLog,
  AiSearchResponse,
  AiChatRequest,
  AiChatResponse,
  ChatMessageRequest,
  ChatResponse,
  Citation,
  PatronRisk,
  AiRecommendation,
  UserManagement,
  SystemConfig,
  UpdateSystemConfigRequest,
  NotificationItem,
  NotificationBatchResult,
  MemberDetail,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('libraai_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Health
  getHealth: async (): Promise<ApiResponse<HealthData>> => {
    const res = await apiClient.get<ApiResponse<HealthData>>('/api/v1/health');
    return res.data;
  },
  ping: async (): Promise<ApiResponse<string>> => {
    const res = await apiClient.get<ApiResponse<string>>('/api/v1/health/ping');
    return res.data;
  },

  // Auth
  login: async (req: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', req);
    return res.data;
  },
  register: async (req: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/register', req);
    return res.data;
  },
  getMe: async (): Promise<ApiResponse<UserSummary>> => {
    const res = await apiClient.get<ApiResponse<UserSummary>>('/api/v1/auth/me');
    return res.data;
  },

  // Catalog
  getBooks: async (params?: {
    query?: string;
    categoryId?: number;
    language?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PageResponse<Book>>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Book>>>('/api/v1/books', { params });
    return res.data;
  },
  getBookById: async (id: number): Promise<ApiResponse<BookDetail>> => {
    const res = await apiClient.get<ApiResponse<BookDetail>>(`/api/v1/books/${id}`);
    return res.data;
  },
  getTranslationsOf: async (id: number): Promise<ApiResponse<Book[]>> => {
    const res = await apiClient.get<ApiResponse<Book[]>>(`/api/v1/books/${id}/translations`);
    return res.data;
  },
  getBookRatings: async (bookId: number, page = 0, size = 10): Promise<ApiResponse<BookRatingsSummary>> => {
    const res = await apiClient.get<ApiResponse<BookRatingsSummary>>(`/api/v1/books/${bookId}/ratings`, {
      params: { page, size },
    });
    return res.data;
  },
  rateBook: async (bookId: number, req: RateBookRequest): Promise<ApiResponse<BookRating>> => {
    const res = await apiClient.post<ApiResponse<BookRating>>(`/api/v1/books/${bookId}/ratings`, req);
    return res.data;
  },
  getBooksByLanguage: async (language: string, page = 0, size = 12): Promise<ApiResponse<PageResponse<Book>>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Book>>>(`/api/v1/books/languages/${language}`, {
      params: { page, size },
    });
    return res.data;
  },
  createBook: async (req: CreateBookRequest): Promise<ApiResponse<BookDetail>> => {
    const res = await apiClient.post<ApiResponse<BookDetail>>('/api/v1/books', req);
    return res.data;
  },
  deleteBook: async (id: number): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete<ApiResponse<void>>(`/api/v1/books/${id}`);
    return res.data;
  },
  addCopy: async (bookId: number, req?: { barcode?: string; conditionNote?: string }) => {
    const res = await apiClient.post(`/api/v1/books/${bookId}/copies`, req || {});
    return res.data;
  },
  getCopyByBarcode: async (barcode: string): Promise<ApiResponse<BookCopy>> => {
    const res = await apiClient.get<ApiResponse<BookCopy>>(`/api/v1/books/copies/barcode/${encodeURIComponent(barcode)}`);
    return res.data;
  },
  getCopyQrUrl: (copyId: number): string => {
    return `/api/v1/books/copies/${copyId}/qr`;
  },
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/api/v1/categories');
    return res.data;
  },
  getAuthors: async (): Promise<ApiResponse<Author[]>> => {
    const res = await apiClient.get<ApiResponse<Author[]>>('/api/v1/authors');
    return res.data;
  },

  // Transactions & Circulation & Rental Booking
  getRentalQuote: async (bookId: number, days: number = 14): Promise<ApiResponse<RentalQuote>> => {
    const res = await apiClient.get<ApiResponse<RentalQuote>>('/api/v1/loans/rental-quote', {
      params: { bookId, days },
    });
    return res.data;
  },
  bookRental: async (req: BookRentalRequest): Promise<ApiResponse<Loan>> => {
    const res = await apiClient.post<ApiResponse<Loan>>('/api/v1/loans/book-rental', req);
    return res.data;
  },
  getBookBookings: async (bookId: number): Promise<ApiResponse<Loan[]>> => {
    const res = await apiClient.get<ApiResponse<Loan[]>>(`/api/v1/books/${bookId}/bookings`);
    return res.data;
  },
  issueLoan: async (req: IssueLoanRequest): Promise<ApiResponse<Loan>> => {
    const res = await apiClient.post<ApiResponse<Loan>>('/api/v1/loans/issue', req);
    return res.data;
  },
  returnLoan: async (req: ReturnLoanRequest): Promise<ApiResponse<Loan>> => {
    const res = await apiClient.post<ApiResponse<Loan>>('/api/v1/loans/return', req);
    return res.data;
  },
  returnLoanById: async (loanId: number): Promise<ApiResponse<Loan>> => {
    const res = await apiClient.post<ApiResponse<Loan>>(`/api/v1/loans/${loanId}/return`);
    return res.data;
  },
  renewLoan: async (loanId: number): Promise<ApiResponse<Loan>> => {
    const res = await apiClient.post<ApiResponse<Loan>>(`/api/v1/loans/${loanId}/renew`);
    return res.data;
  },
  getMyLoans: async (): Promise<ApiResponse<Loan[]>> => {
    const res = await apiClient.get<ApiResponse<Loan[]>>('/api/v1/loans/my-loans');
    return res.data;
  },
  getMemberHistory: async (
    memberId: number,
    params?: { from?: string; to?: string; status?: string; page?: number; size?: number }
  ): Promise<ApiResponse<PageResponse<Loan>>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Loan>>>(`/api/v1/members/${memberId}/history`, { params });
    return res.data;
  },
  getMemberLoanStats: async (memberId: number): Promise<ApiResponse<MemberLoanStats>> => {
    const res = await apiClient.get<ApiResponse<MemberLoanStats>>(`/api/v1/members/${memberId}/loan-stats`);
    return res.data;
  },
  getActiveLoans: async (): Promise<ApiResponse<Loan[]>> => {
    const res = await apiClient.get<ApiResponse<Loan[]>>('/api/v1/loans/active');
    return res.data;
  },

  // Fines
  getMyFines: async (): Promise<ApiResponse<Fine[]>> => {
    const res = await apiClient.get<ApiResponse<Fine[]>>('/api/v1/fines/my-fines');
    return res.data;
  },
  payFine: async (fineId: number, req: PayFineRequest): Promise<ApiResponse<Fine>> => {
    const res = await apiClient.post<ApiResponse<Fine>>(`/api/v1/fines/${fineId}/pay`, req);
    return res.data;
  },

  // Reservations
  createReservation: async (bookId: number): Promise<ApiResponse<Reservation>> => {
    const res = await apiClient.post<ApiResponse<Reservation>>(`/api/v1/reservations/books/${bookId}`);
    return res.data;
  },
  getMyReservations: async (): Promise<ApiResponse<Reservation[]>> => {
    const res = await apiClient.get<ApiResponse<Reservation[]>>('/api/v1/reservations/my-reservations');
    return res.data;
  },
  cancelReservation: async (reservationId: number): Promise<ApiResponse<void>> => {
    const res = await apiClient.delete<ApiResponse<void>>(`/api/v1/reservations/${reservationId}`);
    return res.data;
  },

  // Analytics & Audit
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const res = await apiClient.get<ApiResponse<DashboardStats>>('/api/v1/analytics/dashboard');
    return res.data;
  },
  getPopularityPredictions: async (limit = 10): Promise<ApiResponse<BookDemandPrediction[]>> => {
    const res = await apiClient.get<ApiResponse<BookDemandPrediction[]>>('/api/v1/analytics/predictions', {
      params: { limit },
    });
    return res.data;
  },
  getOverdueRisks: async (): Promise<ApiResponse<MemberOverdueRisk[]>> => {
    const res = await apiClient.get<ApiResponse<MemberOverdueRisk[]>>('/api/v1/analytics/overdue-risk');
    return res.data;
  },
  getAuditLogs: async (): Promise<ApiResponse<AuditLog[]>> => {
    const res = await apiClient.get<ApiResponse<AuditLog[]>>('/api/v1/analytics/audit-logs');
    return res.data;
  },

  // Notifications
  getNotifications: async (limit = 20): Promise<ApiResponse<NotificationItem[]>> => {
    const res = await apiClient.get<ApiResponse<NotificationItem[]>>('/api/v1/notifications', {
      params: { limit },
    });
    return res.data;
  },
  getUnreadNotificationCount: async (): Promise<ApiResponse<{ unreadCount: number }>> => {
    const res = await apiClient.get<ApiResponse<{ unreadCount: number }>>('/api/v1/notifications/unread-count');
    return res.data;
  },
  markNotificationRead: async (id: number): Promise<ApiResponse<void>> => {
    const res = await apiClient.put<ApiResponse<void>>(`/api/v1/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsRead: async (): Promise<ApiResponse<void>> => {
    const res = await apiClient.put<ApiResponse<void>>('/api/v1/notifications/read-all');
    return res.data;
  },
  triggerNotificationJob: async (): Promise<ApiResponse<NotificationBatchResult>> => {
    const res = await apiClient.post<ApiResponse<NotificationBatchResult>>('/api/v1/notifications/trigger-job');
    return res.data;
  },

  // Librarian Member Intelligence
  getMemberDetail: async (
    userId: number,
    from?: string,
    to?: string,
    status?: string
  ): Promise<ApiResponse<MemberDetail>> => {
    const res = await apiClient.get<ApiResponse<MemberDetail>>(`/api/v1/librarian/members/${userId}/detail`, {
      params: { from, to, status },
    });
    return res.data;
  },

  // AI Augmentation
  searchAi: async (query: string, limit: number = 10): Promise<ApiResponse<AiSearchResponse>> => {
    const res = await apiClient.post<ApiResponse<AiSearchResponse>>('/api/v1/ai/search', { query, limit });
    return res.data;
  },
  getRecommendations: async (): Promise<ApiResponse<AiRecommendation>> => {
    const res = await apiClient.get<ApiResponse<AiRecommendation>>('/api/v1/ai/recommendations');
    return res.data;
  },
  getCitation: async (bookId: number, format: string = 'APA'): Promise<ApiResponse<Citation>> => {
    const res = await apiClient.get<ApiResponse<Citation>>(`/api/v1/ai/citations/${bookId}`, {
      params: { format },
    });
    return res.data;
  },
  getPatronRisk: async (username: string): Promise<ApiResponse<PatronRisk>> => {
    const res = await apiClient.get<ApiResponse<PatronRisk>>(`/api/v1/ai/patrons/${username}/risk`);
    return res.data;
  },
  chat: async (req: ChatMessageRequest): Promise<ApiResponse<ChatResponse>> => {
    const res = await apiClient.post<ApiResponse<ChatResponse>>('/api/v1/chat', req);
    return res.data;
  },
  chatAi: async (req: AiChatRequest): Promise<ApiResponse<AiChatResponse>> => {
    const res = await apiClient.post<ApiResponse<AiChatResponse>>('/api/v1/chat', req);
    return res.data;
  },

  // Admin APIs
  getAllUsers: async (page = 0, size = 20): Promise<ApiResponse<PageResponse<UserManagement>>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<UserManagement>>>('/api/v1/admin/users', {
      params: { page, size },
    });
    return res.data;
  },
  updateUserRoles: async (userId: number, roles: string[]): Promise<ApiResponse<UserManagement>> => {
    const res = await apiClient.put<ApiResponse<UserManagement>>(`/api/v1/admin/users/${userId}/roles`, {
      roles,
    });
    return res.data;
  },
  updateUserStatus: async (userId: number, status: string): Promise<ApiResponse<UserManagement>> => {
    const res = await apiClient.put<ApiResponse<UserManagement>>(`/api/v1/admin/users/${userId}/status`, {
      status,
    });
    return res.data;
  },
  getSystemConfig: async (): Promise<ApiResponse<SystemConfig>> => {
    const res = await apiClient.get<ApiResponse<SystemConfig>>('/api/v1/admin/config');
    return res.data;
  },
  updateSystemConfig: async (req: UpdateSystemConfigRequest): Promise<ApiResponse<SystemConfig>> => {
    const res = await apiClient.put<ApiResponse<SystemConfig>>('/api/v1/admin/config', req);
    return res.data;
  },
  triggerImportBooks: async (targetPerQuery = 50, resume = true): Promise<ApiResponse<any>> => {
    const res = await apiClient.post<ApiResponse<any>>('/api/v1/admin/import-books', null, {
      params: { targetPerQuery, resume },
    });
    return res.data;
  },
  getImportStatus: async (): Promise<ApiResponse<any>> => {
    const res = await apiClient.get<ApiResponse<any>>('/api/v1/admin/import-status');
    return res.data;
  },
};
