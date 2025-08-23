import React from 'react';
import './App.css';
import { useCalculator } from './hooks/useCalculator';
import { Display } from './components/Display';
import { ButtonPanel } from './components/ButtonPanel';

function App() {
  const { state, dispatch } = useCalculator();

  return (
    <div className="App">
      <div className="calculator">
        <Display value={state.display} />
        <ButtonPanel
          onDigit={(d) => dispatch({ type: 'INPUT_DIGIT', digit: d })}
          onOperation={(op) => dispatch({ type: 'CHOOSE_OP', operation: op })}
          onEvaluate={() => dispatch({ type: 'EVALUATE' })}
          onClear={() => dispatch({ type: 'CLEAR' })}
        />
      </div>
    </div>
  );
}

export default App;
