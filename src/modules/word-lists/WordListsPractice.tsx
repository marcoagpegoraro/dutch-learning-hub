import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAppState } from '../../app/AppStateContext';
import { isAcceptedAnswer, normalizeAnswer } from '../../services/answerNormalization';
import type { WordList, WordListEntry } from './wordListData';
import { starterWordLists } from './wordListData';
import {
  answerWordList,
  retryWordList,
  startWordList,
  removeWordList,
  type WordListThemeProgress,
} from './wordListEngine';

interface DraftEntry {
  dutch: string;
  portuguese: string;
}
function makeCustomId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `custom-${crypto.randomUUID()}`
    : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function WordListDrill({
  list,
  onExit,
  onNext,
}: {
  list: WordList;
  onExit: () => void;
  onNext?: () => void;
}) {
  const { state, updateWordLists, completeActivity } = useAppState();
  const [answer, setAnswer] = useState('');
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  const session = state.wordLists.themes[list.id]?.session;
  const allLists = [...starterWordLists, ...state.wordLists.customLists];
  const word = session?.queue[session.index];
  const source = allLists.find((candidate) => candidate.id === word?.listId);
  const entry = source?.entries.find((candidate) => candidate.id === word?.entryId);

  useEffect(() => {
    if (session?.feedback) retryRef.current?.focus();
    else inputRef.current?.focus();
  }, [session?.index, session?.phase, session?.feedback]);

  function clearInput() {
    setAnswer('');
    setInvalid(false);
  }
  function practiseAgain() {
    updateWordLists((current) => startWordList(current, list, allLists, true));
    clearInput();
  }

  if (!session || !entry) return <p role="status">Choose a theme to begin.</p>;
  if (session.phase === 'complete')
    return (
      <section className="card border-0 shadow-sm word-list-drill">
        <div className="card-body p-4 p-md-5 text-center" role="status">
          <div className="word-list-complete-icon" aria-hidden="true">
            ✓
          </div>
          <h2 className="h3 fw-bold mt-3">Theme complete</h2>
          <p className="text-secondary">
            You recalled all {list.entries.length} words in both directions. Your completion is
            saved. This theme is always available for review.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-2 mt-4">
            {onNext && (
              <button className="btn btn-primary" type="button" onClick={onNext}>
                Next theme
              </button>
            )}
            <button className="btn btn-outline-primary" type="button" onClick={practiseAgain}>
              Review this theme
            </button>
            <button className="btn btn-outline-secondary" type="button" onClick={onExit}>
              All themes
            </button>
          </div>
        </div>
      </section>
    );

  const toDutch = session.phase === 'to-dutch';
  const prompt = toDutch ? entry.portuguese : entry.dutch;
  const expected = toDutch ? entry.dutch : entry.portuguese;
  const progress =
    ((session.index + (toDutch ? 0 : session.queue.length)) / (session.queue.length * 2)) * 100;
  function submit(event: FormEvent) {
    event.preventDefault();
    if (session!.feedback) return;
    if (!answer.trim()) {
      setInvalid(true);
      return;
    }
    const correct = isAcceptedAnswer(answer, [expected]);
    updateWordLists((current) => answerWordList(current, list.id, correct ? 'correct' : 'wrong'));
    if (correct) {
      if (!toDutch && session!.index === session!.queue.length - 1)
        completeActivity(`word-list:${list.id}`, 25);
      clearInput();
    }
  }
  return (
    <section className="card border-0 shadow-sm word-list-drill">
      <div className="card-body p-4 p-md-5">
        <div className="d-flex flex-wrap justify-content-between gap-2 align-items-center mb-3">
          <span className={`badge ${toDutch ? 'text-bg-primary' : 'text-bg-success'}`}>
            {toDutch ? 'Round 1 · Portuguese → Dutch' : 'Round 2 · Dutch → Portuguese'}
          </span>
          <button className="btn btn-sm btn-outline-secondary" type="button" onClick={onExit}>
            Save & return to themes
          </button>
        </div>
        <p className="small text-secondary mb-2" aria-live="polite">
          Card {session.index + 1} of {session.queue.length} · progress saved automatically
        </p>
        <div
          className="progress mb-4"
          role="progressbar"
          aria-label="Theme progress"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        {word?.review && (
          <div className="alert alert-info small">
            <i className="bi bi-arrow-repeat me-2" aria-hidden="true" />
            Review from <strong>{source?.title}</strong> · past mistakes get priority.
          </div>
        )}
        <form onSubmit={submit} noValidate>
          <div className="text-center mb-4">
            <p className="text-secondary small fw-semibold">{toDutch ? 'Portuguese' : 'Dutch'}</p>
            <h2 className="word-list-prompt" lang={toDutch ? 'pt-BR' : 'nl'}>
              {prompt}
            </h2>
          </div>
          {session.feedback ? (
            <div className="alert alert-warning" role="status">
              <strong>
                {session.feedback === 'wrong' ? 'Not quite. The answer is: ' : 'The answer is: '}
              </strong>
              <span lang={toDutch ? 'nl' : 'pt-BR'}>{expected}</span>
              <span className="d-block small mt-2">
                {word?.review
                  ? 'Try this review word again. Your theme position is kept.'
                  : 'Restart this round from the first word. Earlier completed rounds are kept.'}
              </span>
            </div>
          ) : (
            <div className="mx-auto word-list-answer">
              <label className="form-label fw-semibold" htmlFor="wordListAnswer">
                {toDutch
                  ? 'Type the Dutch translation (include de / het)'
                  : 'Type the Portuguese translation'}
              </label>
              <input
                ref={inputRef}
                id="wordListAnswer"
                className={`form-control form-control-lg ${invalid ? 'is-invalid' : ''}`}
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value);
                  setInvalid(false);
                }}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                lang={toDutch ? 'nl' : 'pt-BR'}
                aria-invalid={invalid}
                aria-describedby={invalid ? 'wordListError' : undefined}
              />
              {invalid && (
                <p id="wordListError" className="text-danger small mt-2" role="alert">
                  Enter an answer first.
                </p>
              )}
            </div>
          )}
          <div className="d-flex justify-content-center flex-wrap gap-2 mt-4">
            {session.feedback ? (
              <button
                ref={retryRef}
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  updateWordLists((current) => retryWordList(current, list.id));
                  clearInput();
                }}
              >
                {word?.review ? 'Try review word again' : 'Restart this round'}
              </button>
            ) : (
              <>
                <button className="btn btn-primary" type="submit">
                  Check answer
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() =>
                    updateWordLists((current) => answerWordList(current, list.id, 'revealed'))
                  }
                >
                  I don’t know · show translation
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

export function WordListsPractice() {
  const { state, updateWordLists } = useAppState();
  const { customLists, themes } = state.wordLists;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const allLists = [...starterWordLists, ...customLists];
  function selectList(list: WordList) {
    updateWordLists((current) => startWordList(current, list, allLists));
    setSelectedList(list);
  }
  function matches(list: WordList) {
    const theme = themes[list.id];
    const status = theme?.completions ? 'completed' : theme?.session ? 'started' : 'new';
    return (
      (statusFilter === 'all' || statusFilter === status) &&
      normalizeAnswer(
        [
          list.title,
          list.description,
          ...list.entries.flatMap((entry) => [entry.dutch, entry.portuguese]),
        ].join(' '),
      ).includes(normalizeAnswer(search))
    );
  }
  const [selectedList, setSelectedList] = useState<WordList | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [draftEntries, setDraftEntries] = useState<DraftEntry[]>([
    { dutch: '', portuguese: '' },
    { dutch: '', portuguese: '' },
  ]);
  const [creatorError, setCreatorError] = useState('');

  function updateDraftEntry(index: number, field: keyof DraftEntry, value: string) {
    setDraftEntries((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [field]: value } : entry,
      ),
    );
  }

  function createList(event: FormEvent) {
    event.preventDefault();
    const entries: WordListEntry[] = draftEntries
      .map((entry, index) => ({
        id: `word-${index + 1}`,
        dutch: entry.dutch.trim(),
        portuguese: entry.portuguese.trim(),
      }))
      .filter((entry) => entry.dutch && entry.portuguese);
    if (!title.trim() || !entries.length) {
      setCreatorError('Give the list a name and add at least one complete Dutch–Portuguese pair.');
      return;
    }
    const list: WordList = {
      id: makeCustomId(),
      title: title.trim().slice(0, 80),
      description: description.trim().slice(0, 180) || 'Your custom word list.',
      entries,
      kind: 'custom',
    };
    updateWordLists((current) =>
      startWordList({ ...current, customLists: [...current.customLists, list] }, list, [
        ...allLists,
        list,
      ]),
    );
    setTitle('');
    setDescription('');
    setDraftEntries([
      { dutch: '', portuguese: '' },
      { dutch: '', portuguese: '' },
    ]);
    setCreatorError('');
    setShowCreator(false);
    setSelectedList(list);
  }

  function deleteList(list: WordList) {
    if (
      !window.confirm(
        `Delete “${list.title}”? This removes the custom list and its word-list progress.`,
      )
    )
      return;
    updateWordLists((current) => removeWordList(current, list.id));
  }

  if (selectedList) {
    return (
      <div className="container py-4 py-lg-5">
        <span className="eyebrow">Word-list drill</span>
        <h1 className="display-6 fw-bold">{selectedList.title}</h1>
        <p className="text-secondary mb-4">{selectedList.description}</p>
        <WordListDrill
          key={selectedList.id}
          list={selectedList}
          onExit={() => setSelectedList(null)}
          onNext={
            allLists.some((list) => list.id !== selectedList.id && !themes[list.id]?.completions)
              ? () => {
                  const next = allLists.find(
                    (list) => list.id !== selectedList.id && !themes[list.id]?.completions,
                  );
                  if (next) selectList(next);
                }
              : undefined
          }
        />
      </div>
    );
  }

  const visibleLists = allLists.filter(matches);

  return (
    <div className="container py-4 py-lg-5">
      <span className="eyebrow">Word-list drill</span>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <h1 className="display-6 fw-bold mb-1">Learn a whole word list</h1>
          <p className="text-secondary mb-0">
            Portuguese → Dutch, then Dutch → Portuguese. Reveal or miss a theme word, and restart
            that round.
          </p>
        </div>
        <button
          className="btn btn-primary align-self-start"
          type="button"
          onClick={() => setShowCreator((current) => !current)}
        >
          <i className="bi bi-plus-lg me-1" aria-hidden="true" />
          {showCreator ? 'Close creator' : 'Create custom list'}
        </button>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap gap-3 mb-3">
            <span>
              <strong>{allLists.length}</strong> themes
            </span>
            <span>
              <strong>{allLists.reduce((sum, list) => sum + list.entries.length, 0)}</strong> word
              pairs
            </span>
            <span className="text-success">
              <strong>{allLists.filter((list) => themes[list.id]?.completions).length}</strong>{' '}
              completed
            </span>
          </div>
          <p className="small text-secondary">
            Learn the pairs from the study sheet on each card. Finish both rounds to complete a
            theme. Up to 3 words from earlier themes appear in each round, prioritising words you
            missed most. Progress, custom lists, and mistakes are saved in this browser and included
            in Settings → Export progress.
          </p>
          <div className="row g-3">
            <div className="col-md-8">
              <label htmlFor="themeSearch" className="form-label">
                Find a theme or word
              </label>
              <input
                id="themeSearch"
                className="form-control"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="e.g. animals, fiets, cozinha"
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="themeStatus" className="form-label">
                Show themes
              </label>
              <select
                id="themeStatus"
                className="form-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All themes</option>
                <option value="new">Not started</option>
                <option value="started">In progress</option>
                <option value="completed">Completed · ready to review</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {!visibleLists.length && (
        <p role="status" className="alert alert-info">
          No themes match this search. Try another word or status.
        </p>
      )}
      {showCreator && (
        <section className="card border-0 shadow-sm mb-5">
          <div className="card-body p-4">
            <h2 className="h4 fw-bold">Create a custom list</h2>
            <p className="text-secondary small">
              Lists stay in this browser until you delete them.
            </p>
            <form onSubmit={createList} noValidate>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold" htmlFor="customListTitle">
                    List name
                  </label>
                  <input
                    id="customListTitle"
                    className="form-control"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={80}
                    placeholder="e.g. Words from lesson 3"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" htmlFor="customListDescription">
                    Description <span className="fw-normal text-secondary">(optional)</span>
                  </label>
                  <input
                    id="customListDescription"
                    className="form-control"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={180}
                    placeholder="What are these words about?"
                  />
                </div>
              </div>
              <div className="d-grid gap-2">
                {draftEntries.map((entry, index) => (
                  <div className="row g-2 align-items-end" key={index}>
                    <div className="col-md-5">
                      <label
                        className="form-label small fw-semibold mb-1"
                        htmlFor={`customDutch${index}`}
                      >
                        Dutch
                      </label>
                      <input
                        id={`customDutch${index}`}
                        className="form-control"
                        value={entry.dutch}
                        maxLength={120}
                        onChange={(event) => updateDraftEntry(index, 'dutch', event.target.value)}
                        placeholder="e.g. de tafel"
                      />
                    </div>
                    <div className="col-md-5">
                      <label
                        className="form-label small fw-semibold mb-1"
                        htmlFor={`customPortuguese${index}`}
                      >
                        Portuguese
                      </label>
                      <input
                        id={`customPortuguese${index}`}
                        className="form-control"
                        value={entry.portuguese}
                        maxLength={120}
                        onChange={(event) =>
                          updateDraftEntry(index, 'portuguese', event.target.value)
                        }
                        placeholder="e.g. a mesa"
                      />
                    </div>
                    <div className="col-md-2">
                      <button
                        className="btn btn-outline-danger w-100"
                        type="button"
                        onClick={() =>
                          setDraftEntries((current) =>
                            current.length > 1
                              ? current.filter((_, entryIndex) => entryIndex !== index)
                              : current,
                          )
                        }
                        disabled={draftEntries.length === 1}
                        aria-label={`Remove word ${index + 1}`}
                      >
                        <i className="bi bi-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {creatorError && <p className="text-danger small mt-3 mb-0">{creatorError}</p>}
              <div className="d-flex flex-wrap gap-2 mt-4">
                <button
                  className="btn btn-outline-primary"
                  type="button"
                  disabled={draftEntries.length >= 200}
                  onClick={() =>
                    setDraftEntries((current) => [...current, { dutch: '', portuguese: '' }])
                  }
                >
                  <i className="bi bi-plus-lg me-1" aria-hidden="true" />
                  Add word
                </button>
                <button className="btn btn-primary" type="submit">
                  Save and practise
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      <section aria-labelledby="starterListsHeading">
        <h2 id="starterListsHeading" className="h3 fw-bold mb-3">
          Starter themes
        </h2>
        <div className="row g-4">
          {visibleLists
            .filter((list) => list.kind === 'starter')
            .map((list) => (
              <WordListCard
                key={list.id}
                list={list}
                progress={themes[list.id]}
                onSelect={() => selectList(list)}
              />
            ))}
        </div>
      </section>

      <section className="mt-5" aria-labelledby="customListsHeading">
        <h2 id="customListsHeading" className="h3 fw-bold mb-3">
          Your custom lists
        </h2>
        {customLists.length ? (
          <div className="row g-4">
            {customLists.filter(matches).map((list) => (
              <WordListCard
                key={list.id}
                list={list}
                progress={themes[list.id]}
                onSelect={() => selectList(list)}
                onDelete={() => deleteList(list)}
              />
            ))}
          </div>
        ) : (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 text-secondary">
              Create a list for words from your own lessons, notes, or daily life.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function WordListCard({
  list,
  onSelect,
  onDelete,
  progress,
}: {
  list: WordList;
  onSelect: () => void;
  onDelete?: () => void;
  progress?: WordListThemeProgress;
}) {
  return (
    <div className="col-12 col-md-6 col-xl-4">
      <article className="card border-0 shadow-sm h-100 word-list-card">
        <div className="card-body p-4 d-flex flex-column">
          <div className="d-flex justify-content-between gap-2 align-items-start">
            <h3 className="h5 fw-bold mb-2">{list.title}</h3>
            <span className="badge text-bg-light text-secondary">{list.entries.length} words</span>
          </div>
          <p className="text-secondary small mb-3">{list.description}</p>
          <p
            className={`small fw-semibold ${progress?.completions ? 'text-success' : 'text-secondary'}`}
          >
            {progress?.completions
              ? `✓ Completed · ${progress.completions} successful run${progress.completions === 1 ? '' : 's'}`
              : progress?.session
                ? 'In progress · resume where you stopped'
                : 'Not started'}
            {progress?.lastCompletedAt && (
              <span className="d-block fw-normal">
                Last completed: {new Date(progress.lastCompletedAt).toLocaleDateString()}
              </span>
            )}
          </p>
          <details className="small mb-4">
            <summary className="text-primary">
              Study sheet · {list.entries.length} translations
            </summary>
            <div className="word-list-sheet table-responsive mt-2">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Dutch</th>
                    <th>Portuguese</th>
                  </tr>
                </thead>
                <tbody>
                  {list.entries.map((entry) => (
                    <tr key={entry.id}>
                      <td lang="nl">{entry.dutch}</td>
                      <td lang="pt-BR">{entry.portuguese}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <div className="mt-auto d-flex flex-wrap gap-2">
            <button className="btn btn-primary" type="button" onClick={onSelect}>
              {progress?.session && progress.session.phase !== 'complete'
                ? 'Continue'
                : progress?.completions
                  ? 'Review theme'
                  : 'Start drill'}
            </button>
            {onDelete && (
              <button className="btn btn-outline-danger" type="button" onClick={onDelete}>
                Delete
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
