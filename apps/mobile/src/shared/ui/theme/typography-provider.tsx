import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { createContext, type ReactNode, useContext } from 'react';

const TypographyReadyContext = createContext(false);

type AppTypographyProviderProps = {
  children: ReactNode;
};

/**
 * Loads the brand weights the imported design actually uses: Manrope
 * 400/500/700/800 for everything, plus JetBrains Mono Medium for the small
 * counter labels. Rendering is never blocked — system fonts remain the startup
 * and error fallback, so a font failure cannot produce a blank screen.
 */
export function AppTypographyProvider({ children }: AppTypographyProviderProps) {
  const [fontsLoaded, fontError] = useFonts({
    JetBrainsMono_500Medium,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
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
