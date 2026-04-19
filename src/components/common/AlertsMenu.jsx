import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle } from "lucide-react";
import { productsClient } from "../../api/productsClient";

export default function AlertsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await productsClient.getAlerts(true);
      setAlerts(data || []);
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 60000); // Polling every minute
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Close dropdown on outside click
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResolve = async (id) => {
    try {
      await productsClient.resolveAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert("Failed to resolve alert.");
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && alerts.length === 0) fetchAlerts();
        }}
      >
        <Bell size={20} />
        {alerts.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 rounded-full border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
            {alerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-[#213555] text-sm">Low Stock Alerts</h3>
            <button onClick={fetchAlerts} className="text-xs text-[#4F709C] hover:underline">Refresh</button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {loading && alerts.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
            ) : alerts.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No active alerts.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-3 hover:bg-gray-50 transition-colors flex justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#213555]">{alert.productName}</p>
                      <p className="text-xs text-gray-500">SKU: {alert.sku}</p>
                      <p className="text-xs font-semibold text-rose-500 mt-1">
                        Stock: {alert.quantityAtAlert} (Threshold: {alert.lowStockThreshold})
                      </p>
                    </div>
                    <button 
                      onClick={() => handleResolve(alert.id)}
                      className="text-gray-400 hover:text-emerald-500 transition-colors p-1"
                      title="Mark as Resolved"
                    >
                      <CheckCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
