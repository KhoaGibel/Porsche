import { create } from 'zustand';

const useCarStore = create((set) => ({
  // QUẢN LÝ USER
  user: null,
  setUser: (userData) => set({ user: userData }),

  // QUẢN LÝ FILE 3D VÀ MÀU SẮC
  currentCarPath: '/porsche.glb',
  carColor: null,
  
  // QUẢN LÝ GIAO DIỆN
  theme: 'light', 
  isSidebarOpen: false,

  // QUẢN LÝ DÒNG XE ĐANG XEM CHÍNH
  activeCar: 'GT3 RS',

  // ACTIONS
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