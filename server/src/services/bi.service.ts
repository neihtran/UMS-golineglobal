import { VienChuc } from '../models/VienChuc.js';
import { Student } from '../models/Student.js';
import { Course } from '../models/Course.js';
import { Enrollment } from '../models/Enrollment.js';
import { Department } from '../models/Department.js';
import { Tuition } from '../models/Finance.js';
import { AuditLog } from '../models/AuditLog.js';

// ─── BI Service ────────────────────────────────────────────────────────────────
export class BiService {
  async getDashboardOverview() {
    const [totalStaff, totalStudents, totalCourses, totalDepartments] = await Promise.all([
      VienChuc.countDocuments({ status: 'active' }),
      Student.countDocuments({ status: 'studying' }),
      Course.countDocuments(),
      Department.countDocuments({ type: 'department' }),
    ]);
    return { totalStaff, totalStudents, totalCourses, totalDepartments };
  }

  async getDepartmentAnalytics() {
    return VienChuc.aggregate([
      { $match: { status: 'active' } },
      { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$dept._id',
          departmentName: { $first: '$dept.name' },
          departmentCode: { $first: '$dept.code' },
          total: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
          minSalary: { $min: '$salary' },
          maxSalary: { $max: '$salary' },
          totalSalary: { $sum: '$salary' },
        },
      },
      { $sort: { total: -1 } },
    ]);
  }

  async getEnrollmentStats() {
    return Enrollment.aggregate([
      {
        $lookup: {
          from: 'students',
          localField: 'student',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$semester',
          totalEnrollments: { $sum: 1 },
          passed: {
            $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'enrolled'] }, 1, 0] },
          },
          avgScore: { $avg: '$grade' },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 10 },
    ]);
  }

  async getTuitionAnalytics() {
    const [total, paid, unpaid, overdue] = await Promise.all([
      Tuition.countDocuments(),
      Tuition.countDocuments({ status: 'paid' }),
      Tuition.countDocuments({ status: 'unpaid' }),
      Tuition.countDocuments({
        status: 'unpaid',
        dueDate: { $lt: new Date() },
      }),
    ]);

    const totalAmount = await Tuition.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const paidAmount = await Tuition.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return {
      summary: { total, paid, unpaid, overdue, paidRate: total > 0 ? (paid / total) * 100 : 0 },
      totalAmount: totalAmount[0]?.total || 0,
      paidAmount: paidAmount[0]?.total || 0,
      unpaidAmount: (totalAmount[0]?.total || 0) - (paidAmount[0]?.total || 0),
    };
  }

  async getStudentDemographics() {
    return Student.aggregate([
      {
        $group: {
          _id: '$gender',
          total: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'dept',
        },
      },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { gender: '$_id', department: '$dept.name' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.gender',
          total: { $sum: '$count' },
          byDepartment: {
            $push: { department: '$_id.department', count: '$count' },
          },
        },
      },
    ]);
  }

  async getStaffPositionDistribution() {
    return VienChuc.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async getCoursePerformance() {
    return Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$course._id',
          courseName: { $first: '$course.name' },
          courseCode: { $first: '$course.code' },
          totalEnrollments: { $sum: 1 },
          passed: { $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          avgGrade: { $avg: '$grade' },
          maxGrade: { $max: '$grade' },
          minGrade: { $min: '$grade' },
          passRate: {
            $avg: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] },
          },
        },
      },
      { $sort: { totalEnrollments: -1 } },
      { $limit: 20 },
    ]);
  }

  async getAuditSummary(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return AuditLog.aggregate([
      { $match: { timestamp: { $gte: since } } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
          },
          failureCount: {
            $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  async getMonthlyTrends(months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const [staffHires, studentEnrollments, tuitionPayments] = await Promise.all([
      // Staff hired per month
      VienChuc.aggregate([
        { $match: { joinDate: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$joinDate' },
              month: { $month: '$joinDate' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
      ]),

      // Student enrollments per month
      Enrollment.aggregate([
        { $match: { enrolledAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: '$enrolledAt' },
              month: { $month: '$enrolledAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
      ]),

      // Tuition payments per month
      Tuition.aggregate([
        { $match: { paidDate: { $gte: startDate }, status: 'paid' } },
        {
          $group: {
            _id: {
              year: { $year: '$paidDate' },
              month: { $month: '$paidDate' },
            },
            amount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
      ]),
    ]);

    return { staffHires, studentEnrollments, tuitionPayments };
  }

  async getRevenueReport() {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);

    return Tuition.aggregate([
      { $match: { paidDate: { $gte: yearStart }, status: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$paidDate' },
            month: { $month: '$paidDate' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
  }

  async getAttendanceReport() {
    // Placeholder for attendance tracking
    return {
      message: 'Attendance module not yet integrated',
    };
  }

  async getKPIReport() {
    // KPIs from Research module
    return {
      message: 'Research KPIs integration pending',
    };
  }

  async generateExecutiveReport() {
    const [overview, deptAnalytics, tuition, courses, trends] = await Promise.all([
      this.getDashboardOverview(),
      this.getDepartmentAnalytics(),
      this.getTuitionAnalytics(),
      this.getCoursePerformance(),
      this.getMonthlyTrends(12),
    ]);

    return {
      generatedAt: new Date(),
      overview,
      departmentBreakdown: deptAnalytics,
      financialSummary: tuition,
      topCourses: courses.slice(0, 10),
      trends,
    };
  }
}
