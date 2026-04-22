import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const CURRENCY_DATA = {
  IDR: { symbol: 'IDR', rate: 1, label: 'Indonesia Rupiah' },
  USD: { symbol: '$', rate: 15800, label: 'United States Dollar' },
  AUD: { symbol: 'A$', rate: 10400, label: 'Australian Dollar' },
  CNY: { symbol: '¥', rate: 2100, label: 'China Yuan Renminbi' },
};

export default function CurrencyDropdown({ selectedCurrency, setSelectedCurrency, isDropdownOpen, setIsDropdownOpen, dropdownRef }) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
        className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-all min-w-[80px] justify-between"
      >
        <span className="text-xs font-bold text-slate-700">{selectedCurrency}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[999]"
          >
            <div className="py-2">
              {Object.keys(CURRENCY_DATA).map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setSelectedCurrency(code);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-xs font-bold transition-colors flex justify-between items-center ${
                    selectedCurrency === code 
                    ? 'text-sky-600 bg-sky-50/50' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{code} - {CURRENCY_DATA[code].label}</span>
                  {selectedCurrency === code && <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}