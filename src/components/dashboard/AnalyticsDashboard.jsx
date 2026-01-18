import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatNumber, formatDate } from '../../utils/helpers';

export default function AnalyticsDashboard({ eggs, transactions, families, settings }) {
  const { t } = useLanguage();

  // 1. Egg Production Data (Last 30 records)
  const productionData = [...eggs].reverse().slice(-30).map(e => ({
    date: formatDate(e.date),
    quantity: e.quantity
  }));

  // 2. Profitability Analysis
  const eggPrice = settings?.family_settings?.eggPrice || 0;
  const totalEggsProd = eggs.reduce((sum, e) => sum + e.quantity, 0);
  const potentialRevenue = totalEggsProd * eggPrice;
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = potentialRevenue - totalExpenses;

  // 3. Family Performance (Confirmed vs Rejected)
  const familyData = families.map(family => {
    let confirmed = 0;
    let rejected = 0;
    let confirmedEggs = 0;
    let rejectedEggs = 0;

    eggs.forEach(egg => {
      const delivery = egg.deliveries?.[family.id];
      if (delivery) {
        // Calculate the actual share of eggs for this family in this production record
        // Fallback to average if share not explicitly stored in delivery (though it usually is)
        const familyShare = delivery.amount || Math.floor(egg.quantity / (egg.familyCountAtProduction || families.length));

        if (delivery.status === 'delivered') {
          confirmed++;
          confirmedEggs += familyShare;
        } else if (delivery.status === 'rejected') {
          rejected++;
          rejectedEggs += familyShare;
        }
      }
    });

    return {
      name: family.name,
      confirmed,
      rejected,
      confirmedEggs,
      rejectedEggs
    };
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-gray-800">{t?.eggs?.analytics?.title || 'Analytics'}</h2>

      {/* Profitability Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-green-500">
          <p className="text-sm text-gray-500">{(t?.eggs?.analytics?.production || 'Production')} (Total Value)</p>
          <p className="text-2xl font-bold text-green-600">{formatNumber(potentialRevenue)} {t?.common?.currency}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-red-500">
          <p className="text-sm text-gray-500">{t?.dashboard?.expenses}</p>
          <p className="text-2xl font-bold text-red-600">{formatNumber(totalExpenses)} {t?.common?.currency}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-b-4 border-blue-500">
          <p className="text-sm text-gray-500">{t?.eggs?.analytics?.netProfit || 'Net Profit'}</p>
          <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatNumber(netProfit)} {t?.common?.currency}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Egg Production Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">
          <h3 className="font-bold text-gray-800 mb-4">{t?.eggs?.analytics?.eggProduction || 'Egg Production'}</h3>
          <div className="w-full relative" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0} debounce={1}>
              <LineChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="quantity" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Family Performance Chart */}
        <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">
          <h3 className="font-bold text-gray-800 mb-4">{t?.eggs?.analytics?.familyPerformance || 'Family Performance'}</h3>
          <div className="w-full relative" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={0} debounce={1}>
              <BarChart data={familyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="confirmed" fill="#10b981" name={t?.eggs?.analytics?.confirmed || 'Confirmed (Times)'} />
                <Bar dataKey="rejected" fill="#ef4444" name={t?.eggs?.analytics?.rejected || 'Rejected (Times)'} />
                <Bar dataKey="confirmedEggs" fill="#34d399" name={t?.eggs?.analytics?.confirmedEggs || 'Confirmed (Eggs)'} />
                <Bar dataKey="rejectedEggs" fill="#f87171" name={t?.eggs?.analytics?.rejectedEggs || 'Rejected (Eggs)'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
