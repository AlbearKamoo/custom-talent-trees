import TalentTreeEditor from './components/TalentTreeEditor';
import { sampleCompactDruidGroup } from './data/sampleTalentTree';

function App() {
  return (
    <div className="App">
      <TalentTreeEditor group={sampleCompactDruidGroup} />
    </div>
  );
}

export default App;
