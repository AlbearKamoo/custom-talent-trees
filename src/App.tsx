import TalentTreeEditor from './components/TalentTreeEditor';
import { sampleBloodDeathKnightTree } from './data/sampleTalentTree';

function App() {
  return (
    <div className="App">
      <TalentTreeEditor 
        tree={sampleBloodDeathKnightTree} 
        initialPoints={51}
      />
    </div>
  );
}

export default App; 