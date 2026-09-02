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

  const finished = diagnostic ? step >= diagnostic.questions.length : false;
  const firstIssue = answers.findIndex((answer) => answer === "Non");
  const unknowns = diagnostic
    ? diagnostic.questions.filter((_, index) => answers[index] === "Je ne sais pas")
    : [];

  return (
    <main className="page">
      <div className="shell">
        <header className="header">
          <div className="brand-mark">U</div>
          <div>
            <p className="brand">USINOTE</p>
            <p className="brand-subtitle">DIAGNOSTIC D’USINAGE</p>
          </div>
        </header>

        {problem === "home" ? (
          <>
            <section className="hero">
              <div className="hero-glow" />
              <div className="eyebrow">ASSISTANT DE L’USINEUR</div>
              <h1>Le bon diagnostic.<br /><span>Au bon moment.</span></h1>
              <p className="intro">Identifiez rapidement vos problèmes d’usinage grâce à une méthode simple, structurée et pensée pour l’atelier.</p>
              <div className="hero-points">
                <span>◉ Méthode pas à pas</span>
                <span>◇ Conseils techniques fiables</span>
                <span>↗ Données fabricants &amp; expérience terrain</span>
              </div>
              <button className="primary" onClick={() => start("broken")}>
                <span><strong>DIAGNOSTIQUER</strong><small>J’AI UN PROBLÈME D’USINAGE</small></span>
                <b>→</b>
              </button>
            </section>

            <section className="problems">
              <div className="section-heading">
                <div><p className="section-kicker">DIAGNOSTIC</p><h2>Problèmes courants</h2></div>
                <span>V0</span>
              </div>
              <div className="cards">
                <button className="card card-broken" onClick={() => start("broken")}>
                  <div className="card-icon">✦</div>
                  <div className="card-title">Outil cassé</div>
                  <div className="card-copy">Diagnostiquer les causes de casse d’outil.</div>
                  <div className="card-action">DIAGNOSTIQUER <b>→</b></div>
                </button>
                <button className="card card-vibration" onClick={() => start("vibrations")}>
                  <div className="card-icon">≈</div>
                  <div className="card-title">Vibrations</div>
                  <div className="card-copy">Identifier l’origine des vibrations.</div>
                  <div className="card-action">DIAGNOSTIQUER <b>→</b></div>
                </button>
              </div>
            </section>

            <section className="trust-strip">
              <div><b>FIABLE</b><span>Des recommandations documentées.</span></div>
              <div><b>PRÉCIS</b><span>Une méthode logique et structurée.</span></div>
              <div><b>RAPIDE</b><span>Des contrôles directement exploitables.</span></div>
            </section>

            <p className="footer">USINOTE V0 · PROTOTYPE</p>
          </>
        ) : (
          <section>
            <button className="back" onClick={reset}>← Retour</button>
            <div className="progress"><span style={{ width: `${finished ? 100 : ((step + 1) / diagnostic!.questions.length) * 100}%` }} /></div>

            {!finished ? (
              <>
                <div className="eyebrow">{diagnostic!.title} · Étape {step + 1} / {diagnostic!.questions.length}</div>
                <h1 className="question">{diagnostic!.questions[step].label}</h1>
                <p className="step-copy">Réponds simplement. On passe ensuite au contrôle suivant.</p>
                <div className="answers">
                  {diagnostic!.questions[step].options.map((option) => (
                    <button className="answer" key={option} onClick={() => answer(option)}>{option}</button>
                  ))}
                </div>
              </>
            ) : (
              <div className="result">
                <div className="result-label">Diagnostic terminé</div>
                <h2>{firstIssue >= 0 ? "Point à contrôler en priorité" : unknowns.length > 0 ? "Points à vérifier" : "Contrôles terminés"}</h2>
                <p>
                  {firstIssue >= 0
                    ? diagnostic!.questions[firstIssue].label
                    : unknowns.length > 0
                      ? "Certains contrôles n’ont pas pu être confirmés."
                      : "Aucune anomalie signalée dans les contrôles de cette V0."}
                </p>

                <div className="checklist">
                  {diagnostic!.questions.map((question, index) => (
                    <div className="check" key={question.label}>
                      <span className={`check-status ${answers[index] === "Non" ? "issue" : answers[index] === "Je ne sais pas" ? "unknown" : "ok"}`}>
                        {answers[index] === "Non" ? "!" : answers[index] === "Je ne sais pas" ? "?" : "✓"}
                      </span>
                      <div>
                        <div className="check-label">{question.label}</div>
                        <div className="check-answer">{answers[index]}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="secondary" onClick={() => start(problem as Exclude<Problem, "home">)}>Recommencer le diagnostic</button>
                <button className="secondary" onClick={reset}>Choisir un autre problème</button>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
