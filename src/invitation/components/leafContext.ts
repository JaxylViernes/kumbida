import { createContext, useContext } from 'react';

/** true only for the page currently in front of the guest (not pages waiting beneath). */
export const LeafActiveContext = createContext(true);
export const useLeafActive = () => useContext(LeafActiveContext);
