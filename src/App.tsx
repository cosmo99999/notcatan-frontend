import { createContext, useContext, useState, type ReactNode } from 'react';
import './App.css'
import { StructureType, type Game } from '@cosmo99999/notcatan-shared';
import { GameWrapper } from './Game';

interface contextType {
  game: Game | null;
  me: number;
  actionCounter: number;
  highlighted: StructureType;
  setHighlighted: (s: StructureType) => void;
  setActionCounter: (i: number) => void;
  setGame: (game: Game) => void;
  setMe: (id: number) => void;
}
export const AppContext = createContext<contextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<Game | null>(null);
  const [me, setMe] = useState<number>(-1);
  const [actionCounter, setActionCounter] = useState<number>(-1);
  const [highlighted, setHighlighted] = useState(StructureType.None);
  return (
    <AppContext.Provider value={{ game, setGame, me, setMe, actionCounter, setActionCounter, highlighted, setHighlighted }}>
      {children}
    </AppContext.Provider>
  )
}
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("context error");
  }
  return context;
}
function App() {
  return (
    <AppProvider>
      <GameWrapper />
    </AppProvider>
  )
}

export default App
