import { useState, useEffect } from 'react';
import { BehavioralStateStore, BehavioralState } from '../infrastructure/store';

// 🧠 RUNTIME BINDING LAYER
// The React Presentation Layer strictly consumes this hook. Zero business logic.
export function useBehavioralOS(): BehavioralState {
  const [state, setState] = useState<BehavioralState>(BehavioralStateStore.getState());

  useEffect(() => {
    const unsubscribe = BehavioralStateStore.subscribe((newState: BehavioralState) => {
      setState({ ...newState });
    });
    return () => { unsubscribe(); };
  }, []);

  return state;
}

