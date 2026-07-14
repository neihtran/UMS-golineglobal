import axios, { AxiosInstance } from 'axios';

// ─── HEMIS API Client ─────────────────────────────────────────────────────────
// Hệ thống thông tin sinh viên của Bộ GD&ĐT
export class HEMISClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, apiKey: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-API-Version': 'v1',
      },
      timeout: 30000,
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('[HEMIS] API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async getStudentStatus(msv: string) {
    return this.client.get(`/students/${msv}`);
  }

  async syncEnrollment(data: {
    msv: string;
    courseCode: string;
    semester: string;
    status: 'enrolled' | 'withdrawn';
  }) {
    return this.client.post('/enrollments', data);
  }

  async syncTuition(data: {
    msv: string;
    semester: string;
    amount: number;
    paid: boolean;
    paidDate?: string;
  }) {
    return this.client.post('/tuitions', data);
  }

  async getCourseCatalog() {
    return this.client.get('/courses');
  }

  async getStudentList(params?: { page?: number; limit?: number; facultyCode?: string }) {
    return this.client.get('/students', { params });
  }

  async syncGraduation(data: { msv: string; graduationDate: string; degree: string; GPA: number }) {
    return this.client.post('/graduations', data);
  }
}

// ─── VNeID Client ─────────────────────────────────────────────────────────────
// Cổng dịch vụ công quốc gia - Xác thực công dân điện tử
export class VNeIDClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, apiKey: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Client-ID': 'UMS_UNIVERSITY',
      },
      timeout: 30000,
    });
  }

  async verifyIdentity(cccd: string, fullName: string, dob: string) {
    return this.client.post('/v1/identity/verify', { cccd, fullName, dob });
  }

  async getCitizenInfo(cccd: string) {
    return this.client.get(`/v1/citizens/${cccd}`);
  }
}

// ─── VGCA Client ──────────────────────────────────────────────────────────────
// Hệ thống quản lý văn bằng, chứng chỉ - Bộ GD&ĐT
export class VGCAClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, apiKey: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async issueDegree(data: {
    studentId: string;
    degreeType: 'Cử nhân' | 'Thạc sĩ' | 'Tiến sĩ';
    major: string;
    graduationDate: string;
    GPA: number;
    serialNumber?: string;
  }) {
    return this.client.post('/v1/degrees/issue', data);
  }

  async verifyDegree(serialNumber: string) {
    return this.client.get(`/v1/degrees/${serialNumber}/verify`);
  }

  async getDegreeStatus(serialNumber: string) {
    return this.client.get(`/v1/degrees/${serialNumber}`);
  }

  async revokeDegree(serialNumber: string, reason: string) {
    return this.client.post(`/v1/degrees/${serialNumber}/revoke`, { reason });
  }
}

// ─── CSDL Văn Bằng Client ─────────────────────────────────────────────────────
// Cơ sở dữ liệu quốc gia về văn bằng, chứng chỉ
export class CSDLVanBangClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, apiKey: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async registerDegree(data: {
    serialNumber: string;
    holderName: string;
    holderDOB: string;
    degreeType: string;
    major: string;
    institution: string;
    graduationDate: string;
  }) {
    return this.client.post('/v1/degrees/register', data);
  }

  async searchDegree(params: { keyword?: string; fromDate?: string; toDate?: string }) {
    return this.client.get('/v1/degrees/search', { params });
  }
}

// ─── Kho Bạc Nhà Nước Client ──────────────────────────────────────────────────
// Kết nối với hệ thống tabmis của Kho bạc
export class KhoBacClient {
  private client: AxiosInstance;

  constructor(baseUrl: string, apiKey: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async createPayment(data: {
    amount: number;
    description: string;
    beneficiaryAccount: string;
    beneficiaryName: string;
    taxCode?: string;
  }) {
    return this.client.post('/v1/payments/create', data);
  }

  async getPaymentStatus(paymentId: string) {
    return this.client.get(`/v1/payments/${paymentId}`);
  }

  async reconcilePayments(dateFrom: string, dateTo: string) {
    return this.client.get('/v1/payments/reconcile', {
      params: { dateFrom, dateTo },
    });
  }
}

// ─── Integration Factory ──────────────────────────────────────────────────────
export interface IntegrationConfig {
  hemisUrl?: string;
  hemisApiKey?: string;
  vneidUrl?: string;
  vneidApiKey?: string;
  vgcaUrl?: string;
  vgcaApiKey?: string;
  csdlUrl?: string;
  csdlApiKey?: string;
  khoBacUrl?: string;
  khoBacApiKey?: string;
}

export class IntegrationFactory {
  private hemis?: HEMISClient;
  private vneid?: VNeIDClient;
  private vgca?: VGCAClient;
  private csdl?: CSDLVanBangClient;
  private khoBac?: KhoBacClient;

  constructor(config: IntegrationConfig) {
    if (config.hemisUrl && config.hemisApiKey) {
      this.hemis = new HEMISClient(config.hemisUrl, config.hemisApiKey);
    }
    if (config.vneidUrl && config.vneidApiKey) {
      this.vneid = new VNeIDClient(config.vneidUrl, config.vneidApiKey);
    }
    if (config.vgcaUrl && config.vgcaApiKey) {
      this.vgca = new VGCAClient(config.vgcaUrl, config.vgcaApiKey);
    }
    if (config.csdlUrl && config.csdlApiKey) {
      this.csdl = new CSDLVanBangClient(config.csdlUrl, config.csdlApiKey);
    }
    if (config.khoBacUrl && config.khoBacApiKey) {
      this.khoBac = new KhoBacClient(config.khoBacUrl, config.khoBacApiKey);
    }
  }

  getHEMIS() { return this.hemis; }
  getVNeID() { return this.vneid; }
  getVGCA() { return this.vgca; }
  getCSDLVanBang() { return this.csdl; }
  getKhoBac() { return this.khoBac; }

  isConfigured() {
    return !!(this.hemis || this.vneid || this.vgca || this.csdl || this.khoBac);
  }

  getActiveIntegrations() {
    const active = [];
    if (this.hemis) active.push('HEMIS');
    if (this.vneid) active.push('VNeID');
    if (this.vgca) active.push('VGCA');
    if (this.csdl) active.push('CSDL_VanBang');
    if (this.khoBac) active.push('KhoBac');
    return active;
  }
}
