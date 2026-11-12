import { DutchAudio } from '../components/DutchAudio';
import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppState } from '../app/AppStateContext';
import {
  a1Course,
  courseCheckpointId,
  courseLessonId,
  isCourseUnitUnlocked,
} from '../data/a1Course';

export function CourseUnitPage() {
  const { unitId } = useParams();
  const { state, completeActivity, addAttempt } = useAppState();
  const index = a1Course.findIndex((item) => item.id === unitId);
  const unit = a1Course[index];
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  if (!unit) return <Navigate to="/course" replace />;
  if (!isCourseUnitUnlocked(index, state.progress.completedLessons))
    return <Navigate to="/course" replace />;
  const completed = state.progress.completedLessons;
  const lessonsDone = unit.lessons.every((lesson) =>
    completed.includes(courseLessonId(unit.id, lesson.id)),
  );
  const checkpointId = courseCheckpointId(unit.id);
  const checkpointDone = completed.includes(checkpointId);
  function check() {
    if (!answer || feedback || checkpointDone) return;
    const correct = answer === unit.checkpoint.correct;
    addAttempt({
      questionId: checkpointId,
      moduleId: 'course',
      difficulty: unit.number < 6 ? 'easy' : unit.number < 12 ? 'medium' : 'hard',
      prompt: unit.checkpoint.prompt,
      submittedAnswer: answer,
      correctAnswer: unit.checkpoint.correct,
      correct,
      xpEarned: correct ? 10 : 0,
    });
    if (correct) completeActivity(checkpointId, 15);
    setFeedback(correct ? 'correct' : 'wrong');
  }
  return (
    <div className="container py-4 py-lg-5">
      <Link className="text-decoration-none" to="/course">
        <i className="bi bi-arrow-left me-1" />
        Course map
      </Link>
      <span className="eyebrow d-block mt-4">Unit {unit.number} of 16</span>
      <h1 className="display-6 fw-bold">{unit.title}</h1>
      <p className="text-secondary">{unit.description}</p>
      <div className="row g-4">
        {unit.lessons.map((lesson) => {
          const id = courseLessonId(unit.id, lesson.id);
          const done = completed.includes(id);
          return (
            <div className="col-12 col-lg-6" key={id}>
              <section
                className={`card border-0 shadow-sm h-100 ${done ? 'course-lesson-done' : ''}`}
              >
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between">
                    <h2 className="h4 fw-bold">{lesson.title}</h2>
                    {done && <i className="bi bi-check-circle-fill text-success fs-4" />}
                  </div>
                  <p>{lesson.explanation}</p>
                  <div className="alert alert-light border" lang="nl">
                    {lesson.example}
                    <div className="mt-2">
                      <DutchAudio text={lesson.example} />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success"
                      disabled={done}
                      onClick={() => completeActivity(id, 5)}
                    >
                      {done ? 'Completed' : 'Mark lesson complete'}
                    </button>
                    <Link className="btn btn-outline-primary" to={lesson.practiceRoute}>
                      Practice
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          );
        })}
      </div>
      <section className={`card border-0 shadow-sm mt-4 ${lessonsDone ? '' : 'opacity-50'}`}>
        <div className="card-body p-4 p-lg-5">
          <span className="eyebrow">Unit checkpoint</span>
          <h2 className="h3 fw-bold">{unit.checkpoint.prompt}</h2>
          {checkpointDone ? (
            <div className="alert alert-success">
              <i className="bi bi-trophy-fill me-2" />
              Checkpoint complete. The next unit is unlocked.
            </div>
          ) : (
            <>
              <fieldset>
                {unit.checkpoint.options.map((option) => (
                  <div key={option}>
                    <label className={`answer-choice mb-2 ${answer === option ? 'selected' : ''}`}>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="checkpoint"
                        checked={answer === option}
                        onChange={() => setAnswer(option)}
                      />
                      <span lang="nl">{option}</span>
                    </label>
                    <div className="mb-2">
                      <DutchAudio text={option} compact />
                    </div>
                  </div>
                ))}
              </fieldset>
              {feedback && (
                <div
                  className={`alert mt-3 ${feedback === 'correct' ? 'alert-success' : 'alert-danger'}`}
                >
                  {feedback === 'correct'
                    ? 'Correct! Unit complete.'
                    : `Not yet. ${unit.checkpoint.explanation}`}
                </div>
              )}
              <button
                className="btn btn-primary mt-3"
                disabled={!lessonsDone || !answer || Boolean(feedback)}
                onClick={check}
              >
                Check answer
              </button>
              {feedback === 'wrong' && (
                <button
                  className="btn btn-link mt-3"
                  onClick={() => {
                    setAnswer('');
                    setFeedback(null);
                  }}
                >
                  Try again
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
