import { useEffect, useState } from "react";
import { Users, UserCheck, UserMinus, ShieldAlert, ShoppingCart, DollarSign, Package, RotateCcw, AlertTriangle, UserPlus, CreditCard } from "lucide-react";
import { adminApi } from "../../api/adminClient";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getOverview()
      .then(res => {
        setData(res);
      })
      .catch(err => {
        toast.error("Failed to load dashboard KPIs.");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-surface rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
             <div key={i} className="h-28 bg-white/50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback map safely incase endpoints are mocking different objects
  const d = data || {};

  const MetricCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className="bg-white rounded-xl shadow-card p-5 flex items-center gap-4 border border-surface/50">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center \${bg} \${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-ink/70">{label}</p>
        <p className="text-2xl font-bold text-ink">{value || 0}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Platform Overview</h1>
        <p className="text-sm text-ink/70">A high-level look at current ERP operations.</p>
      </div>

      <div className="space-y-6">
        {/* User Statistics Row */}
        <div>
          <h2 className="text-lg font-semibold mb-4 border-b border-surface pb-2">Users & Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Users" value={d.totalUsers} icon={Users} color="text-info-text" bg="bg-info-light" />
            <MetricCard label="Active Users" value={d.activeUsers} icon={UserCheck} color="text-success-text" bg="bg-success-light" />
            <MetricCard label="Inactive Users" value={d.inactiveUsers} icon={UserMinus} color="text-warning-text" bg="bg-warning-light" />
            <MetricCard label="Admins" value={d.admins} icon={ShieldAlert} color="text-warning-text" bg="bg-warning-light" />
            <MetricCard label="Managers" value={d.managers} icon={UserPLUSIcon} color="text-info-text" bg="bg-info-light" />
            <MetricCard label="Employees" value={d.employees} icon={Users} color="text-info-text" bg="bg-info-light" />
            <MetricCard label="Customers" value={d.customers} icon={Users} color="text-info-text" bg="bg-info-light" />
          </div>
        </div>

        {/* Business Metrics Row */}
        <div>
          <h2 className="text-lg font-semibold mb-4 border-b border-surface pb-2">Business Data</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Gross Revenue" value={`$${d.grossRevenue || '0.00'}`} icon={DollarSign} color="text-success-text" bg="bg-success-light" />
            <MetricCard label="Refunded Total" value={`$${d.refundedTotal || '0.00'}`} icon={CreditCard} color="text-danger-text" bg="bg-danger-light" />
            <MetricCard label="Total Orders" value={d.totalOrders} icon={ShoppingCart} color="text-info-text" bg="bg-info-light" />
            <MetricCard label="Delivered Orders" value={d.deliveredOrders} icon={Package} color="text-success-text" bg="bg-success-light" />
            <MetricCard label="Cancelled Orders" value={d.cancelledOrders} icon={AlertTriangle} color="text-warning-text" bg="bg-warning-light" />
            <MetricCard label="Returns" value={d.returns} icon={RotateCcw} color="text-danger-text" bg="bg-danger-light" />
            <MetricCard label="Products" value={d.products} icon={Package} color="text-info-text" bg="bg-info-light" />
          </div>
        </div>
      </div>
    </div>
  );
}

const UserPLUSIcon = UserPlus;
