import React from 'react';

const SHOWROOM_DETAILS = {
  'Porsche Centre Saigon': {
    address: '802 Nguyễn Văn Linh, P. Tân Phú, Quận 7, TP. HCM',
    phone: '+84 28 5414 1911',
    image: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/v1783567347/saigon-porsche_jjd88k.jpg'
  },
  'Porsche Centre Hanoi': {
    address: '562 Nguyễn Văn Cừ, P. Gia Thụy, Quận Long Biên, Hà Nội',
    phone: '+84 24 6288 8911',
    image: 'https://res.cloudinary.com/dq8xgcqhk/image/upload/v1783567348/hanoi-porsche_kkd77l.jpg' // Placeholder, using saigon image if needed or just color box
  }
};

export default function ShowroomMap({ selectedShowroom, onSelectShowroom }) {
  
  const hanoiActive = selectedShowroom === 'Porsche Centre Hanoi';
  const saigonActive = selectedShowroom === 'Porsche Centre Saigon';

  const details = SHOWROOM_DETAILS[selectedShowroom] || SHOWROOM_DETAILS['Porsche Centre Saigon'];

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col md:flex-row h-full min-h-[380px]">
      
      {/* CỘT TRÁI: BẢN ĐỒ VECTOR */}
      <div className="w-full md:w-5/12 bg-[#080808] relative flex items-center justify-center p-6 min-h-[200px]">
        {/* Đường kẻ nối dọc Bắc Nam điệu đà */}
        <div className="absolute top-[20%] bottom-[20%] left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
        
        {/* Vùng bản đồ mờ ảo (abstract) */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] pointer-events-none"></div>
        
        {/* HÀ NỘI */}
        <div 
          className="absolute top-[25%] left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group"
          onClick={() => onSelectShowroom('Porsche Centre Hanoi')}
        >
          {hanoiActive && <div className="absolute w-12 h-12 bg-red-600/30 rounded-full animate-ping"></div>}
          <div className={`relative z-10 w-4 h-4 rounded-full border-2 transition-colors duration-300 ${hanoiActive ? 'bg-red-600 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'bg-[#080808] border-white/40 group-hover:border-white'}`}></div>
          <span className={`mt-3 text-[9px] uppercase tracking-widest font-bold whitespace-nowrap transition-colors ${hanoiActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`}>
            Hà Nội
          </span>
        </div>

        {/* SÀI GÒN */}
        <div 
          className="absolute bottom-[25%] left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer group"
          onClick={() => onSelectShowroom('Porsche Centre Saigon')}
        >
          {saigonActive && <div className="absolute w-12 h-12 bg-red-600/30 rounded-full animate-ping"></div>}
          <div className={`relative z-10 w-4 h-4 rounded-full border-2 transition-colors duration-300 ${saigonActive ? 'bg-red-600 border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]' : 'bg-[#080808] border-white/40 group-hover:border-white'}`}></div>
          <span className={`mt-3 text-[9px] uppercase tracking-widest font-bold whitespace-nowrap transition-colors ${saigonActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`}>
            Sài Gòn
          </span>
        </div>
      </div>

      {/* CỘT PHẢI: THÔNG TIN CHI TIẾT (INFO CARD) */}
      <div className="w-full md:w-7/12 bg-white relative p-6 flex flex-col justify-between">
        <div>
          <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[9px] uppercase font-bold tracking-widest mb-4">
            Showroom Được Chọn
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedShowroom}</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">{details.address}</p>
          
          <div className="flex items-center gap-3 text-sm text-gray-900 font-medium">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-red-600">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            </div>
            {details.phone}
          </div>
        </div>

        {/* ẢNH SHOWROOM */}
        <div className="w-full h-32 md:h-40 bg-gray-100 mt-6 rounded-xl overflow-hidden relative border border-gray-100">
           {/* Fallback image if real image not available */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-3 left-4 text-white text-[10px] font-bold tracking-widest uppercase opacity-80">
            Trải nghiệm đẳng cấp
          </div>
        </div>
      </div>

    </div>
  );
}
