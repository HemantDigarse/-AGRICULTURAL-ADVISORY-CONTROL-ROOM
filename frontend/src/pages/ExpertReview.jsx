import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Filter,
  Search,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getDashboardStats } from '../services/api';

const REVIEW_STATUSES = {
  PENDING: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700', icon: Clock },
  IN_REVIEW: { label: 'In Review', color: 'bg-blue-100 text-blue-700', icon: Eye },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  NEEDS_REVISION: { label: 'Needs Revision', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

// Demo expert review cases — clearly labeled demo data
const DEMO_REVIEWS = [
  {
    id: 'ADV-20241115-001',
    crop: 'Wheat',
    location: 'Ludhiana, Punjab',
    farmer: 'Rajinder Singh',
    submitted: '2024-11-15T10:30:00',
    status: 'PENDING',
    riskLevel: 'HIGH',
    summary: 'High frost risk advisory for wheat crop in vegetative stage. Recommended protective irrigation and mulching. Requires expert validation of frost timing predictions.',
    agentConfidence: 78,
    flagReason: 'High risk level + below 80% confidence threshold',
  },
  {
    id: 'ADV-20241114-003',
    crop: 'Cotton',
    location: 'Nagpur, Maharashtra',
    submitted: '2024-11-14T14:15:00',
    farmer: 'Suresh Patil',
    status: 'IN_REVIEW',
    riskLevel: 'CRITICAL',
    summary: 'Pink bollworm infestation detected. Advisory recommends pheromone traps and systemic insecticide application. Expert reviewing pesticide dosage recommendations.',
    agentConfidence: 65,
    flagReason: 'Critical risk + pest advisory requires expert verification',
    reviewer: 'Dr. Meena Sharma',
  },
  {
    id: 'ADV-20241113-002',
    crop: 'Rice',
    location: 'Thanjavur, Tamil Nadu',
    submitted: '2024-11-13T09:45:00',
    farmer: 'K. Murugan',
    status: 'APPROVED',
    riskLevel: 'MEDIUM',
    summary: 'Moderate water stress advisory for rice in flowering stage. Recommended supplemental irrigation schedule approved by agronomist.',
    agentConfidence: 88,
    flagReason: 'Automatic review — flowering stage advisory',
    reviewer: 'Dr. Anand Kumar',
    reviewNote: 'Irrigation schedule is appropriate for the soil type. Approved with minor timeline adjustment.',
  },
  {
    id: 'ADV-20241112-005',
    crop: 'Tomato',
    location: 'Kolar, Karnataka',
    submitted: '2024-11-12T16:20:00',
    farmer: 'Lakshmi Devi',
    status: 'NEEDS_REVISION',
    riskLevel: 'HIGH',
    summary: 'Late blight management advisory. Initial recommendation for copper-based fungicide needs revision — organic alternatives requested by farmer.',
    agentConfidence: 72,
    flagReason: 'Farmer preference conflict with AI recommendation',
    reviewer: 'Dr. Priya Reddy',
    reviewNote: 'Revise to include neem-based alternatives. Farmer operates certified organic farm.',
  },
  {
    id: 'ADV-20241111-001',
    crop: 'Sugarcane',
    location: 'Kolhapur, Maharashtra',
    submitted: '2024-11-11T11:00:00',
    farmer: 'Anil Jadhav',
    status: 'APPROVED',
    riskLevel: 'LOW',
    summary: 'Routine growth stage advisory for sugarcane in vegetative phase. Standard fertilization and irrigation schedule.',
    agentConfidence: 94,
    flagReason: 'Routine review — auto-flagged for quality check',
    reviewer: 'Dr. Meena Sharma',
    reviewNote: 'Looks good. Standard advisory.',
  },
];

function StatusBadge({ status }) {
  const cfg = REVIEW_STATUSES[status] || REVIEW_STATUSES.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function RiskIndicator({ level }) {
  const colors = {
    LOW: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-orange-500',
    CRITICAL: 'bg-red-500 animate-pulse',
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
      <span className={`w-2 h-2 rounded-full ${colors[level] || 'bg-gray-400'}`} />
      {level}
    </span>
  );
}

function ConfidenceMeter({ value }) {
  const color = value >= 85 ? 'bg-green-500' : value >= 70 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600">{value}%</span>
    </div>
  );
}

export default function ExpertReview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading expert review dashboard..." />;

  const overview = stats?.overview || {};

  const filtered = DEMO_REVIEWS.filter((r) => {
    if (filterStatus !== 'ALL' && r.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.crop.toLowerCase().includes(q) ||
        r.farmer.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    pending: DEMO_REVIEWS.filter((r) => r.status === 'PENDING').length,
    inReview: DEMO_REVIEWS.filter((r) => r.status === 'IN_REVIEW').length,
    approved: DEMO_REVIEWS.filter((r) => r.status === 'APPROVED').length,
    revision: DEMO_REVIEWS.filter((r) => r.status === 'NEEDS_REVISION').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-green-700 to-emerald-600 rounded-xl shadow-sm">
          <UserCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expert Review Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Review and validate AI-generated agricultural advisories before delivery
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{counts.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Eye className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">In Review</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{counts.inReview}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Approved</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{counts.approved}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <RefreshCw className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Needs Revision</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{counts.revision}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, crop, farmer, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending Review</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="APPROVED">Approved</option>
            <option value="NEEDS_REVISION">Needs Revision</option>
          </select>
        </div>
      </div>

      {/* Review Cases */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No review cases found"
          message="No advisory cases match your current filters."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => {
            const isExpanded = expandedId === review.id;
            return (
              <div
                key={review.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Main row */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : review.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm font-semibold text-green-700">{review.id}</span>
                        <StatusBadge status={review.status} />
                        <RiskIndicator level={review.riskLevel} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span className="font-medium text-gray-800">{review.crop}</span>
                        <span>•</span>
                        <span>{review.location}</span>
                        <span>•</span>
                        <span>{review.farmer}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32">
                        <p className="text-xs text-gray-400 mb-1">AI Confidence</p>
                        <ConfidenceMeter value={review.agentConfidence} />
                      </div>
                      <Link
                        to={`/report/${review.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Full Advisory"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Advisory Summary</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{review.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Flag Reason</h4>
                        <p className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">{review.flagReason}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Submitted</h4>
                        <p className="text-sm text-gray-600">{new Date(review.submitted).toLocaleString()}</p>
                      </div>
                    </div>

                    {review.reviewer && (
                      <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Reviewed by {review.reviewer}</p>
                          {review.reviewNote && (
                            <p className="text-sm text-gray-600 mt-1 flex items-start gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
                              {review.reviewNote}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {review.status === 'PENDING' && (
                      <div className="flex gap-3 pt-2">
                        <button className="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors">
                          Approve Advisory
                        </button>
                        <button className="px-4 py-2 bg-white text-amber-700 text-sm font-medium rounded-lg border border-amber-300 hover:bg-amber-50 transition-colors">
                          Request Revision
                        </button>
                        <button className="px-4 py-2 bg-white text-red-700 text-sm font-medium rounded-lg border border-red-300 hover:bg-red-50 transition-colors">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Demo notice */}
      <p className="text-xs text-gray-400 italic text-center pt-2">
        * Expert review data shown above is demo data for demonstration purposes.
        Backend expert-review endpoints are not yet implemented.
      </p>
    </div>
  );
}
