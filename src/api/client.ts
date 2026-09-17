/**
 * TRƯỜNG PHÁT REAL - API Client
 * Chuẩn hóa gọi REST API v1, tự động gán Bearer token và xử lý lỗi thống nhất.
 */

import { ApiResponse } from '../types';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string> | null;
  requestId?: string;

  constructor(message: string, statusCode: number = 400, errors: Record<string, string> | null = null, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.requestId = requestId;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('tp_token');
  const headers = new Headers(options.headers || {});

  headers.set('Accept', 'application/json');
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestId = 'REQ-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
  headers.set('X-Request-ID', requestId);

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Parse JSON
    let resJson: any = null;
    try {
      resJson = await response.json();
    } catch {
      throw new ApiError(
        response.statusText || 'Không thể đọc phản hồi từ máy chủ.',
        response.status,
        null,
        requestId
      );
    }

    if (!response.ok || resJson.success === false) {
      throw new ApiError(
        resJson.message || 'Yêu cầu không thành công.',
        response.status,
        resJson.errors || null,
        resJson.requestId || requestId
      );
    }

    return resJson as ApiResponse<T>;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }

    // Nếu lỗi mạng hoặc server dev chưa có PHP, ném ApiError rõ ràng
    throw new ApiError(
      err.message || 'Mất kết nối với máy chủ API. Vui lòng thử lại.',
      0,
      null,
      requestId
    );
  }
}
