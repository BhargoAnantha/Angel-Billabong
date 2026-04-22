import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';

const featureData = [
  {
    title: "Premium Comfort",
    desc: "Nikmati perjalanan dengan kursi ergonomis dan AC penuh untuk kenyamanan maksimal.",
    img: "/img/features1.png"
  },
  {
    title: "Instant Reservation",
    desc: "Sistem pemesanan online yang cepat dan mudah dalam hitungan detik.",
    img: "/img/features2.png"
  },
  {
    title: "Smart Weather Guide",
    desc: "Pemantauan cuaca real-time untuk menjamin keberangkatan yang paling aman.",
    img: "/img/features3.png"
  },
  {
    title: "Safety & Security",
    desc: "Dilengkapi peralatan keselamatan standar internasional dan kru bersertifikat.",
    img: "/img/features4.png"
  },
  {
    title: "Fastest Crossing",
    desc: "Mesin bertenaga tinggi untuk memastikan waktu tempuh tercepat ke tujuan Anda.",
    img: "/img/features5.png"
  },
  {
    title: "Island Expert",
    desc: "Kru berpengalaman yang siap memberikan informasi terbaik tentang destinasi pulau.",
    img: "/img/features6.png"
  }
];

export default function Features({ fadeIn }) {
  return (
    <section className="py-24 bg-white font-['Poppins'] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6">
        
        <Swiper
          breakpoints={{
            320: { slidesPerView: 1.2, spaceBetween: 24 },
            768: { slidesPerView: 2.5, spaceBetween: 32 },
            1024: { slidesPerView: 3.5, spaceBetween: 40 },
            1280: { slidesPerView: 4.2, spaceBetween: 48 },
          }}
          freeMode={true}
          grabCursor={true}
          modules={[FreeMode, Autoplay]}
          className="overflow-visible" // Penting agar elemen tidak terpotong saat di-drag
        >
          {featureData.map((item, index) => (
            <SwiperSlide key={index}>
              <motion.div 
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col h-full group"
              >
                {/* Image Section - Tanpa Border, Tanpa Box Shadow Berat */}
                <div className="aspect-[3/4] overflow-hidden mb-8 shadow-sm">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                  />
                </div>

                {/* Content Section - Minimalis & Rapi */}
                <div className="flex flex-col">
                  <h3 className="text-[20px] font-bold text-[#1a1a1a] mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[#666666] text-[14px] leading-relaxed max-w-[90%] font-light">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}