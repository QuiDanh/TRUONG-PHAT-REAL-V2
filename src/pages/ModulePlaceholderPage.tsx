import React from 'react';
import {
  Building2,
  Users,
  GitCompare,
  Calendar,
  BadgePercent,
  KeyRound,
  FileText,
  CreditCard,
  Coins,
  Shield,
  BarChart,
  Trash2,
  Settings,
  Sparkles,
  Database,
  ArrowRight
} from 'lucide-react';

interface ModuleProps {
  moduleName: string;
  phase: number;
  phaseTitle: string;
  description: string;
  features: string[];
  tables: string[];
  iconType?: string;
}

export const ModulePlaceholderPage: React.FC<ModuleProps> = ({
  moduleName,
  phase,
  phaseTitle,
  description,
  features,
  tables,
  iconType = 'building'
}) => {
  const getIcon = () => {
    switch (iconType) {
      case 'properties':
        return <Building2 className="w-8 h-8 text-blue-600" />;
      case 'customers':
        return <Users className="w-8 h-8 text-emerald-600" />;
      case 'matches':
        return <GitCompare className="w-8 h-8 text-indigo-600" />;
      case 'appointments':
        return <Calendar className="w-8 h-8 text-amber-600" />;
      case 'sales':
        return <BadgePercent className="w-8 h-8 text-rose-600" />;
      case 'rentals':
        return <KeyRound className="w-8 h-8 text-cyan-600" />;
      case 'contracts':
        return <FileText className="w-8 h-8 text-orange-600" />;
      case 'payments':
        return <CreditCard className="w-8 h-8 text-green-600" />;
      case 'commissions':
        return <Coins className="w-8 h-8 text-yellow-600" />;
      case 'teams':
        return <Shield className="w-8 h-8 text-purple-600" />;
      case 'reports':
        return <BarChart className="w-8 h-8 text-teal-600" />;
      case 'trash':
        return <Trash2 className="w-8 h-8 text-slate-600" />;
      case 'settings':
        return <Settings className="w-8 h-8 text-slate-700" />;
      default:
        return <Building2 className="w-8 h-8 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{moduleName}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                Giai Đoạn {phase}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{phaseTitle}</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          CSDL MariaDB Đã Sẵn Sàng
        </div>
      </div>

      {/* Description & Specs Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-2">Mô Tả Chức Năng</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-100">
          {/* Planned Features */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Các Tính Năng Đang Phát Triển
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Database Schema Linkage */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-500" /> Bảng Dữ Liệu MariaDB Tương Ứng
            </h4>
            <div className="flex flex-wrap gap-2">
              {tables.map((tbl, idx) => (
                <span
                  key={idx}
                  className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                >
                  `{tbl}`
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
              Cơ sở dữ liệu của phân hệ này đã được khởi tạo chuẩn hóa trong <strong className="text-slate-600">database.sql</strong> (khóa ngoại, chỉ mục, utf8mb4_unicode_ci, InnoDB) và sẵn sàng kích hoạt trong giai đoạn tiếp theo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
