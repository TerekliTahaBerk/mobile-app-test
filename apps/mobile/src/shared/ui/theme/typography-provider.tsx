import { Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { createContext, type ReactNode, useContext } from 'react';

const TypographyReadyContext = createContext(false);

type AppTypographyProviderProps = {
  children: ReactNode;
};

/**
 * Loads the brand weights the imported design actually uses: Baloo 2 ExtraBold
 * for display moments and Nunito 400/600/700/800/900 for interface and body
 * text. Rendering is never blocked — system fonts remain the startup and error
 * fallback, so a font failure cannot produce a blank screen.
 */
export function AppTypographyProvider({ children }: AppTypographyProviderProps) {
  const [fontsLoaded, fontError] = useFonts({
    Baloo2_800ExtraBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
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
