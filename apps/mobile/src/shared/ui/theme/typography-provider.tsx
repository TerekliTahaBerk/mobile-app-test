import {
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { createContext, type ReactNode, useContext } from 'react';

const TypographyReadyContext = createContext(false);

type AppTypographyProviderProps = {
  children: ReactNode;
};

/**
 * Loads the four brand font weights used by the current type scale. Rendering
 * is never blocked: system fonts remain the graceful startup/error fallback.
 */
export function AppTypographyProvider({ children }: AppTypographyProviderProps) {
  const [fontsLoaded, fontError] = useFonts({
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Nunito_400Regular,
    Nunito_700Bold,
  });

  return (
    <TypographyReadyContext.Provider value={fontsLoaded && !fontError}>
      {children}
    </TypographyReadyContext.Provider>
  );
}

export function useAppTypographyReady() {
  return useContext(TypographyReadyContext);
}
