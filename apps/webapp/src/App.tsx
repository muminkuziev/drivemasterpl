import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Splash } from './pages/Splash';
import { MainMenu } from './pages/MainMenu';
import { RoadSigns } from './pages/RoadSigns';
import { SignDetail } from './pages/SignDetail';
import { Profile } from './pages/Profile';
import { DriverMenu } from './pages/DriverMenu';
import { FirstAid } from './pages/FirstAid';
import { Equipment } from './pages/Equipment';
import { Violations } from './pages/Violations';
import { Feedback } from './pages/Feedback';
import { PsychMenu } from './pages/PsychMenu';
import { ReactionTest } from './pages/ReactionTest';
import { AttentionTest } from './pages/AttentionTest';
import { CoordinationTest } from './pages/CoordinationTest';
import { PiorkowskiTest } from './pages/PiorkowskiTest';
import { KrzyzowyTest } from './pages/KrzyzowyTest';
import { SignalTest } from './pages/SignalTest';
import { TheoryMenu } from './pages/TheoryMenu';
import { TheoryCategoryPicker } from './pages/TheoryCategoryPicker';
import { TheoryQuiz } from './pages/TheoryQuiz';
import { Roadmap } from './pages/Roadmap';
import { Legal } from './pages/Legal';
import { initTelegramWebApp } from './telegram';
import { LocaleProvider } from './i18n/LocaleContext';

function App() {
  useEffect(() => {
    initTelegramWebApp();
  }, []);

  return (
    <LocaleProvider>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/signs" element={<RoadSigns />} />
        <Route path="/signs/:id" element={<SignDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/driver" element={<DriverMenu />} />
        <Route path="/driver/first-aid" element={<FirstAid />} />
        <Route path="/driver/equipment" element={<Equipment />} />
        <Route path="/violations" element={<Violations />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/theory" element={<TheoryMenu />} />
        <Route path="/theory/:type" element={<TheoryCategoryPicker />} />
        <Route path="/theory/:type/play" element={<TheoryQuiz />} />
        <Route path="/psych" element={<PsychMenu />} />
        <Route path="/psych/reaction" element={<ReactionTest />} />
        <Route path="/psych/attention" element={<AttentionTest />} />
        <Route path="/psych/coordination" element={<CoordinationTest />} />
        <Route path="/psych/piorkowski" element={<PiorkowskiTest />} />
        <Route path="/psych/krzyzowy" element={<KrzyzowyTest />} />
        <Route path="/psych/signal" element={<SignalTest />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/legal/:doc" element={<Legal />} />
      </Routes>
    </LocaleProvider>
  );
}

export default App;
