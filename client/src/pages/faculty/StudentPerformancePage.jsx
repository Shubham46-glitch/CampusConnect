import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  RefreshCw,
  Eye,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  GraduationCap,
  Building2,
  Hash,
} from 'lucide-react';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import DashboardCard from '../../components/DashboardCard';
import {
  getFacultyStudentPerformance,
  getStudentPerformanceDetails,
} from '../../services/performanceService';

import { DEPARTMENTS as APP_DEPARTMENTS } from '../../constants/departments';

const DEPARTMENTS = ['All Departments', ...APP_DEPARTMENTS];


const StudentPerformancePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [sortBy, setSortBy] = useState('highest_marks');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState({
    totalStudents: 0,
    totalAssignments: 0,
    students: [],
  });

  // Detailed Modal State
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: searchTerm,
        department: selectedDept === 'All Departments' ? '' : selectedDept,
        sortBy,
      };
      const res = await getFacultyStudentPerformance(params);
      setPerformanceData(res || { totalStudents: 0, totalAssignments: 0, students: [] });
    } catch (err) {
      console.error('Error fetching student performance:', err);
      setError(err.response?.data?.message || 'Failed to load performance metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [selectedDept, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPerformance();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenDetails = async (studentId) => {
    try {
      setSelectedStudentId(studentId);
      setDetailLoading(true);
      const data = await getStudentPerformanceDetails(studentId);
      setDetailData(data);
    } catch (err) {
      console.error('Error fetching student performance details:', err);
      alert(err.response?.data?.message || 'Failed to load student details');
    } finally {
      setDetailLoading(false);
    }
  };

  const getRateBadgeVariant = (rate) => {
    if (rate >= 80) return 'emerald';
    if (rate >= 50) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <TrendingUp className="w-7 h-7 text-brand-600" />
            <span>Student Performance</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track student assignment completions, submission rates, and grade averages from live coursework.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchPerformance} className="self-start sm:self-center">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          title="Students Evaluated"
          value={performanceData.totalStudents || 0}
          icon={GraduationCap}
          color="brand"
          indicator="Authorized roster scope"
        />
        <DashboardCard
          title="Active Coursework"
          value={performanceData.totalAssignments || 0}
          icon={BookOpen}
          color="indigo"
          indicator="Faculty assignments"
        />
        <DashboardCard
          title="Average Roster Grade"
          value={
            performanceData.students.length > 0
              ? `${(
                  performanceData.students.reduce((acc, s) => acc + s.averagePercentage, 0) /
                  performanceData.students.length
                ).toFixed(1)}%`
              : '0%'
          }
          icon={Award}
          color="emerald"
          indicator="Overall performance"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or roll no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 placeholder:text-slate-400 transition-all"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800"
            >
              <option value="highest_marks">Sort by: Highest Grade Avg</option>
              <option value="lowest_marks">Sort by: Lowest Grade Avg</option>
              <option value="highest_submission">Sort by: Highest Submission Rate</option>
              <option value="lowest_submission">Sort by: Lowest Submission Rate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Roster Table */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center bg-white rounded-xl border border-slate-200/80">
          <LoadingSpinner size="md" text="Evaluating student performance metrics..." />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-xs font-semibold text-rose-900">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchPerformance}>
            Retry
          </Button>
        </div>
      ) : (
        <Table
          headers={[
            'Student Name',
            'Department',
            'Roll Number',
            'Completed',
            'Pending',
            'Average Grade',
            'Submission Rate',
            'Actions',
          ]}
        >
          {performanceData.students.length > 0 ? (
            performanceData.students.map((student) => (
              <tr key={student._id} className="hover:bg-slate-50/80 transition-colors text-xs">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{student.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{student.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{student.department}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{student.rollNumber}</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">{student.completedAssignments}</td>
                <td className="px-4 py-3 font-semibold text-amber-600">{student.pendingAssignments}</td>
                <td className="px-4 py-3">
                  <span className="font-bold text-slate-900">{student.averagePercentage}%</span>
                  <span className="text-[11px] text-slate-400 ml-1">({student.averageMarks} pts)</span>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={getRateBadgeVariant(student.submissionRate)}>
                    {student.submissionRate}% Submitted
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDetails(student._id)}
                    className="inline-flex items-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Performance</span>
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-slate-400 italic text-xs">
                No student performance data matches your criteria.
              </td>
            </tr>
          )}
        </Table>
      )}

      {/* Detailed Student Modal */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden select-none animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Detailed Academic Progress Report
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedStudentId(null);
                  setDetailData(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            {detailLoading ? (
              <div className="p-12 flex items-center justify-center">
                <LoadingSpinner size="md" text="Loading student assignment breakdown..." />
              </div>
            ) : detailData ? (
              <div className="p-5 overflow-y-auto space-y-5">
                {/* Student Profile Overview Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{detailData.student.name}</h4>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{detailData.student.department}</span>
                      </span>
                      <span className="flex items-center space-x-1 font-mono text-[11px]">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        <span>Roll: {detailData.student.rollNumber}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={getRateBadgeVariant(detailData.summary.submissionRate)}>
                      {detailData.summary.submissionRate}% Rate
                    </Badge>
                    <Badge variant="emerald" className="font-bold">
                      Avg: {detailData.summary.overallPercentage}%
                    </Badge>
                  </div>
                </div>

                {/* Performance Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Total Coursework</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">{detailData.summary.totalAssignments}</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Submitted</div>
                    <div className="text-lg font-bold text-emerald-600 mt-0.5">{detailData.summary.submittedAssignments}</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Pending</div>
                    <div className="text-lg font-bold text-amber-600 mt-0.5">{detailData.summary.pendingAssignments}</div>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Graded</div>
                    <div className="text-lg font-bold text-brand-600 mt-0.5">{detailData.summary.gradedAssignments}</div>
                  </div>
                </div>

                {/* Assignment Breakdown List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Assignment Breakdown & Marks
                  </h4>

                  {detailData.assignments.length > 0 ? (
                    <Table headers={['Assignment', 'Subject', 'Due Date', 'Status', 'Marks', 'Feedback']}>
                      {detailData.assignments.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50/80 transition-colors text-xs">
                          <td className="px-4 py-3 font-semibold text-slate-900">{item.title}</td>
                          <td className="px-4 py-3 text-slate-600">{item.subject}</td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                            {new Date(item.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                item.status === 'graded'
                                  ? 'emerald'
                                  : item.status === 'submitted' || item.status === 'late'
                                  ? 'primary'
                                  : 'warning'
                              }
                              className="capitalize"
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {item.marksObtained !== null ? (
                              <span>
                                {item.marksObtained} / {item.totalMarks}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Unsubmitted</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                            {item.feedback || <span className="text-slate-400 italic">No feedback given</span>}
                          </td>
                        </tr>
                      ))}
                    </Table>
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs italic border border-dashed border-slate-200 rounded-lg">
                      No assignments posted yet for this student.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">Failed to load details.</div>
            )}

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedStudentId(null);
                  setDetailData(null);
                }}
              >
                Close Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPerformancePage;
