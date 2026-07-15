import { BiService } from '../services/bi.service.js';
import { IntegrationFactory } from '../integrations/clients.js';

const biService = new BiService();

// ─── BI Routes ─────────────────────────────────────────────────────────────────
export const biRoutes = {
  // GET /api/bi/overview
  async getOverview(_req: any, res: any) {
    try {
      const data = await biService.getDashboardOverview();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/bi/departments
  async getDepartmentAnalytics(_req: any, res: any) {
    try {
      const data = await biService.getDepartmentAnalytics();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/bi/enrollments
  async getEnrollmentStats(_req: any, res: any) {
    try {
      const data = await biService.getEnrollmentStats();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/bi/tuition
  async getTuitionAnalytics(_req: any, res: any) {
    try {
      const data = await biService.getTuitionAnalytics();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/bi/demographics
  async getStudentDemographics(_req: any, res: any) {
    try {
      const data = await biService.getStudentDemographics();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/bi/positions
  async getStaffPositions(_req: any, res: any) {
    try {
      const data = await biService.getStaffPositionDistribution();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/bi/courses
  async getCoursePerformance(_req: any, res: any) {
    try {
      const data = await biService.getCoursePerformance();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/bi/audit
  async getAuditSummary(req: any, res: any) {
    try {
      const days = parseInt(req.query.days) || 30;
      const data = await biService.getAuditSummary(days);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/bi/trends
  async getTrends(req: any, res: any) {
    try {
      const months = parseInt(req.query.months) || 6;
      const data = await biService.getMonthlyTrends(months);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/bi/revenue
  async getRevenueReport(_req: any, res: any) {
    try {
      const data = await biService.getRevenueReport();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/bi/executive-report
  async getExecutiveReport(_req: any, res: any) {
    try {
      const data = await biService.generateExecutiveReport();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

// ─── Integration Routes ─────────────────────────────────────────────────────────
const integrationFactory = new IntegrationFactory({
  hemisUrl: process.env.HEMIS_URL,
  hemisApiKey: process.env.HEMIS_API_KEY,
  vneidUrl: process.env.VNEID_URL,
  vneidApiKey: process.env.VNEID_API_KEY,
  vgcaUrl: process.env.VGCA_URL,
  vgcaApiKey: process.env.VGCA_API_KEY,
  csdlUrl: process.env.CSDL_URL,
  csdlApiKey: process.env.CSDL_API_KEY,
  khoBacUrl: process.env.KHOBAC_URL,
  khoBacApiKey: process.env.KHOBAC_API_KEY,
  // Hqnhat integration (Sprint 1)
  hqnhatUrl: process.env.HQNHAT_API_URL,
  hqnhatToken: process.env.HQNHAT_API_TOKEN,
  hqnhatUsername: process.env.HQNHAT_API_USERNAME,
  hqnhatPassword: process.env.HQNHAT_API_PASSWORD,
});

export const integrationRoutes = {
  // GET /api/int/status
  async getStatus(_req: any, res: any) {
    res.json({
      success: true,
      data: {
        configured: integrationFactory.isConfigured(),
        activeIntegrations: integrationFactory.getActiveIntegrations(),
      },
    });
  },

  // POST /api/int/hemis/enrollments
  async syncHEMISEnrollment(req: any, res: any) {
    try {
      const hemis = integrationFactory.getHEMIS();
      if (!hemis) {
        return res.status(400).json({ success: false, message: 'HEMIS integration not configured' });
      }
      const data = await hemis.syncEnrollment(req.body);
      res.json({ success: true, data: data.data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/int/hemis/tuitions
  async syncHEMISTuition(req: any, res: any) {
    try {
      const hemis = integrationFactory.getHEMIS();
      if (!hemis) {
        return res.status(400).json({ success: false, message: 'HEMIS integration not configured' });
      }
      const data = await hemis.syncTuition(req.body);
      res.json({ success: true, data: data.data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/int/vneid/verify
  async verifyVNeID(req: any, res: any) {
    try {
      const vneid = integrationFactory.getVNeID();
      if (!vneid) {
        return res.status(400).json({ success: false, message: 'VNeID integration not configured' });
      }
      const { cccd, fullName, dob } = req.body;
      const data = await vneid.verifyIdentity(cccd, fullName, dob);
      res.json({ success: true, data: data.data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/int/vgca/issue-degree
  async issueVGCADegree(req: any, res: any) {
    try {
      const vgca = integrationFactory.getVGCA();
      if (!vgca) {
        return res.status(400).json({ success: false, message: 'VGCA integration not configured' });
      }
      const data = await vgca.issueDegree(req.body);
      res.json({ success: true, data: data.data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/int/vgca/verify/:serialNumber
  async verifyVGCADegree(req: any, res: any) {
    try {
      const vgca = integrationFactory.getVGCA();
      if (!vgca) {
        return res.status(400).json({ success: false, message: 'VGCA integration not configured' });
      }
      const { serialNumber } = req.params;
      const data = await vgca.verifyDegree(serialNumber);
      res.json({ success: true, data: data.data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/int/csdl/register-degree
  async registerCSDLDegree(req: any, res: any) {
    try {
      const csdl = integrationFactory.getCSDLVanBang();
      if (!csdl) {
        return res.status(400).json({ success: false, message: 'CSDL integration not configured' });
      }
      const data = await csdl.registerDegree(req.body);
      res.json({ success: true, data: data.data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // POST /api/int/khobac/payments
  async createKhoBacPayment(req: any, res: any) {
    try {
      const khoBac = integrationFactory.getKhoBac();
      if (!khoBac) {
        return res.status(400).json({ success: false, message: 'KhoBac integration not configured' });
      }
      const data = await khoBac.createPayment(req.body);
      res.json({ success: true, data: data.data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // GET /api/int/khobac/reconcile
  async reconcileKhoBac(req: any, res: any) {
    try {
      const khoBac = integrationFactory.getKhoBac();
      if (!khoBac) {
        return res.status(400).json({ success: false, message: 'KhoBac integration not configured' });
      }
      const { dateFrom, dateTo } = req.query;
      const data = await khoBac.reconcilePayments(dateFrom, dateTo);
      res.json({ success: true, data: data.data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

// Default export for router compatibility
export default { ...biRoutes, ...integrationRoutes };
