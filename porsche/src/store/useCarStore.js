import { create } from 'zustand';

const useCarStore = create((set) => ({
  // QUẢN LÝ FILE 3D VÀ MÀU SẮC
  currentCarPath: '/porsche.glb',
  carColor: '#00d9ff',
  
  // QUẢN LÝ GIAO DIỆN (THEME & SIDEBAR)
  theme: 'light', 
  isSidebarOpen: false,

  // QUẢN LÝ DÒNG XE ĐANG XEM CHÍNH
  activeCar: 'GT3 RS',

  // CÁC HÀM CẬP NHẬT TRẠNG THÁI (ACTIONS)
  setCurrentCar: (path) => set({ currentCarPath: path }),
  setCarColor: (color) => set({ carColor: color }),
  setActiveCar: (name) => set({ activeCar: name }),
  
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  })),

  toggleSidebar: () => set((state) => ({ 
    isSidebarOpen: !state.isSidebarOpen 
  })),
}));

export default useCarStore; 