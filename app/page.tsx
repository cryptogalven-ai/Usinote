"use client";

import { useState } from "react";

type Problem = "home" | "vibrations" | "broken";

type Diagnostic = {
  title: string;
  description: string;
  questions: { label: string; options: string[] }[];
};

const diagnostics: Record<Exclude<Problem, "home">, Diagnostic> = {
  vibrations: {
    title: "Vibrations",
    description: "On vérifie les causes dans l'ordre prévu par USINOTE.",
    questions: [
      { label: "La sortie d’outil est-elle excessive ?", options: ["Oui", "Non", "Je ne sais pas"] },
      { label: "La rotation / vitesse est-elle adaptée ?", options: ["Oui", "Non", "Je ne sais pas"] },
      { label: "L’état de la fraise est-il correct ?", options: ["Oui", "Non", "Je ne sais pas"] },
      { label: "L’avance est-elle adaptée ?", options: ["Oui", "Non", "Je ne sais pas"] },
      { label: "Le serrage de la pièce est-il correct ?", options: ["Oui", "Non", "Je ne sais pas"] },
      { label: "La stratégie d’usinage est-elle adaptée ?", options: ["Oui", "Non", "Je ne sais pas"] },
    ],
  },
  broken: {
    title: "Outil cassé",
    description: "On vérifie les causes dans l'ordre défini pour la V0.",
    questions: [
      { label: "L’offset outil est-il correct ?", options: ["Oui", "Non", "Je ne sais pas"] },
      { label: "L’état / l’usure de la fraise est-il correct ?", options: ["Oui", "Non", "Je ne sais pas"] },
      { label: "La hauteur de passe est-elle adaptée ?", options: ["Oui", "Non", "Je ne sais pas"] },
      { label: "L’avance est-elle adaptée ?", options: ["Oui", "Non", "Je ne sais pas"] },
      { label: "Le serrage de la pièce est-il correct ?", options: ["Oui", "Non", "Je ne sais pas"] },
    ],
  },
};

export default function Home() {
  const [problem, setProblem] = useState<Problem>("home");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const diagnostic = problem === "home" ? null : diagnostics[problem];

  function start(next: Exclude<Problem, "home">) {
    setProblem(next);
    setStep(0);
    setAnswers([]);
  }

  function answer(value: string) {
    if (!diagnostic) return;
    const nextAnswers = [...answers, value];
    setAnswers(nextAnswers);
    if (step < diagnostic.questions.length - 1) setStep(step + 1);
    else setStep(diagnostic.questions.length);
  }

  function reset() {
    setProblem("home");
    setStep(0);
    setAnswers([]);
  }

  const finished = diagnostic && step >= diagnostic.questions.length;
  const firstIssue = answers.findIndex((answer) => answer === "Non");

  return (
    <main className="page">
      <div className="shell">
        <header className="header">
          <p className="brand">USINOTE</p>
          <p className="tagline">Le savoir-faire de l’usinage, à portée de main.</p>
        </header>

        {problem === "home" ? (
          <>
            <section className="hero">
              <div className="eyebrow">Diagnostic d’usinage</div>
              <h1>Quel est ton problème ?</h1>
              <p className="intro">Décris ton problème à travers quelques contrôles simples. USINOTE avance étape par étape.</p>
              <button className="primary" onClick={() => start("broken")}>🔧 J’AI UN PROBLÈME D’USINAGE</button>
            </section>
            <section>
              <p className="section-title">V0 — Diagnostics disponibles</p>
              <div className="cards">
                <button className="card" onClick={() => start("broken")}>
                  <div className="card-title">🔴 Outil qui casse</div>
                  <div className="card-copy">Trouver la cause, dans l’ordre.</div>
                </button>
                <button className="card" onClick={() => start("vibrations")}>
                  <div className="card-title">🟠 Vibrations</div>
                  <div className="card-copy">Identifier le point à contrôler en priorité.</div>
                </button>
              </div>
            </section>
            <p className="footer">USINOTE V0 · Prototype</p>
          </>
        ) : (
          <section>
            <button className="back" onClick={reset}>← Retour</button>
            <div className="progress"><span style={{ width: `${finished ? 100 : ((step + 1) / diagnostic.questions.length) * 100}%` }} /></div>

            {!finished ? (
              <>
                <div className="eyebrow">Étape {step + 1} / {diagnostic.questions.length}</div>
                <h1 className="question">{diagnostic.questions[step].label}</h1>
                <p className="step-copy">Réponds simplement. On passe ensuite au contrôle suivant.</p>
                <div className="answers">
                  {diagnostic.questions[step].options.map((option) => (
                    <button className="answer" key={option} onClick={() => answer(option)}>{option}</button>
                  ))}
                </div>
              </>
            ) : (
              <div className="result">
                <div className="result-label">Diagnostic terminé</div>
                <h2>{firstIssue >= 0 ? "Point à contrôler" : "Contrôles terminés"}</h2>
                <p>{firstIssue >= 0 ? diagnostic.questions[firstIssue].label : "Aucune anomalie signalée dans les contrôles de cette V0."}</p>
                <button className="secondary" onClick={() => start(problem)}>Recommencer le diagnostic</button>
                <button className="secondary" onClick={reset}>Choisir un autre problème</button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
