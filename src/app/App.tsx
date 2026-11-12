import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { ArticlesPractice } from '../modules/articles/ArticlesPractice';
import { BodyPractice } from '../modules/body/BodyPractice';
import { DatesPractice } from '../modules/dates/DatesPractice';
import { FindTheMistakePractice } from '../modules/find-the-mistake/FindTheMistakePractice';
import { ListeningPractice } from '../modules/listening/ListeningPractice';
import { MissingWordPractice } from '../modules/missing-word/MissingWordPractice';
import { ModalVerbsPractice } from '../modules/modal-verbs/ModalVerbsPractice';
import { NegationPractice } from '../modules/negation/NegationPractice';
import { NumbersPractice } from '../modules/numbers/NumbersPractice';
import { PerfectTensePractice } from '../modules/perfect-tense/PerfectTensePractice';
import { PictureDescriptionPractice } from '../modules/picture-description/PictureDescriptionPractice';
import { PrepositionsPractice } from '../modules/prepositions/PrepositionsPractice';
import { PronunciationPractice } from '../modules/pronunciation/PronunciationPractice';
import { SeparableVerbsPractice } from '../modules/separable-verbs/SeparableVerbsPractice';
import { ConversationPractice } from '../modules/conversations/ConversationPractice';
import { BossBattlePractice } from '../modules/boss-battle/BossBattlePractice';
import { TimePractice } from '../modules/time/TimePractice';
import { TranslationPractice } from '../modules/translation/TranslationPractice';
import { VerbsPractice } from '../modules/verbs/VerbsPractice';
import { VocabularyPractice } from '../modules/vocabulary/VocabularyPractice';
import { WordOrderPractice } from '../modules/word-order/WordOrderPractice';
import { WordListsPractice } from '../modules/word-lists/WordListsPractice';
import { AboutPage } from '../pages/AboutPage';
import { AchievementsPage } from '../pages/AchievementsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LearnPage } from '../pages/LearnPage';
import { NotFoundPage, PlaceholderModulePage } from '../pages/PlaceholderModulePage';
import { ProgressPage } from '../pages/ProgressPage';
import { ReviewPage } from '../pages/ReviewPage';
import { SettingsPage } from '../pages/SettingsPage';
import { CoursePage } from '../pages/CoursePage';
import { CourseUnitPage } from '../pages/CourseUnitPage';
import { DailyGoalsPage } from '../pages/DailyGoalsPage';
import { SpeechSynthesisProvider } from './SpeechSynthesisProvider';
import { AppStateProvider } from './AppStateContext';

const QuestionsAnswersPractice = lazy(() =>
  import('../modules/questions-answers/QuestionsAnswersPractice').then((module) => ({
    default: module.QuestionsAnswersPractice,
  })),
);

export function App() {
  return (
    <AppStateProvider>
      <HashRouter>
        <SpeechSynthesisProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="learn" element={<LearnPage />} />
              <Route path="course" element={<CoursePage />} />
              <Route path="course/:unitId" element={<CourseUnitPage />} />
              <Route path="goals" element={<DailyGoalsPage />} />
              <Route path="review" element={<ReviewPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="achievements" element={<AchievementsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="practice/time" element={<TimePractice />} />
              <Route path="practice/articles" element={<ArticlesPractice />} />
              <Route path="practice/body" element={<BodyPractice />} />
              <Route path="practice/vocabulary" element={<VocabularyPractice />} />
              <Route path="practice/word-lists" element={<WordListsPractice />} />
              <Route path="practice/numbers" element={<NumbersPractice />} />
              <Route path="practice/dates" element={<DatesPractice />} />
              <Route path="practice/verbs" element={<VerbsPractice />} />
              <Route path="practice/word-order" element={<WordOrderPractice />} />
              <Route path="practice/missing-word" element={<MissingWordPractice />} />
              <Route path="practice/modal-verbs" element={<ModalVerbsPractice />} />
              <Route path="practice/negation" element={<NegationPractice />} />
              <Route path="practice/separable-verbs" element={<SeparableVerbsPractice />} />
              <Route path="practice/perfect-tense" element={<PerfectTensePractice />} />
              <Route path="practice/prepositions" element={<PrepositionsPractice />} />
              <Route path="practice/find-the-mistake" element={<FindTheMistakePractice />} />
              <Route path="practice/translation" element={<TranslationPractice />} />
              <Route
                path="practice/questions-answers"
                element={
                  <Suspense
                    fallback={
                      <div className="container py-5" role="status">
                        Loading questions and answers…
                      </div>
                    }
                  >
                    <QuestionsAnswersPractice />
                  </Suspense>
                }
              />
              <Route path="practice/listening" element={<ListeningPractice />} />
              <Route path="practice/conversations" element={<ConversationPractice />} />
              <Route path="practice/picture-description" element={<PictureDescriptionPractice />} />
              <Route path="practice/pronunciation" element={<PronunciationPractice />} />
              <Route path="practice/boss-battle" element={<BossBattlePractice />} />
              <Route path="modules/:moduleId" element={<PlaceholderModulePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </SpeechSynthesisProvider>
      </HashRouter>
    </AppStateProvider>
  );
}
