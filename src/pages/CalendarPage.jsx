import { useState }  from 'react';
import { useQuery }   from '@tanstack/react-query';
import dayjs          from 'dayjs';
import { analyticsApi }  from '@/api/analytics.api';
import { formatCurrency } from '@/utils/formatters';
import Spinner        from '@/components/common/Spinner';

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function CalendarPage() {
  const now = dayjs();
  const [year,  setYear]  = useState(now.year());
  const [month, setMonth] = useState(now.month() + 1); // 1-indexed
  const [selected, setSelected] = useState(null);

  const { data: calData, isLoading } = useQuery({
    queryKey: ['calendar', year, month],
    queryFn:  () => analyticsApi.getCalendar({ year, month }).then(r => r.data.data),
  });

  // Build a map: { 'YYYY-MM-DD': { count, totalPremium, policies } }
  const dayMap = (calData ?? []).reduce((acc, d) => {
    acc[d.date] = d;
    return acc;
  }, {});

  // Build calendar grid
  const firstDay = dayjs(`${year}-${month}-01`);
  const daysInMonth = firstDay.daysInMonth();
  const startPad    = firstDay.day(); // 0=Sun

  const cells = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const maxCount = Math.max(...(calData ?? []).map(d => d.count), 1);

  const getIntensity = (count) => {
    if (!count) return 'bg-gray-100';
    const ratio = count / maxCount;
    if (ratio < 0.25) return 'bg-brand-100';
    if (ratio < 0.5)  return 'bg-brand-200';
    if (ratio < 0.75) return 'bg-brand-400';
    return 'bg-brand-600';
  };

  const dateStr = (day) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const selectedData = selected ? dayMap[dateStr(selected)] : null;

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="btn-secondary px-3 py-1.5 text-xs">← Prev</button>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-900">
            {MONTHS[month - 1]} {year}
          </p>
          <p className="text-xs text-gray-400">
            {calData?.length ?? 0} active days ·{' '}
            {(calData ?? []).reduce((s, d) => s + d.count, 0)} policies
          </p>
        </div>
        <button onClick={nextMonth} className="btn-secondary px-3 py-1.5 text-xs">Next →</button>
      </div>

      {/* Calendar grid */}
      <div className="card p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} />;
              const key   = dateStr(day);
              const info  = dayMap[key];
              const isSelected = selected === day;

              return (
                <button
                  key={key}
                  onClick={() => setSelected(isSelected ? null : day)}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center
                    text-xs transition-all relative
                    ${info ? getIntensity(info.count) : 'bg-gray-50 hover:bg-gray-100'}
                    ${isSelected ? 'ring-2 ring-brand-600 ring-offset-1' : ''}
                    ${info ? 'cursor-pointer' : 'cursor-default'}
                  `}
                >
                  <span className={`font-medium ${info && info.count > 0 ? (info.count / maxCount > 0.5 ? 'text-white' : 'text-brand-800') : 'text-gray-500'}`}>
                    {day}
                  </span>
                  {info && (
                    <span className={`text-[9px] ${info.count / maxCount > 0.5 ? 'text-white/80' : 'text-brand-600'}`}>
                      {info.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-xs text-gray-400">Less</span>
          {['bg-gray-100','bg-brand-100','bg-brand-200','bg-brand-400','bg-brand-600'].map(c => (
            <div key={c} className={`w-4 h-4 rounded ${c}`} />
          ))}
          <span className="text-xs text-gray-400">More</span>
        </div>
      </div>

      {/* Day detail panel */}
      {selected && (
        <div className="card p-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">
            {dayjs(dateStr(selected)).format('dddd, DD MMM YYYY')}
          </h3>

          {!selectedData ? (
            <p className="text-sm text-gray-400">No policies paid on this day.</p>
          ) : (
            <>
              <div className="flex gap-4 mb-4">
                <div className="card px-4 py-3 flex-1 text-center">
                  <p className="text-xl font-bold text-gray-900">{selectedData.count}</p>
                  <p className="text-xs text-gray-400">Policies</p>
                </div>
                <div className="card px-4 py-3 flex-1 text-center">
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(selectedData.totalPremium)}
                  </p>
                  <p className="text-xs text-gray-400">Total Premium</p>
                </div>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedData.policies.map((p) => (
                  <div key={p._id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-700 font-medium truncate max-w-[180px]">
                      {p.policyHolderName}
                    </span>
                    <span className="text-gray-500 shrink-0 ml-2">
                      {formatCurrency(p.premiumWithGST)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
