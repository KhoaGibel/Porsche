/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect } from 'react';
import { ability, updateAbility } from '../config/ability';
import useCarStore from '../store/useCarStore';

// 1. Tự tạo Context bằng React thuần (Luôn có sẵn ability gốc, không bao giờ undefined)
export const AbilityContext = createContext(ability);

// 2. Custom Provider
export function AbilityProvider({ children }) {
  const user = useCarStore((s) => s.user ?? null);

  useEffect(() => {
    if (updateAbility) {
      updateAbility(user);
    }
  }, [user]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

// 3. Custom Hook (Sử dụng useContext NGUYÊN BẢN CỦA REACT)
export function useAbility() {
  const context = useContext(AbilityContext);
  // Nếu có lỗi ngầm lag import, luôn có phao cứu sinh là ability gốc
  return context || ability; 
}

// 4. Tự code thẻ <Can> siêu cấp nhẹ và không bao giờ crash
export function Can({ do: action, on: subject, children }) {
  const currentAbility = useAbility();

  // Kiểm tra quyền, nếu thoả mãn thì render UI, không thì ẩn đi
  if (currentAbility && currentAbility.can(action, subject)) {
    return children;
  }
  
  return null;
}

// 5. Hàm check quyền dùng cho logic JS
export function usePermission(action, subject) {
  return useAbility().can(action, subject);
}