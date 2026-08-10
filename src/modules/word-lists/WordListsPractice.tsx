import { useEffect, useRef, useState, type FormEvent } from 'react';
import { isAcceptedAnswer } from '../../services/answerNormalization';
import type { WordList, WordListEntry } from './wordListData';
import { starterWordLists } from './wordListData';
import { loadCustomWordLists, saveCustomWordLists } from './wordListStorage';

type DrillPhase = 'recognize' | 'produce' | 'complete';
type ProductionFeedback = 'wrong' | 'revealed' | null;

interface DraftEntry {
  dutch: string;
  portuguese: string;
}

function makeCustomId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? `custom-${crypto.randomUUID()}`
    : `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function WordListDrill({ list, onExit }: { list: WordList; onExit: () => void }) {
  const [phase, setPhase] = useState<DrillPhase>('recognize');
  const [index, setIndex] = useState(0);
  const [translationShown, setTranslationShown] = useState(false);
  const [answer, setAnswer] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [productionFeedback, setProductionFeedback] = useState<ProductionFeedback>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const entry = list.entries[index];
  const total = list.entries.length;

  useEffect(() => {
    if (phase === 'produce' && !productionFeedback) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [index, phase, productionFeedback]);

  function resetRecognition() {
    setIndex(0);
    setTranslationShown(false);
  }

  function advanceRecognition() {
    if (index === total - 1) {
      setPhase('produce');
      setIndex(0);
      setTranslationShown(false);
      return;
    }
    setIndex((current) => current + 1);
  }

  function resetProduction() {
    setIndex(0);
    setAnswer('');
    setInvalid(false);
    setProductionFeedback(null);
  }

  function advanceProduction() {
    if (index === total - 1) {
      setPhase('complete');
      return;
    }
    setIndex((current) => current + 1);
    setAnswer('');
    setInvalid(false);
  }

  function submitProduction(event: FormEvent) {
    event.preventDefault();
    if (productionFeedback) return;
    if (!answer.trim()) {
      setInvalid(true);
      return;
    }
    if (isAcceptedAnswer(answer, [entry.dutch])) {
      advanceProduction();
      return;
    }
    setProductionFeedback('wrong');
  }

  function practiceAgain() {
    setPhase('recognize');
    resetRecognition();
    setAnswer('');
    setInvalid(false);
    setProductionFeedback(null);
  }

  if (phase === 'complete') {
    return (
      <section className="card border-0 shadow-sm word-list-drill">
        <div className="card-body p-4 p-md-5 text-center">
          <div className="word-list-complete-icon" aria-hidden="true">
            ✓
          </div>
          <h2 className="h3 fw-bold mt-3">List complete</h2>
          <p className="text-secondary mb-4">
            You recalled all {total} words in both directions without restarting the final run.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-2">
            <button className="btn btn-primary" type="button" onClick={practiceAgain}>
              Practise this list again
            </button>
            <button className="btn btn-outline-secondary" type="button" onClick={onExit}>
              Choose another list
            </button>
          </div>
        </div>
      </section>
    );
  }

  const recognition = phase === 'recognize';
  const progress = ((index + (recognition ? 0 : total)) / (total * 2)) * 100;

  return (
    <section className="card border-0 shadow-sm word-list-drill">
      <div className="card-body p-4 p-md-5">
        <div className="d-flex flex-wrap justify-content-between gap-2 align-items-center mb-4">
          <div>
            <span className={`badge ${recognition ? 'text-bg-primary' : 'text-bg-success'}`}>
              {recognition ? 'Round 1 of 2 · Recall Portuguese' : 'Round 2 of 2 · Type Dutch'}
            </span>
            <span className="text-secondary small ms-2">
              {index + 1} / {total}
            </span>
          </div>
          <button className="btn btn-sm btn-outline-secondary" type="button" onClick={onExit}>
            Change list
          </button>
        </div>
        <div className="progress mb-4" aria-label="Word-list drill progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {recognition ? (
          <div className="text-center">
            <p className="text-secondary text-uppercase small fw-semibold mb-2">Dutch word</p>
            <p className="word-list-prompt" lang="nl">
              {entry.dutch}
            </p>
            {translationShown && (
              <div className="alert alert-warning mt-4 mb-0" role="status">
                <strong>Portuguese:</strong> {entry.portuguese}
                <span className="d-block small mt-1">Seeing the answer restarts this round.</span>
              </div>
            )}
            <div className="d-flex justify-content-center flex-wrap gap-2 mt-4">
              {translationShown ? (
                <button className="btn btn-primary" type="button" onClick={resetRecognition}>
                  Start this round again
                </button>
              ) : (
                <>
                  <button className="btn btn-primary" type="button" onClick={advanceRecognition}>
                    I know it <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setTranslationShown(true)}
                  >
                    Show Portuguese
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={submitProduction} noValidate>
            <div className="text-center">
              <p className="text-secondary text-uppercase small fw-semibold mb-2">
                Portuguese word
              </p>
              <p className="word-list-prompt">{entry.portuguese}</p>
              {productionFeedback && (
                <div className="alert alert-warning text-start mt-4" role="status">
                  <strong>The answer is:</strong> <span lang="nl">{entry.dutch}</span>
                  <span className="d-block small mt-1">Seeing the answer restarts this round.</span>
                </div>
              )}
            </div>
            {!productionFeedback && (
              <div className="mx-auto word-list-answer">
                <label className="form-label fw-semibold" htmlFor="wordListAnswer">
                  Type the Dutch word
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
                  spellCheck={false}
                  placeholder="Type the complete Dutch word"
                />
                {invalid && <p className="text-danger small mt-2 mb-0">Enter an answer first.</p>}
              </div>
            )}
            <div className="d-flex justify-content-center flex-wrap gap-2 mt-4">
              {productionFeedback ? (
                <button className="btn btn-primary" type="button" onClick={resetProduction}>
                  Start this round again
                </button>
              ) : (
                <>
                  <button className="btn btn-success" type="submit">
                    Check answer
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setProductionFeedback('revealed')}
                  >
                    Show Dutch answer
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export function WordListsPractice() {
  const [customLists, setCustomLists] = useState<WordList[]>(loadCustomWordLists);
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
    const next = [...customLists, list];
    setCustomLists(next);
    saveCustomWordLists(next);
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
    if (!window.confirm(`Delete “${list.title}”? This only removes the saved custom list.`)) return;
    const next = customLists.filter((candidate) => candidate.id !== list.id);
    setCustomLists(next);
    saveCustomWordLists(next);
  }

  if (selectedList) {
    return (
      <div className="container py-4 py-lg-5">
        <span className="eyebrow">Word-list drill</span>
        <h1 className="display-6 fw-bold">{selectedList.title}</h1>
        <p className="text-secondary mb-4">{selectedList.description}</p>
        <WordListDrill list={selectedList} onExit={() => setSelectedList(null)} />
      </div>
    );
  }

  const allLists = [...starterWordLists, ...customLists];

  return (
    <div className="container py-4 py-lg-5">
      <span className="eyebrow">Word-list drill</span>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-4">
        <div>
          <h1 className="display-6 fw-bold mb-1">Learn a whole word list</h1>
          <p className="text-secondary mb-0">
            Recall every Dutch–Portuguese pair in order. Reveal or miss one, and restart that round.
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
          {allLists
            .filter((list) => list.kind === 'starter')
            .map((list) => (
              <WordListCard key={list.id} list={list} onSelect={() => setSelectedList(list)} />
            ))}
        </div>
      </section>

      <section className="mt-5" aria-labelledby="customListsHeading">
        <h2 id="customListsHeading" className="h3 fw-bold mb-3">
          Your custom lists
        </h2>
        {customLists.length ? (
          <div className="row g-4">
            {customLists.map((list) => (
              <WordListCard
                key={list.id}
                list={list}
                onSelect={() => setSelectedList(list)}
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
}: {
  list: WordList;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="col-12 col-md-6 col-xl-4">
      <article className="card border-0 shadow-sm h-100 word-list-card">
        <div className="card-body p-4 d-flex flex-column">
          <div className="d-flex justify-content-between gap-2 align-items-start">
            <h3 className="h5 fw-bold mb-2">{list.title}</h3>
            <span className="badge text-bg-light text-secondary">{list.entries.length} words</span>
          </div>
          <p className="text-secondary small mb-4">{list.description}</p>
          <div className="mt-auto d-flex flex-wrap gap-2">
            <button className="btn btn-primary" type="button" onClick={onSelect}>
              Start drill
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
