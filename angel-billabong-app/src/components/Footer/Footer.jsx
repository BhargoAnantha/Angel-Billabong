import { MapPin, Mail, Phone, Instagram } from 'lucide-react';

const PAYMENT_LOGOS = [
  { name: 'Mastercard', img: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' },
  { name: 'Visa', img: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' },
  { name: 'JCB', img: 'https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg' },
  { name: 'Amex', img: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg' },
  { name: 'QRIS', img: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg' },
  { name: 'PayPal', img: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
  { name: 'OVO', img: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg' },
  { name: 'Shopee', img: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg' },
  { name: 'Alfamart', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Alfamart_logo.svg/1200px-Alfamart_logo.svg.png' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a1128] text-white pt-20 pb-10 px-6 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-white/10 pb-16">
        
        {/* 1. CONTACT US */}
        <div className="space-y-6">
          <h3 className="font-bold uppercase tracking-[0.2em] text-sm">Contact Us</h3>
          <ul className="space-y-4 text-slate-400 text-sm">
            <li className="flex gap-4 items-start">
              <MapPin size={20} className="text-sky-500 shrink-0" /> 
              <span>Br. Nyuh, Desa Ped, Kec. Nusa Penida, Kab. Klungkung</span>
            </li>
            <li className="flex gap-4 items-center">
              <Mail size={20} className="text-sky-500 shrink-0" />
              <span>angelbillabongfastcruise@gmail.com</span>
            </li>
            <li className="flex gap-4 items-center">
              <Phone size={20} className="text-sky-500 shrink-0" />
              <span>+6282144048323</span>
            </li>
            <li className="flex gap-4 items-center">
              <Instagram size={20} className="text-sky-500 shrink-0" />
              <span>@angelbillabongfastcruise</span>
            </li>
          </ul>
        </div>

        {/* 2. PAYMENTS METHOD */}
        <div className="space-y-6">
          <h3 className="font-bold uppercase tracking-[0.2em] text-sm">Payments Method</h3>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            At Angel Billabong Fast Cruise we take your online security seriously. 
            All of the payments processed are secure and encrypted.
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {PAYMENT_LOGOS.map((logo, i) => (
              <div 
                key={i} 
                className="h-10 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-sm hover:scale-105 transition-transform duration-300"
                title={logo.name}
              >
                <img 
                  src={logo.img} 
                  alt={logo.name} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 3. LOCATION MAP */}
        <div className="space-y-6">
          <h3 className="font-bold uppercase tracking-[0.2em] text-sm">Location Map</h3>
          <div className="w-full h-52 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3942.8718442080034!2d115.508535!3d-8.675681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd27192a5d2906d%3A0x6a0c0e251b5c9603!2sAngel&#39;s%20Billabong%20Fast%20Cruise!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale invert contrast-125 opacity-80 hover:filter-none hover:opacity-100 transition-all duration-700"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-600 text-[10px] uppercase tracking-[0.3em]">
          © 2026 Angel Billabong Fast Cruise. All Rights Reserved.
        </p>
        <div className="flex gap-6 text-slate-600 text-[9px] uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-sky-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-sky-500 transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}