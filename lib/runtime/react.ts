import { useState, useEffect } from 'react';
import { BehavioralStateStore, CanonicalDashboardState } from '../infrastructure/store';

// 🧠 RUNTIME BINDING LAYER
// The React Presentation Layer strictly consumes this hook. Zero business logic.
export function useBehavioralOS() {
  const [state, setState] = useState<CanonicalDashboardState>(BehavioralStateStore.getState());

  useEffect(() => {
    const unsubscribe = BehavioralStateStore.subscribe((newState: CanonicalDashboardState) => {
      setState({ ...newState });
    });
    // Wrapping in block brackets forces a void return, satisfying React's types
    return () => { unsubscribe(); };
  }, []);

  return state;
}
