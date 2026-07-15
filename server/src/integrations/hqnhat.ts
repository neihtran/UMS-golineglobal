import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env.js';
import { IntegrationLog } from '../models/index.js';
import type {
  HqnhatListParams,
  HqnhatPaginatedResponse,
  FacultyOptionDto,
  MajorDto,
  CourseGroupDto,
  CourseDto,
  CurriculumDto,
  StudentClassDto,
  StudentProfileDto,
  SyncCurriculumCoursesDto,
} from './hqnhat.types.js';

// ─── HqnhatApiClient ─────────────────────────────────────────────────────────
// Client axios cho api.hqnhat.id.vn (Laravel-style OpenAPI 3.0)
// Features:
//   - Bearer token tự động (ưu tiên static token, fallback login flow)
//   - Retry với exponential backoff cho 429 / 5xx
//   - Auto-log error vào IntegrationLog (fire-and-forget)
//   - Pagination helper
//   - Timeout configurable

export interface HqnhatClientConfig {
  baseUrl?: string;
  token?: string;
  username?: string;
  password?: string;
  timeoutMs?: number;
  retryMax?: number;
}

export interface HqnhatRequestOptions {
  logToIntegration?: boolean;   // Ghi log IntegrationLog khi fail
  source?: string;              // Tên source cho log (default: 'hqnhat')
}

export class HqnhatApiClient {
  private client: AxiosInstance;
  private tokenCache: { token: string; expiresAt: number } | null = null;
  private readonly retryMax: number;

  constructor(config: HqnhatClientConfig = {}) {
    const baseUrl = config.baseUrl ?? env.HQNHAT_API_URL;
    const timeoutMs = config.timeoutMs ?? parseInt(env.HQNHAT_API_TIMEOUT_MS, 10);
    this.retryMax = config.retryMax ?? parseInt(env.HQNHAT_API_RETRY_MAX, 10);

    // Cache static token nếu có
    if (config.token) {
      this.tokenCache = { token: config.token, expiresAt: Number.MAX_SAFE_INTEGER };
    }

    this.client = axios.create({
      baseURL: baseUrl,
      timeout: timeoutMs,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: auto-attach Bearer token
    this.client.interceptors.request.use(async (cfg) => {
      const token = await this.resolveToken(config);
      if (token) {
        cfg.headers.Authorization = `Bearer ${token}`;
      }
      return cfg;
    });

    // Response interceptor: retry + log
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig & {
          __retryCount?: number;
          __hqnhatLog?: HqnhatRequestOptions;
        };

        const shouldRetry =
          config &&
          (config.__retryCount ?? 0) < this.retryMax &&
          (error.response?.status === 429 ||
            (error.response?.status && error.response.status >= 500) ||
            error.code === 'ECONNABORTED' ||
            error.code === 'ETIMEDOUT');

        if (shouldRetry) {
          config.__retryCount = (config.__retryCount ?? 0) + 1;
          const backoffMs = Math.min(1000 * 2 ** config.__retryCount, 8000);
          await this.sleep(backoffMs);
          return this.client.request(config);
        }

        // Log error vào IntegrationLog (fire-and-forget)
        if (config?.__hqnhatLog?.logToIntegration !== false) {
          this.logError(error, config?.__hqnhatLog?.source ?? 'hqnhat').catch(() => {});
        }

        return Promise.reject(error);
      }
    );
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async resolveToken(config: HqnhatClientConfig): Promise<string | null> {
    // Ưu tiên 1: dùng token đã cache
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    // Ưu tiên 2: dùng static token từ config
    if (config.token) {
      this.tokenCache = { token: config.token, expiresAt: Number.MAX_SAFE_INTEGER };
      return config.token;
    }

    // Ưu tiên 3: login flow nếu có username/password
    if (config.username && config.password) {
      try {
        const res = await this.client.post('/api/auth/login', {
          email: config.username,
          password: config.password,
        });
        const token = res.data?.access_token;
        const expiresIn = (res.data?.expires_in ?? 3600) * 1000;
        if (token) {
          this.tokenCache = {
            token,
            expiresAt: Date.now() + expiresIn - 60_000, // refresh trước 60s
          };
          return token;
        }
      } catch (err) {
        console.error('[HqnhatApiClient] Login failed:', err);
      }
    }

    return null;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  private async logError(error: AxiosError, source: string): Promise<void> {
    try {
      const cfg = error.config as InternalAxiosRequestConfig | undefined;
      await IntegrationLog.create({
        source,
        event: `${cfg?.method?.toUpperCase() ?? 'UNKNOWN'} ${cfg?.url ?? 'unknown'}`,
        payload: {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        },
        status: 'failed',
        error: error.message,
        timestamp: new Date(),
      });
    } catch {
      // Silent fail — không ảnh hưởng request chính
    }
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options: HqnhatRequestOptions & { params?: HqnhatListParams; data?: unknown } = {}
  ): Promise<T> {
    const cfg: InternalAxiosRequestConfig & {
      __hqnhatLog?: HqnhatRequestOptions;
    } = {
      method: method as any,
      url: path,
      params: options.params,
      data: options.data,
    } as any;
    cfg.__hqnhatLog = options;

    const res = await this.client.request<T>(cfg);
    return res.data;
  }

  // ─── Faculties ─────────────────────────────────────────────────────────────
  async listFaculties(
    params?: HqnhatListParams,
    options?: HqnhatRequestOptions
  ): Promise<HqnhatPaginatedResponse<FacultyOptionDto>> {
    return this.request('GET', '/api/academic/faculties', { params, ...options });
  }

  // ─── Majors ────────────────────────────────────────────────────────────────
  async listMajors(
    params?: HqnhatListParams,
    options?: HqnhatRequestOptions
  ): Promise<HqnhatPaginatedResponse<MajorDto>> {
    return this.request('GET', '/api/academic/majors', { params, ...options });
  }

  async createMajor(
    data: Partial<MajorDto>,
    options?: HqnhatRequestOptions
  ): Promise<MajorDto> {
    return this.request('POST', '/api/academic/majors', { data, ...options });
  }

  async getMajor(id: number, options?: HqnhatRequestOptions): Promise<MajorDto> {
    return this.request('GET', `/api/academic/majors/${id}`, options);
  }

  async updateMajor(
    id: number,
    data: Partial<MajorDto>,
    options?: HqnhatRequestOptions
  ): Promise<MajorDto> {
    return this.request('PUT', `/api/academic/majors/${id}`, { data, ...options });
  }

  async deleteMajor(id: number, options?: HqnhatRequestOptions): Promise<void> {
    return this.request('DELETE', `/api/academic/majors/${id}`, options);
  }

  // ─── CourseGroups ──────────────────────────────────────────────────────────
  async listCourseGroups(
    params?: HqnhatListParams,
    options?: HqnhatRequestOptions
  ): Promise<HqnhatPaginatedResponse<CourseGroupDto>> {
    return this.request('GET', '/api/academic/course-groups', { params, ...options });
  }

  // ─── Courses ───────────────────────────────────────────────────────────────
  async listCourses(
    params?: HqnhatListParams,
    options?: HqnhatRequestOptions
  ): Promise<HqnhatPaginatedResponse<CourseDto>> {
    return this.request('GET', '/api/academic/courses', { params, ...options });
  }

  async createCourse(
    data: Partial<CourseDto>,
    options?: HqnhatRequestOptions
  ): Promise<CourseDto> {
    return this.request('POST', '/api/academic/courses', { data, ...options });
  }

  async getCourse(id: number, options?: HqnhatRequestOptions): Promise<CourseDto> {
    return this.request('GET', `/api/academic/courses/${id}`, options);
  }

  async updateCourse(
    id: number,
    data: Partial<CourseDto>,
    options?: HqnhatRequestOptions
  ): Promise<CourseDto> {
    return this.request('PUT', `/api/academic/courses/${id}`, { data, ...options });
  }

  async deleteCourse(id: number, options?: HqnhatRequestOptions): Promise<void> {
    return this.request('DELETE', `/api/academic/courses/${id}`, options);
  }

  // ─── Curriculums ───────────────────────────────────────────────────────────
  async listCurriculums(
    params?: HqnhatListParams,
    options?: HqnhatRequestOptions
  ): Promise<HqnhatPaginatedResponse<CurriculumDto>> {
    return this.request('GET', '/api/academic/curriculums', { params, ...options });
  }

  async createCurriculum(
    data: Partial<CurriculumDto>,
    options?: HqnhatRequestOptions
  ): Promise<CurriculumDto> {
    return this.request('POST', '/api/academic/curriculums', { data, ...options });
  }

  async getCurriculum(id: number, options?: HqnhatRequestOptions): Promise<CurriculumDto> {
    return this.request('GET', `/api/academic/curriculums/${id}`, options);
  }

  async updateCurriculum(
    id: number,
    data: Partial<CurriculumDto>,
    options?: HqnhatRequestOptions
  ): Promise<CurriculumDto> {
    return this.request('PUT', `/api/academic/curriculums/${id}`, { data, ...options });
  }

  async deleteCurriculum(id: number, options?: HqnhatRequestOptions): Promise<void> {
    return this.request('DELETE', `/api/academic/curriculums/${id}`, options);
  }

  async syncCurriculumCourses(
    id: number,
    data: SyncCurriculumCoursesDto,
    options?: HqnhatRequestOptions
  ): Promise<void> {
    return this.request('PUT', `/api/academic/curriculums/${id}/courses/sync`, {
      data,
      ...options,
    });
  }

  // ─── Students ──────────────────────────────────────────────────────────────
  async listStudents(
    params?: HqnhatListParams,
    options?: HqnhatRequestOptions
  ): Promise<HqnhatPaginatedResponse<StudentProfileDto>> {
    return this.request('GET', '/api/academic/students', { params, ...options });
  }

  async createStudent(
    data: Partial<StudentProfileDto>,
    options?: HqnhatRequestOptions
  ): Promise<StudentProfileDto> {
    return this.request('POST', '/api/academic/students', { data, ...options });
  }

  // ─── StudentClasses ────────────────────────────────────────────────────────
  async listStudentClasses(
    params?: HqnhatListParams,
    options?: HqnhatRequestOptions
  ): Promise<HqnhatPaginatedResponse<StudentClassDto>> {
    return this.request('GET', '/api/academic/classes', { params, ...options });
  }

  // ─── Pagination helper ─────────────────────────────────────────────────────
  /**
   * Tự động fetch all pages, trả về flat array.
   * Cẩn thận với data lớn — nên dùng với filter hoặc giới hạn page.
   */
  async fetchAllPages<T>(
    fetchFn: (page: number, perPage: number) => Promise<HqnhatPaginatedResponse<T>>,
    options: { perPage?: number; maxPages?: number } = {}
  ): Promise<T[]> {
    const perPage = options.perPage ?? 100;
    const maxPages = options.maxPages ?? 100;
    const all: T[] = [];
    let page = 1;
    while (page <= maxPages) {
      const res = await fetchFn(page, perPage);
      all.push(...res.data);
      const lastPage = res.meta?.last_page ?? 1;
      if (page >= lastPage || res.data.length === 0) break;
      page++;
    }
    return all;
  }

  // ─── Health check ──────────────────────────────────────────────────────────
  /**
   * Ping API bằng cách gọi 1 endpoint thật (list faculties với per_page=1).
   * Trả về true nếu response có success=true.
   * Endpoint /api/health không tồn tại trên api.hqnhat.id.vn (404).
   */
  async ping(options?: HqnhatRequestOptions): Promise<boolean> {
    try {
      const res = await this.request<{ success: boolean }>(
        'GET',
        '/api/academic/faculties',
        { params: { page: 1, per_page: 1 }, logToIntegration: false, ...options }
      );
      return res?.success === true;
    } catch {
      return false;
    }
  }

  // ─── Token management ──────────────────────────────────────────────────────
  clearToken(): void {
    this.tokenCache = null;
  }

  getCachedToken(): string | null {
    return this.tokenCache?.token ?? null;
  }
}