/* eslint-disable react-refresh/only-export-components */
import { useEffect, createContext } from 'react';
import { 
  AbilityProvider as CaslAbilityProvider, 
  Can as CaslCan, 
  useAbility as useCaslAbility 
} from '@casl/react';
import { ability, updateAbility } from '../abilities/ability';

// Vẫn giữ lại export này đề phòng có file cũ nào đó đang import
export const AbilityContext = createContext(ability);

export function AbilityProvider({ user, children }) {
  useEffect(() => { 
    updateAbility(user); 
  }, [user]);

  return (
    // Dùng trực tiếp Provider có sẵn của CASL v7
    <CaslAbilityProvider ability={ability}>
      {children}
    </CaslAbilityProvider>
  );
}

// Bọc lại hook của CASL (ở v7 không cần truyền Context vào nữa)
export function useAbility() {
  return useCaslAbility();
}

// Dùng trực tiếp thẻ Can gốc của thư viện
export const Can = CaslCan;

export function usePermission(action, subject) {
  return useAbility().can(action, subject);
}