import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { ArticlesPractice } from '../modules/articles/ArticlesPractice';
import { DatesPractice } from '../modules/dates/DatesPractice';
import { MissingWordPractice } from '../modules/missing-word/MissingWordPractice';
import { NumbersPractice } from '../modules/numbers/NumbersPractice';
import { TimePractice } from '../modules/time/TimePractice';
import { VerbsPractice } from '../modules/verbs/VerbsPractice';
import { VocabularyPractice } from '../modules/vocabulary/VocabularyPractice';
import { WordOrderPractice } from '../modules/word-order/WordOrderPractice';
import { AboutPage } from '../pages/AboutPage';
import { AchievementsPage } from '../pages/AchievementsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LearnPage } from '../pages/LearnPage';
import { NotFoundPage, PlaceholderModulePage } from '../pages/PlaceholderModulePage';
import { ProgressPage } from '../pages/ProgressPage';
import { ReviewPage } from '../pages/ReviewPage';
import { SettingsPage } from '../pages/SettingsPage';
import { AppStateProvider } from './AppStateContext';

export function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="practice/time" element={<TimePractice />} />
            <Route path="practice/articles" element={<ArticlesPractice />} />
            <Route path="practice/vocabulary" element={<VocabularyPractice />} />
            <Route path="practice/numbers" element={<NumbersPractice />} />
            <Route path="practice/dates" element={<DatesPractice />} />
            <Route path="practice/verbs" element={<VerbsPractice />} />
            <Route path="practice/word-order" element={<WordOrderPractice />} />
            <Route path="practice/missing-word" element={<MissingWordPractice />} />
            <Route path="modules/:moduleId" element={<PlaceholderModulePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppStateProvider>
  );
}
