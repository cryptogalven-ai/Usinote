"use client";

import { useState } from "react";

type Problem = "home" | "vibrations" | "broken";
type Option = "Oui" | "Non" | "Je ne sais pas";

type Check = {
  label: string;
  options: Option[];
  why: string;
  verify: string[];
  action: string;
};

type Diagnostic = {
  title: string;
  description: string;
  questions: Check[];
};

const commonOptions: Option[] = ["Oui", "Non", "Je ne sais pas"];

const diagnostics: Record<Exclude<Problem, "home">, Diagnostic> = {
  vibrations: {
    title: "Vibrations",
    description: "On vérifie les causes dans l'ordre prévu par USINOTE.",
    questions: [
      { label: "La sortie d’outil est-elle excessive ?", options: commonOptions, why: "Une sortie d’outil importante réduit la rigidité du système et peut favoriser les vibrations.", verify: ["Longueur sortie de l’outil", "Rigidité du porte-outil et du montage", "Possibilité de réduire la sortie"], action: "Réduire la sortie d’outil lorsque l’application le permet et privilégier un montage plus rigide." },
      { label: "La rotation / vitesse est-elle adaptée ?", options: commonOptions, why: "Les conditions de coupe influencent directement la stabilité du fraisage.", verify: ["Vitesse de coupe Vc", "Vitesse de rotation", "Adéquation outil / matière / application"], action: "Comparer les conditions utilisées avec les données du fabricant de l’outil avant de modifier les paramètres." },
      { label: "L’état de la fraise est-il correct ?", options: commonOptions, why: "Une arête usée ou endommagée peut dégrader la stabilité du processus.", verify: ["Usure des arêtes", "Ébréchures ou dommages", "Adhérence de matière"], action: "Remplacer ou faire reconditionner l’outil si son état ne permet plus un usinage fiable." },
      { label: "L’avance est-elle adaptée ?", options: commonOptions, why: "Une avance mal adaptée peut rendre l’engagement trop agressif ou au contraire perturber la coupe.", verify: ["Avance par dent fz", "Vitesse d’avance Vf", "Adéquation avec l’outil et la matière"], action: "Vérifier l’avance à partir des données de coupe du fabricant plutôt que d’appliquer une valeur universelle." },
      { label: "Le serrage de la pièce est-il correct ?", options: commonOptions, why: "Une pièce ou un montage insuffisamment rigide peut transmettre ou amplifier les vibrations.", verify: ["Maintien réel de la pièce", "Rigidité du montage", "Déplacement ou déformation pendant la coupe"], action: "Améliorer la rigidité du montage et vérifier que la pièce reste parfaitement maintenue pendant l’usinage." },
      { label: "La stratégie d’usinage est-elle adaptée ?", options: commonOptions, why: "La stratégie détermine la manière dont l’outil entre en charge et influence les efforts de coupe.", verify: ["Type d’opération", "Engagement radial et axial", "Compatibilité outil / stratégie"], action: "Comparer la stratégie utilisée avec celle recommandée pour l’outil et l’application." },
    ],
  },
  broken: {
    title: "Outil cassé",
    description: "On vérifie les causes dans l'ordre défini pour la V0.",
    questions: [
      { label: "L’offset outil est-il correct ?", options: commonOptions, why: "Une correction outil incorrecte peut placer l’outil à une position différente de celle prévue dans le programme.", verify: ["Correction de longueur", "Correction de diamètre si utilisée", "Correspondance entre l’outil monté et l’outil appelé"], action: "Contrôler la mesure, l’identification et les corrections de l’outil avant de relancer l’usinage." },
      { label: "L’état / l’usure de la fraise est-il correct ?", options: commonOptions, why: "Une fraise fortement usée ou endommagée peut perdre sa fiabilité et augmenter les contraintes sur l’outil.", verify: ["Usure des arêtes", "Ébréchures ou casse partielle", "Adhérence de matière sur les arêtes"], action: "Remplacer l’outil ou utiliser un outil reconditionné lorsque son état ne permet plus une coupe fiable." },
      { label: "La hauteur de passe est-elle adaptée ?", options: commonOptions, why: "Une passe trop agressive peut augmenter fortement la charge sur l’outil. Il faut distinguer la profondeur axiale ap de l’engagement radial ae.", verify: ["Profondeur axiale ap", "Engagement radial ae", "Compatibilité avec l’outil, la matière et la stratégie"], action: "Comparer ap et ae aux données de coupe adaptées à l’outil, à la matière et à l’application. Ne pas modifier un seul paramètre sans regarder l’ensemble des conditions." },
      { label: "L’avance est-elle adaptée ?", options: commonOptions, why: "Une avance trop élevée peut surcharger l’outil et favoriser la fracture. À l’inverse, une avance trop faible peut aussi dégrader les conditions de coupe et accélérer l’usure.", verify: ["Avance par dent fz", "Vitesse d’avance Vf", "Adéquation avec diamètre, nombre de dents, matière et stratégie"], action: "Comparer l’avance aux recommandations du fabricant de l’outil et ajuster les conditions de coupe de manière cohérente." },
      { label: "Le serrage de la pièce est-il correct ?", options: commonOptions, why: "Un montage insuffisamment rigide peut provoquer des mouvements, de la déflexion ou des efforts parasites pendant la coupe.", verify: ["Maintien de la pièce", "Rigidité du montage", "Déformation ou déplacement pendant l’usinage"], action: "Sécuriser le montage et améliorer la rigidité si nécessaire avant de relancer l’opération." },
    ],
  },
};

export default function Home() {
  const [problem, setProblem] = useState<Problem>("home");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);

  const diagnostic = problem === "home" ? null : diagnostics[problem];

  function start(next: Exclude<Problem, "home">) {
    setProblem(next);
    setStep(0);
    setAnswers([]);
  }

  function answer(value: Option) {
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
  const issues = diagnostic ? diagnostic.questions.map((question, index) => ({ question, answer: answers[index], index })).filter((item) => item.answer === "Non") : [];
  const unknowns = diagnostic ? diagnostic.questions.map((question, index) => ({ question, answer: answers[index], index })).filter((item) => item.answer === "Je ne sais pas") : [];

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
              <div className="eyebrow">Diagnostic d’usinage</div>
              <h1>Quand ça ne va pas,<br /><span>trouve pourquoi.</span></h1>
              <p className="intro">USINOTE t’accompagne contrôle par contrôle pour identifier le point à vérifier avant de modifier ton process.</p>
              <div className="hero-points"><div>• Diagnostic structuré</div><div>• Recommandations techniques</div><div>• Pensé pour l’atelier</div></div>
              <button className="primary" onClick={() => start("broken")}><span><strong>J’AI UN PROBLÈME D’USINAGE</strong><small>LANCER UN DIAGNOSTIC</small></span><b>→</b></button>
            </section>

            <section className="problems">
              <div className="section-heading"><div><p className="section-kicker">USINOTE V0</p><h2>Problèmes courants</h2></div><span>02 DISPONIBLES</span></div>
              <div className="cards">
                <button className="card card-broken" onClick={() => start("broken")}><div className="card-icon">✕</div><div className="card-title">Outil cassé</div><div className="card-copy">Identifier le contrôle prioritaire avant de relancer.</div><div className="card-action">DIAGNOSTIQUER <b>→</b></div></button>
                <button className="card" onClick={() => start("vibrations")}><div className="card-icon">≈</div><div className="card-title">Vibrations</div><div className="card-copy">Remonter méthodiquement vers la cause probable.</div><div className="card-action">DIAGNOSTIQUER <b>→</b></div></button>
              </div>
              <div className="trust-strip"><div><b>01 · CONTRÔLER</b><span>Une question à la fois.</span></div><div><b>02 · COMPRENDRE</b><span>Une cause expliquée.</span></div><div><b>03 · AGIR</b><span>Une action concrète.</span></div></div>
            </section>
            <p className="footer">USINOTE · ATELIER PREMIUM · V0</p>
          </>
        ) : (
          <section>
            <button className="back" onClick={reset}>← Retour à l’accueil</button>
            <div className="progress"><span style={{ width: `${finished ? 100 : ((step + 1) / diagnostic!.questions.length) * 100}%` }} /></div>

            {!finished ? (
              <>
                <div className="eyebrow">{diagnostic!.title} · Étape {step + 1} / {diagnostic!.questions.length}</div>
                <h1 className="question">{diagnostic!.questions[step].label}</h1>
                <p className="step-copy">Réponds simplement. USINOTE affine le diagnostic au fil des contrôles.</p>
                <div className="answers">{diagnostic!.questions[step].options.map((option) => <button className="answer" key={option} onClick={() => answer(option)}>{option}<span>→</span></button>)}</div>
              </>
            ) : (
              <div className="result-page">
                <div className="result-hero">
                  <div className="result-label">Diagnostic terminé</div>
                  <h2>{issues.length > 0 ? "Point(s) à contrôler" : unknowns.length > 0 ? "Points à vérifier" : "Contrôles terminés"}</h2>
                  <p>{issues.length > 0 ? `${issues.length} contrôle${issues.length > 1 ? "s" : ""} signalé${issues.length > 1 ? "s" : ""}. Commence par le premier dans l’ordre du diagnostic.` : unknowns.length > 0 ? "Certains contrôles n’ont pas pu être confirmés." : "Aucune anomalie signalée dans les contrôles de cette V0."}</p>
                </div>

                {issues.length > 0 && <div className="recommendations"><div className="result-section-title">RECOMMANDATIONS</div>{issues.map(({ question, index }) => <article className="recommendation" key={question.label}><div className="recommendation-head"><span className="priority">PRIORITÉ {index + 1}</span><h3>{question.label}</h3></div><div className="recommendation-block"><b>Pourquoi ?</b><p>{question.why}</p></div><div className="recommendation-block"><b>À vérifier</b><ul>{question.verify.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="action"><b>Action recommandée</b><p>{question.action}</p></div></article>)}</div>}

                {unknowns.length > 0 && <div className="unknown-panel"><b>À confirmer</b><p>{unknowns.map(({ question }) => question.label).join(" · ")}</p></div>}

                <div className="result-section-title">RÉCAPITULATIF</div>
                <div className="checklist">{diagnostic!.questions.map((question, index) => <div className="check" key={question.label}><span className={`check-status ${answers[index] === "Non" ? "issue" : answers[index] === "Je ne sais pas" ? "unknown" : "ok"}`}>{answers[index] === "Non" ? "!" : answers[index] === "Je ne sais pas" ? "?" : "✓"}</span><div><div className="check-label">{question.label}</div><div className="check-answer">{answers[index]}</div></div></div>)}</div>

                <div className="result-actions"><button className="primary" onClick={() => start(problem as Exclude<Problem, "home">)}><span><strong>RECOMMENCER</strong><small>REFAIRE LE DIAGNOSTIC</small></span><b>↻</b></button><button className="secondary" onClick={reset}>Choisir un autre problème</button></div>
                <p className="source-note">Base technique : recommandations fabricants et données d’application. Les paramètres de coupe doivent être vérifiés selon l’outil, la matière et la stratégie.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
