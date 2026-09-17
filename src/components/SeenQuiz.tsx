"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SunnySky } from "./SunnySky";
import { ResultsPage } from "./ResultsPage";
import { startSession, syncSession } from "@/lib/client-save";
import type { AnswerKind, AnswerPair } from "@/lib/store";

export type { AnswerPair };

type Choice = {
  label: string;
  runaway?: boolean;
  roast?: boolean;
};

type QuizItem = {
  question: string;
  hint: string;
  choices: Choice[];
  reactions: Record<string, string>;
};

export const QUIZ: QuizItem[] = [
  {
    question: "Why do you leave my messages on seen?",
    hint: "Mean ones sit still. Soft one is Olympic-level.",
    choices: [
      { label: "You're ugly, so… no rush", roast: true },
      { label: "I don't want to talk to you", roast: true },
      { label: "You're kinda creepy tbh", roast: true },
      { label: "Your texts drain my battery AND my soul", roast: true },
      { label: "I actually like talking to you", runaway: true },
    ],
    reactions: {
      "You're ugly, so… no rush": "Ouch. Sun went behind a cloud for a sec.",
      "I don't want to talk to you": "Direct. Brutal. Iconic.",
      "You're kinda creepy tbh": "Noted. Deleting my 47 good mornings.",
      "Your texts drain my battery AND my soul": "Wow okay poet of pain.",
      "I actually like talking to you": "Caught you being soft. Suspicious.",
    },
  },
  {
    question: "Why reply after 24+ hours like a government office?",
    hint: "The nice button has trust issues. And cardio.",
    choices: [
      { label: "Watching you wait is funny", roast: true },
      { label: "You're not that important, sorry", roast: true },
      { label: "I reply when I'm bored of better people", roast: true },
      { label: "My phone auto-mutes your vibe", roast: true },
      { label: "Sorry, I got genuinely busy", runaway: true },
    ],
    reactions: {
      "Watching you wait is funny": "Villain era unlocked.",
      "You're not that important, sorry": "The 'sorry' is doing heavy lifting.",
      "I reply when I'm bored of better people": "Ranking system discovered.",
      "My phone auto-mutes your vibe": "Technology against him. Harsh.",
      "Sorry, I got genuinely busy": "A rare honest moment. Plot twist incoming.",
    },
  },
  {
    question: "Why ignore me mid-conversation?",
    hint: "Try catching soft. Or just type your crimes in Others.",
    choices: [
      { label: "You talk too much", roast: true },
      { label: "You're exhausting, respectfully", roast: true },
      { label: "Main character here. You're an NPC", roast: true },
      { label: "I soft-block you emotionally", roast: true },
      { label: "I'll try to reply faster", runaway: true },
    ],
    reactions: {
      "You talk too much": "Shutting up forever. Or for 5 minutes.",
      "You're exhausting, respectfully": "The respectfully made it worse.",
      "Main character here. You're an NPC": "Quest failed: be interesting.",
      "I soft-block you emotionally": "WiFi connected, heart disconnected.",
      "I'll try to reply faster": "Promises, promises.",
    },
  },
  {
    question: "If you saw the message… why the silent treatment?",
    hint: "Soft answer = speedrun. Good luck.",
    choices: [
      { label: "I enjoy the power", roast: true },
      { label: "You're clingy and it's weird", roast: true },
      { label: "I hoped you'd get the hint", roast: true },
      { label: "You're mid and I'm busy glowing", roast: true },
      { label: "I didn't mean to hurt you", runaway: true },
    ],
    reactions: {
      "I enjoy the power": "Tiny dictator energy. Cute. Scary.",
      "You're clingy and it's weird": "Attachment issues? Never heard of her.",
      "I hoped you'd get the hint": "Hints received. Heart returned to sender.",
      "You're mid and I'm busy glowing": "SPF 100 ego. Impressive.",
      "I didn't mean to hurt you": "Accidentally savage still counts.",
    },
  },
  {
    question: "When you finally reply, why act like nothing happened?",
    hint: "Last soft button. It knows parkour.",
    choices: [
      { label: "Because you overreact, always", roast: true },
      { label: "I don't owe you an explanation", roast: true },
      { label: "You're lucky I replied at all", roast: true },
      { label: "Drama is your personality, not mine", roast: true },
      { label: "Okay fine… I miss talking to you", runaway: true },
    ],
    reactions: {
      "Because you overreact, always": "Gaslight? In this economy?",
      "I don't owe you an explanation": "Constitutional right to be cold.",
      "You're lucky I replied at all": "Blessed and stressed.",
      "Drama is your personality, not mine": "Projection speedrun any%",
      "Okay fine… I miss talking to you": "AWW. Now explain yourself.",
    },
  },
];

const REVENGE_CHOICES = [
  "Of course",
  "As you wish",
  "Do it. I dare you",
  "Please, you'd never last",
  "Go ahead, be miserable twin",
];

const WHY_NOT_SAME_CHOICES = [
  "Because you're not me",
  "Because double standards are my personality",
  "Because I said so",
  "Because you'd look desperate doing it",
  "Because rules for thee, not for me",
];

type Phase =
  | "intro"
  | "quiz"
  | "soft-reason"
  | "react"
  | "revenge"
  | "done";

function OtherInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your unhinged truth…",
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}) {
  return (
    <div className="animate-slide-option mt-3 rounded-2xl border border-ink/15 bg-paper/95 p-3 shadow-[0_8px_24px_rgba(26,42,58,0.08)]">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-soft">
        Others
      </p>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border border-ink/10 bg-white/80 px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/50 focus:border-sun-hot"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          className="shrink-0 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export function SeenQuiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerPair[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [reaction, setReaction] = useState("");
  const [shake, setShake] = useState(false);
  const [floatText, setFloatText] = useState<string | null>(null);
  const [dodgeCount, setDodgeCount] = useState(0);
  const [totalDodges, setTotalDodges] = useState(0);
  const [runPos, setRunPos] = useState<{ x: number; y: number } | null>(null);
  const [otherText, setOtherText] = useState("");
  const [softCaughtLabel, setSoftCaughtLabel] = useState("");
  const [pendingSoftAnswer, setPendingSoftAnswer] = useState("");
  const [starting, setStarting] = useState(false);
  const [softFrozen, setSoftFrozen] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const runBtnRef = useRef<HTMLButtonElement>(null);
  const catchArmedRef = useRef(false);
  const lastDodgeAt = useRef(0);
  const softFrozenRef = useRef(false);
  const loveFreezeUsedRef = useRef(false);

  const item = QUIZ[step];
  const quizProgress = Math.min(answers.length / (QUIZ.length + 1), 1);
  const roastScale = Math.min(1 + dodgeCount * 0.06, 1.28);

  useEffect(() => {
    setRunPos(null);
    setDodgeCount(0);
    setOtherText("");
    catchArmedRef.current = false;
    // Only reset freeze when starting a new quiz question
    if (phase === "quiz") {
      setSoftFrozen(false);
      softFrozenRef.current = false;
      loveFreezeUsedRef.current = false;
    }
  }, [step, phase]);

  // Persist every answer (including soft / positive) as she goes
  useEffect(() => {
    if (!sessionId) return;
    if (answers.length === 0 && phase !== "done") return;
    void syncSession(sessionId, {
      answers,
      dodge_count: totalDodges,
      completed: phase === "done",
    });
  }, [answers, totalDodges, sessionId, phase]);

  const moveRunaway = useCallback(
    (force = false) => {
      if (softFrozenRef.current) return;
      const now = Date.now();
      if (!force && now - lastDodgeAt.current < 40) return;
      lastDodgeAt.current = now;

      const stage = stageRef.current;
      const btn = runBtnRef.current;
      if (!stage || !btn) return;

      const stageRect = stage.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      const pad = 4;
      const maxX = Math.max(pad, stageRect.width - btnRect.width - pad);
      const maxY = Math.max(pad, stageRect.height - btnRect.height - pad);

      let nextX = Math.random() * maxX;
      let nextY = Math.random() * maxY;

      if (runPos) {
        nextX =
          nextX < maxX / 2
            ? maxX * (0.55 + Math.random() * 0.4)
            : maxX * Math.random() * 0.4;
        nextY =
          nextY < maxY / 2
            ? maxY * (0.55 + Math.random() * 0.4)
            : maxY * Math.random() * 0.4;
      }

      setRunPos({ x: nextX, y: nextY });
      setDodgeCount((c) => c + 1);
      setTotalDodges((c) => c + 1);
      setFloatText(
        ["TOO SLOW ⚡", "Nope 🏃", "Missed 😌", "Parkour!", "Catch air"][
          Math.floor(Math.random() * 5)
        ],
      );
      window.setTimeout(() => setFloatText(null), 700);

      catchArmedRef.current = false;
      window.setTimeout(() => {
        catchArmedRef.current = true;
      }, 70);
      window.setTimeout(() => {
        catchArmedRef.current = false;
      }, 320);
    },
    [runPos],
  );

  const giveUpAndLove = () => {
    softFrozenRef.current = true;
    loveFreezeUsedRef.current = true;
    setSoftFrozen(true);
    catchArmedRef.current = true;
    // Park soft button in the middle so she can tap it
    const stage = stageRef.current;
    const btn = runBtnRef.current;
    if (stage && btn) {
      const stageRect = stage.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setRunPos({
        x: Math.max(8, (stageRect.width - btnRect.width) / 2),
        y: Math.max(28, (stageRect.height - btnRect.height) / 2),
      });
    } else {
      setRunPos({ x: 40, y: 55 });
    }
    setFloatText("Frozen 💘 tap soft");
    window.setTimeout(() => setFloatText(null), 900);

    // Save which question she tapped "I love you" on
    setAnswers((prev) => [
      ...prev,
      {
        question: item.question,
        answer: "I love you (gave up catching the soft button)",
        kind: "i-love-you",
      },
    ]);
  };

  const pushAnswer = (
    question: string,
    answer: string,
    kind: AnswerKind,
    opts?: { roastShake?: boolean; reaction?: string },
  ) => {
    setAnswers((prev) => [...prev, { question, answer, kind }]);
    setReaction(
      opts?.reaction ??
        item?.reactions[answer] ??
        (kind === "other"
          ? "Custom chaos unlocked."
          : "Savage. The sun approved."),
    );
    if (opts?.roastShake) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
    setPhase("react");
  };

  const pickChoice = (answer: string, kind: AnswerKind) => {
    pushAnswer(item.question, answer, kind, {
      roastShake: kind === "roast" || kind === "other",
    });
  };

  const catchSoft = (label: string) => {
    if (!softFrozenRef.current && !catchArmedRef.current) {
      moveRunaway(true);
      return;
    }

    const usedLoveFreeze = loveFreezeUsedRef.current;
    setSoftCaughtLabel(label);
    setPendingSoftAnswer(label);

    // Save the soft option she clicked after I love you (or normal catch)
    setAnswers((prev) => [
      ...prev,
      {
        question: item.question,
        answer: label,
        kind: "soft",
        after_i_love_you: usedLoveFreeze || undefined,
      },
    ]);

    setOtherText("");
    setPhase("soft-reason");
  };

  const submitSoftReason = (reason: string, reasonKind: AnswerKind) => {
    const soft = pendingSoftAnswer;
    const usedLoveFreeze = loveFreezeUsedRef.current;
    setAnswers((prev) => [
      ...prev,
      {
        question: `Why shouldn't I do the same after you said “${soft}”?`,
        answer: reason,
        kind: reasonKind,
        after_i_love_you: usedLoveFreeze || undefined,
      },
    ]);
    setReaction(`Soft caught… then you said: “${reason}”. Bold of you.`);
    setPhase("react");
  };

  const continueAfterReact = () => {
    if (step + 1 >= QUIZ.length) {
      setOtherText("");
      setPhase("revenge");
      return;
    }
    setStep((s) => s + 1);
    setPhase("quiz");
  };

  const REVENGE_REACTIONS: Record<string, string> = {
    "Of course": "Noted. Leaving YOU on seen starting… now.",
    "As you wish": "Princess Bride energy. Still getting ignored.",
    "Do it. I dare you": "Oh we are so back. Petty olympics.",
    "Please, you'd never last": "Watch me. Stopwatch ready.",
    "Go ahead, be miserable twin": "Matching energy unlocked.",
  };

  const pickRevenge = (answer: string, kind: AnswerKind) => {
    setAnswers((prev) => [
      ...prev,
      {
        question: "From now I will also do the same. Should I?",
        answer,
        kind,
      },
    ]);
    setReaction(
      REVENGE_REACTIONS[answer] ??
        `You typed “${answer}”. Screenshot for the court.`,
    );
    setShake(true);
    setTimeout(() => setShake(false), 400);
    setPhase("react");
  };

  const beginQuiz = async () => {
    setStarting(true);
    const id = await startSession();
    setSessionId(id);
    setStarting(false);
    setPhase("quiz");
  };

  if (phase === "done") {
    return (
      <ResultsPage
        answers={answers}
        dodgeCount={totalDodges}
        sessionId={sessionId}
      />
    );
  }

  if (phase === "intro") {
    return (
      <div className="relative flex min-h-dvh flex-col">
        <SunnySky />
        <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-10 text-center">
          <p className="animate-bounce-in font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Seen™
          </p>
          <p className="animate-pop-in mt-3 max-w-sm text-balance text-lg text-ink-soft">
            Sunny interrogation for chronic{" "}
            <span className="font-semibold text-roast">seen</span> committers.
            Soft answers run. Fast.
          </p>
          <button
            type="button"
            disabled={starting}
            onClick={() => void beginQuiz()}
            className="animate-pulse-cta mt-10 rounded-2xl bg-sun-hot px-8 py-4 text-lg font-bold text-ink disabled:opacity-70"
          >
            {starting ? "Loading…" : "Okay fine, start ☀️"}
          </button>
        </main>
      </div>
    );
  }

  if (phase === "soft-reason") {
    return (
      <div className="relative flex min-h-dvh flex-col">
        <SunnySky />
        <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-10">
          <div className="animate-bounce-in text-center">
            <p className="text-5xl" aria-hidden>
              🪤
            </p>
            <h1 className="font-[family-name:var(--font-display)] mt-4 text-balance text-2xl font-semibold text-ink sm:text-3xl">
              You caught the soft answer.
            </h1>
            <p className="mt-2 text-sm text-ink-soft">
              You said:{" "}
              <span className="font-semibold text-leaf">
                &ldquo;{softCaughtLabel}&rdquo;
              </span>
            </p>
            <h2 className="font-[family-name:var(--font-display)] mt-6 text-balance text-xl font-semibold text-roast sm:text-2xl">
              Why shouldn&apos;t I do the same to you?
            </h2>
          </div>

          <div className="mt-7 flex flex-col gap-3">
            {WHY_NOT_SAME_CHOICES.map((choice, i) => (
              <button
                key={choice}
                type="button"
                onClick={() => submitSoftReason(choice, "soft-reason")}
                className="animate-slide-option rounded-2xl border border-ink/10 bg-paper/95 px-5 py-3.5 text-left text-base font-semibold text-ink shadow-[0_8px_24px_rgba(26,42,58,0.1)]"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="mr-2 text-roast">▸</span>
                {choice}
              </button>
            ))}
          </div>

          <OtherInput
            value={otherText}
            onChange={setOtherText}
            onSubmit={() => {
              if (otherText.trim())
                submitSoftReason(otherText.trim(), "other");
            }}
            placeholder="Or type why I'm not allowed to match energy…"
          />
        </main>
      </div>
    );
  }

  if (phase === "revenge") {
    return (
      <div className="relative flex min-h-dvh flex-col">
        <SunnySky />
        <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-10">
          <div className="animate-bounce-in text-center">
            <p className="text-5xl" aria-hidden>
              🪞
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-roast">
              Final boss
            </p>
            <h1 className="font-[family-name:var(--font-display)] mt-3 text-balance text-2xl font-semibold text-ink sm:text-3xl">
              From now I will also do the same.
            </h1>
            <h2 className="font-[family-name:var(--font-display)] mt-2 text-balance text-xl font-semibold text-roast sm:text-2xl">
              Should I?
            </h2>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {REVENGE_CHOICES.map((choice, i) => (
              <button
                key={choice}
                type="button"
                onClick={() => pickRevenge(choice, "revenge")}
                className="animate-slide-option rounded-2xl border border-ink/10 bg-paper/95 px-5 py-3.5 text-left text-base font-semibold text-ink shadow-[0_8px_24px_rgba(26,42,58,0.1)] transition hover:-translate-y-1 hover:border-roast/40"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <span className="mr-2 text-roast">▸</span>
                {choice}
              </button>
            ))}
          </div>

          <OtherInput
            value={otherText}
            onChange={setOtherText}
            onSubmit={() => {
              if (otherText.trim()) pickRevenge(otherText.trim(), "other");
            }}
            placeholder="Others — type your decree…"
          />
        </main>
      </div>
    );
  }

  if (phase === "react") {
    const isRevengeReact = answers[answers.length - 1]?.question.includes(
      "also do the same",
    );
    return (
      <div
        className={`relative flex min-h-dvh flex-col ${shake ? "animate-shake" : ""}`}
      >
        <SunnySky />
        <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-5 py-10 text-center">
          <p className="animate-bounce-in text-6xl" aria-hidden>
            {shake ? "🔥" : "☀️"}
          </p>
          <h2 className="animate-pop-in font-[family-name:var(--font-display)] mt-4 text-balance text-3xl font-semibold text-ink">
            {reaction}
          </h2>
          <button
            type="button"
            onClick={
              isRevengeReact ? () => setPhase("done") : continueAfterReact
            }
            className="animate-pop-in mt-8 rounded-2xl bg-ink px-7 py-3.5 text-base font-semibold text-paper"
            style={{ animationDelay: "0.15s" }}
          >
            {isRevengeReact
              ? "Show the full receipt →"
              : step + 1 >= QUIZ.length
                ? "One last question →"
                : "Next roast →"}
          </button>
        </main>
      </div>
    );
  }

  const normalChoices = item.choices.filter((c) => !c.runaway);
  const runawayChoice = item.choices.find((c) => c.runaway);

  return (
    <div
      className={`relative flex min-h-dvh flex-col ${shake ? "animate-shake" : ""}`}
    >
      <SunnySky />

      {floatText && (
        <span className="animate-float-up pointer-events-none fixed left-1/2 top-1/3 z-50 -translate-x-1/2 rounded-full bg-roast px-3 py-1 text-sm font-bold text-paper">
          {floatText}
        </span>
      )}

      <main className="relative z-10 mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-8 sm:px-8">
        <p className="font-[family-name:var(--font-display)] text-center text-3xl font-semibold tracking-tight text-ink">
          Seen™
        </p>
        <p className="mt-1 text-center text-sm text-ink-soft">
          Soft button = lightning. Others = confession booth.
        </p>

        <div className="mx-auto mt-5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-paper/50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sun to-roast transition-all duration-500"
            style={{ width: `${Math.max(quizProgress * 100, 8)}%` }}
          />
        </div>

        <div key={step} className="mt-7">
          <p className="animate-pop-in text-center text-xs font-bold uppercase tracking-[0.2em] text-roast">
            Roast {step + 1} / {QUIZ.length}
          </p>
          <h1 className="animate-bounce-in font-[family-name:var(--font-display)] mt-3 text-balance text-center text-2xl font-semibold leading-snug text-ink sm:text-3xl">
            {item.question}
          </h1>
          <p className="animate-pop-in mt-2 text-center text-sm text-ink-soft">
            {item.hint}
          </p>

          <div className="mt-7 flex flex-col gap-3">
            {normalChoices.map((choice, i) => (
              <button
                key={choice.label}
                type="button"
                onClick={() => pickChoice(choice.label, "roast")}
                className={`animate-slide-option rounded-2xl border border-ink/10 bg-paper/95 px-5 py-3.5 text-left text-base font-semibold text-ink shadow-[0_8px_24px_rgba(26,42,58,0.1)] transition hover:border-roast/40 active:scale-[0.98] ${
                  dodgeCount > 2 ? "animate-wiggle" : ""
                }`}
                style={{
                  animationDelay: `${i * 0.06}s`,
                  transform: `scale(${roastScale})`,
                  transformOrigin: "left center",
                }}
              >
                <span className="mr-2 text-roast">▸</span>
                {choice.label}
              </button>
            ))}
          </div>

          <OtherInput
            value={otherText}
            onChange={setOtherText}
            onSubmit={() => {
              if (otherText.trim()) pickChoice(otherText.trim(), "other");
            }}
          />

          {runawayChoice && (
            <>
              <div
                ref={stageRef}
                className={`relative mt-5 h-40 w-full overflow-hidden rounded-2xl border border-dashed sm:h-44 ${
                  softFrozen
                    ? "border-leaf/50 bg-leaf/10"
                    : "border-ink/20 bg-paper/40"
                }`}
                onMouseMove={(e) => {
                  if (softFrozenRef.current) return;
                  const btn = runBtnRef.current;
                  if (!btn) return;
                  const r = btn.getBoundingClientRect();
                  const cx = r.left + r.width / 2;
                  const cy = r.top + r.height / 2;
                  const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
                  if (dist < 110) moveRunaway();
                }}
              >
                <p className="pointer-events-none absolute left-3 top-2 text-[10px] font-bold uppercase tracking-wider text-ink-soft/70">
                  {softFrozen
                    ? "Frozen — tap the soft answer"
                    : "Soft answer (good luck)"}
                </p>
                <button
                  ref={runBtnRef}
                  type="button"
                  onMouseEnter={() => {
                    if (!softFrozenRef.current) moveRunaway(true);
                  }}
                  onFocus={() => {
                    if (!softFrozenRef.current) moveRunaway(true);
                  }}
                  onTouchStart={(e) => {
                    if (softFrozenRef.current) return;
                    e.preventDefault();
                    moveRunaway(true);
                  }}
                  onClick={() => catchSoft(runawayChoice.label)}
                  className={`absolute z-20 max-w-[80%] rounded-xl border border-leaf/30 bg-leaf/90 px-3 py-2 text-left text-xs font-semibold text-paper shadow-md sm:text-sm ${
                    softFrozen ? "animate-pulse-cta ring-2 ring-sun" : ""
                  }`}
                  style={{
                    left: runPos ? runPos.x : softFrozen ? "18%" : "10%",
                    top: runPos ? runPos.y : softFrozen ? "40%" : "45%",
                    transition: softFrozen
                      ? "left 200ms ease, top 200ms ease"
                      : "left 45ms linear, top 45ms linear",
                  }}
                >
                  {runawayChoice.label}
                </button>
              </div>

              {!softFrozen ? (
                <button
                  type="button"
                  onClick={giveUpAndLove}
                  className="animate-pop-in mt-3 w-full rounded-2xl border-2 border-dashed border-roast/40 bg-gradient-to-r from-paper to-sun/40 px-4 py-3.5 text-center text-sm font-bold text-ink shadow-[0_8px_20px_rgba(255,159,28,0.2)] transition hover:scale-[1.01] active:scale-[0.99]"
                >
                  Tired of catching & can&apos;t catch it?
                  <span className="mt-1 block text-base text-roast">
                    Select this — I love you 💘
                  </span>
                  <span className="mt-1 block text-[11px] font-medium text-ink-soft">
                    Freezes the soft button so you can tap it
                  </span>
                </button>
              ) : (
                <p className="animate-pop-in mt-3 text-center text-sm font-semibold text-leaf">
                  Soft button frozen. Tap it above. (I love you saved for this
                  question)
                </p>
              )}
            </>
          )}

          {dodgeCount > 0 && (
            <p className="animate-pop-in mt-3 text-center text-xs font-medium text-ink-soft">
              Escapes: {dodgeCount} · it&apos;s basically a sport now
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
