"use client";

import { useState } from "react";

type Problem = "home" | "vibrations" | "broken";
type Option = "Oui" | "Non" | "Je ne sais pas";
type LibraryView = "home" | "category" | "article";

type Check = { label: string; options: Option[]; why: string; verify: string[]; action: string };
type Diagnostic = { title: string; description: string; questions: Check[] };
type Article = { id: string; category: string; title: string; intro: string; sections: { title: string; text: string; bullets?: string[] }[] };

const commonOptions: Option[] = ["Oui", "Non", "Je ne sais pas"];

const diagnostics: Record<Exclude<Problem, "home">, Diagnostic> = {
  vibrations: {
    title: "Vibrations", description: "On vérifie les causes dans l'ordre prévu par USINOTE.",
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
    title: "Outil cassé", description: "On vérifie les causes dans l'ordre défini pour la V0.",
    questions: [
      { label: "L’offset outil est-il correct ?", options: commonOptions, why: "Une correction outil incorrecte peut placer l’outil à une position différente de celle prévue dans le programme.", verify: ["Correction de longueur", "Correction de diamètre si utilisée", "Correspondance entre l’outil monté et l’outil appelé"], action: "Contrôler la mesure, l’identification et les corrections de l’outil avant de relancer l’usinage." },
      { label: "L’état / l’usure de la fraise est-il correct ?", options: commonOptions, why: "Une fraise fortement usée ou endommagée peut perdre sa fiabilité et augmenter les contraintes sur l’outil.", verify: ["Usure des arêtes", "Ébréchures ou casse partielle", "Adhérence de matière sur les arêtes"], action: "Remplacer l’outil ou utiliser un outil reconditionné lorsque son état ne permet plus une coupe fiable." },
      { label: "La hauteur de passe est-elle adaptée ?", options: commonOptions, why: "Une passe trop agressive peut augmenter fortement la charge sur l’outil. Il faut distinguer la profondeur axiale ap de l’engagement radial ae.", verify: ["Profondeur axiale ap", "Engagement radial ae", "Compatibilité avec l’outil, la matière et la stratégie"], action: "Comparer ap et ae aux données de coupe adaptées à l’outil, à la matière et à l’application. Ne pas modifier un seul paramètre sans regarder l’ensemble des conditions." },
      { label: "L’avance est-elle adaptée ?", options: commonOptions, why: "Une avance trop élevée peut surcharger l’outil et favoriser la fracture. À l’inverse, une avance trop faible peut aussi dégrader les conditions de coupe et accélérer l’usure.", verify: ["Avance par dent fz", "Vitesse d’avance Vf", "Adéquation avec diamètre, nombre de dents, matière et stratégie"], action: "Comparer l’avance aux recommandations du fabricant de l’outil et ajuster les conditions de coupe de manière cohérente." },
      { label: "Le serrage de la pièce est-il correct ?", options: commonOptions, why: "Un montage insuffisamment rigide peut provoquer des mouvements, de la déflexion ou des efforts parasites pendant la coupe.", verify: ["Maintien de la pièce", "Rigidité du montage", "Déformation ou déplacement pendant l’usinage"], action: "Sécuriser le montage et améliorer la rigidité si nécessaire avant de relancer l’opération." },
    ],
  },
};

const libraryCategories = [
  { id: "tools", icon: "◈", title: "Outils de coupe", copy: "Comprendre le choix, l’état et le comportement des outils." },
  { id: "materials", icon: "▣", title: "Matières", copy: "Repères pour adapter l’usinage au matériau travaillé." },
  { id: "cutting", icon: "↗", title: "Paramètres de coupe", copy: "Les notions essentielles : Vc, n, fz, Vf, ap et ae." },
  { id: "defects", icon: "≈", title: "Défauts d’usinage", copy: "Identifier les symptômes et remonter vers les causes." },
  { id: "methods", icon: "✦", title: "Méthodes & astuces", copy: "Des fiches courtes inspirées des situations d’atelier." },
];

const articles: Article[] = [
  { id: "rigidity", category: "Outils de coupe", title: "Rigidité et sortie d’outil", intro: "La rigidité du système outil–porte-outil–machine–pièce est un point clé lorsqu’un usinage devient instable.", sections: [
    { title: "Pourquoi c’est important", text: "Une sortie d’outil importante réduit la rigidité disponible et peut favoriser la déflexion ou les vibrations. La géométrie et le montage doivent être considérés ensemble." },
    { title: "À contrôler", text: "Avant de modifier les paramètres de coupe, regarder la longueur réellement sortie, le porte-outil, le serrage et la possibilité de raccourcir le montage.", bullets: ["Sortie réelle de l’outil", "Rigidité du porte-outil", "Rigidité du montage pièce", "Déformation pendant la coupe"] },
    { title: "Réflexe USINOTE", text: "Quand une opération vibre, commencer par vérifier la rigidité du système avant d’appliquer une correction universelle de vitesse ou d’avance." },
  ]},
  { id: "vc", category: "Paramètres de coupe", title: "Vc, rotation et vitesse de coupe", intro: "La vitesse de coupe permet de relier le diamètre de l’outil à sa vitesse de rotation.", sections: [
    { title: "Les notions", text: "Vc désigne la vitesse de coupe. La vitesse de rotation est généralement exprimée en tr/min. Elles sont liées au diamètre de l’outil." },
    { title: "Attention aux valeurs universelles", text: "Une valeur correcte dépend notamment de l’outil, de la matière et de l’application. Les recommandations du fabricant restent la référence pour définir les conditions de départ." },
    { title: "Réflexe USINOTE", text: "Ne pas isoler la vitesse d’un seul paramètre : vérifier l’ensemble des conditions de coupe et la stratégie utilisée." },
  ]},
  { id: "wear", category: "Défauts d’usinage", title: "Reconnaître l’usure d’une fraise", intro: "L’état de l’arête de coupe influence directement la qualité et la stabilité du processus.", sections: [
    { title: "À observer", text: "Une inspection visuelle permet de rechercher une usure des arêtes, des ébréchures, une casse partielle ou une adhérence de matière.", bullets: ["Usure régulière", "Ébréchure", "Arête endommagée", "Matière collée"] },
    { title: "Pourquoi agir", text: "Un outil très usé ou endommagé peut augmenter les efforts de coupe et rendre le processus moins fiable." },
    { title: "Réflexe USINOTE", text: "Avant d'accuser la machine ou le programme, vérifier l’état réel de l’outil monté." },
  ]},
];

export default function Home() {
  const [problem, setProblem] = useState<Problem>("home");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [library, setLibrary] = useState<LibraryView>("home");
  const [category, setCategory] = useState("");
  const [article, setArticle] = useState<Article | null>(null);

  const diagnostic = problem === "home" ? null : diagnostics[problem];
  const start = (next: Exclude<Problem, "home">) => { setProblem(next); setStep(0); setAnswers([]); };
  const answer = (value: Option) => { if (!diagnostic) return; const nextAnswers = [...answers, value]; setAnswers(nextAnswers); setStep(step < diagnostic.questions.length - 1 ? step + 1 : diagnostic.questions.length); };
  const reset = () => { setProblem("home"); setStep(0); setAnswers([]); };
  const openLibrary = () => { reset(); setLibrary("home"); };
  const finished = diagnostic ? step >= diagnostic.questions.length : false;
  const issues = diagnostic ? diagnostic.questions.map((question, index) => ({ question, answer: answers[index], index })).filter((item) => item.answer === "Non") : [];
  const unknowns = diagnostic ? diagnostic.questions.map((question, index) => ({ question, answer: answers[index], index })).filter((item) => item.answer === "Je ne sais pas") : [];
  const visibleArticles = category ? articles.filter((item) => item.category === category) : articles;

  return (
    <main className="page"><div className="shell">
      <header className="header"><button className="brand-button" onClick={openLibrary}><div className="brand-mark">U</div><div><p className="brand">USINOTE</p><p className="brand-subtitle">DIAGNOSTIC · BIBLIOTHÈQUE D’USINAGE</p></div></button></header>

      {problem === "home" && library === "home" && <>
        <section className="hero"><div className="hero-glow" /><div className="eyebrow">Diagnostic d’usinage</div><h1>Quand ça ne va pas,<br /><span>trouve pourquoi.</span></h1><p className="intro">USINOTE t’accompagne contrôle par contrôle pour identifier le point à vérifier avant de modifier ton process.</p><div className="hero-points"><div>• Diagnostic structuré</div><div>• Recommandations techniques</div><div>• Pensé pour l’atelier</div></div><button className="primary" onClick={() => start("broken")}><span><strong>J’AI UN PROBLÈME D’USINAGE</strong><small>LANCER UN DIAGNOSTIC</small></span><b>→</b></button></section>
        <section className="problems"><div className="section-heading"><div><p className="section-kicker">USINOTE V0</p><h2>Problèmes courants</h2></div><span>02 DISPONIBLES</span></div><div className="cards"><button className="card card-broken" onClick={() => start("broken")}><div className="card-icon">✕</div><div className="card-title">Outil cassé</div><div className="card-copy">Identifier le contrôle prioritaire avant de relancer.</div><div className="card-action">DIAGNOSTIQUER <b>→</b></div></button><button className="card" onClick={() => start("vibrations")}><div className="card-icon">≈</div><div className="card-title">Vibrations</div><div className="card-copy">Remonter méthodiquement vers la cause probable.</div><div className="card-action">DIAGNOSTIQUER <b>→</b></div></button></div>
        <button className="library-entry" onClick={() => setLibrary("home")}><div><span className="library-kicker">NOUVEAU</span><h3>📚 Bibliothèque USINOTE</h3><p>Le carnet technique pour comprendre, vérifier et progresser.</p></div><b>→</b></button>
        <div className="trust-strip"><div><b>01 · CONTRÔLER</b><span>Une question à la fois.</span></div><div><b>02 · COMPRENDRE</b><span>Une cause expliquée.</span></div><div><b>03 · AGIR</b><span>Une action concrète.</span></div></div></section><p className="footer">USINOTE · ATELIER PREMIUM · V0</p>
      </>}

      {problem === "home" && library !== "home" && <section className="library-page">
        <button className="back" onClick={() => { setLibrary("home"); setCategory(""); setArticle(null); }}>← Retour à l’accueil</button>
        {library === "home" && <>
          <div className="library-hero"><div className="eyebrow">Bibliothèque technique</div><h1>Le savoir-faire<br /><span>de l’usinage.</span></h1><p>Des fiches courtes et pratiques pour comprendre un phénomène, contrôler un point et prendre une décision en atelier.</p></div>
          <div className="section-heading library-heading"><div><p className="section-kicker">EXPLORER</p><h2>Thèmes techniques</h2></div><span>05 CATÉGORIES</span></div>
          <div className="library-categories">{libraryCategories.map((item) => <button className="library-category" key={item.id} onClick={() => { setCategory(item.title); setLibrary("category"); }}><span className="category-icon">{item.icon}</span><span><b>{item.title}</b><small>{item.copy}</small></span><strong>→</strong></button>)}</div>
          <div className="featured"><div className="section-kicker">À LIRE</div><h3>Fiches de départ</h3><div className="article-mini-list">{articles.map((item) => <button key={item.id} onClick={() => { setArticle(item); setLibrary("article"); }}><span>{item.category}</span><b>{item.title}</b><strong>→</strong></button>)}</div></div>
        </>}
        {library === "category" && <><div className="library-top"><div className="eyebrow">Bibliothèque · {category}</div><h2 className="library-title">{category}</h2><p className="step-copy">Sélectionne une fiche pour entrer dans le détail.</p></div><div className="article-list">{visibleArticles.length ? visibleArticles.map((item) => <button className="article-card" key={item.id} onClick={() => { setArticle(item); setLibrary("article"); }}><span>{item.category}</span><h3>{item.title}</h3><p>{item.intro}</p><b>CONSULTER <i>→</i></b></button>) : <div className="empty-library"><b>Cette rubrique arrive progressivement.</b><p>USINOTE sera enrichie avec des fiches validées et orientées atelier.</p></div>}</div></>}
        {library === "article" && article && <article className="article-page"><div className="eyebrow">{article.category}</div><h2>{article.title}</h2><p className="article-intro">{article.intro}</p>{article.sections.map((section) => <section className="article-section" key={section.title}><h3>{section.title}</h3><p>{section.text}</p>{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}<div className="article-note"><b>USINOTE</b><span>Cette fiche donne un cadre de réflexion. Les conditions de coupe doivent être adaptées à l’outil, à la matière, à la machine et à l’application.</span></div></article>}
      </section>}

      {problem !== "home" && <section><button className="back" onClick={reset}>← Retour à l’accueil</button><div className="progress"><span style={{ width: `${finished ? 100 : ((step + 1) / diagnostic!.questions.length) * 100}%` }} /></div>{!finished ? <><div className="eyebrow">{diagnostic!.title} · Étape {step + 1} / {diagnostic!.questions.length}</div><h1 className="question">{diagnostic!.questions[step].label}</h1><p className="step-copy">Réponds simplement. USINOTE affine le diagnostic au fil des contrôles.</p><div className="answers">{diagnostic!.questions[step].options.map((option) => <button className="answer" key={option} onClick={() => answer(option)}>{option}<span>→</span></button>)}</div></> : <div className="result-page"><div className="result-hero"><div className="result-label">Diagnostic terminé</div><h2>{issues.length > 0 ? "Point(s) à contrôler" : unknowns.length > 0 ? "Points à vérifier" : "Contrôles terminés"}</h2><p>{issues.length > 0 ? `${issues.length} contrôle${issues.length > 1 ? "s" : ""} signalé${issues.length > 1 ? "s" : ""}. Commence par le premier dans l’ordre du diagnostic.` : unknowns.length > 0 ? "Certains contrôles n’ont pas pu être confirmés." : "Aucune anomalie signalée dans les contrôles de cette V0."}</p></div>{issues.length > 0 && <div className="recommendations"><div className="result-section-title">RECOMMANDATIONS</div>{issues.map(({ question, index }) => <article className="recommendation" key={question.label}><div className="recommendation-head"><span className="priority">PRIORITÉ {index + 1}</span><h3>{question.label}</h3></div><div className="recommendation-block"><b>Pourquoi ?</b><p>{question.why}</p></div><div className="recommendation-block"><b>À vérifier</b><ul>{question.verify.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="action"><b>Action recommandée</b><p>{question.action}</p></div></article>)}</div>}{unknowns.length > 0 && <div className="unknown-panel"><b>À confirmer</b><p>{unknowns.map(({ question }) => question.label).join(" · ")}</p></div>}<div className="result-section-title">RÉCAPITULATIF</div><div className="checklist">{diagnostic!.questions.map((question, index) => <div className="check" key={question.label}><span className={`check-status ${answers[index] === "Non" ? "issue" : answers[index] === "Je ne sais pas" ? "unknown" : "ok"}`}>{answers[index] === "Non" ? "!" : answers[index] === "Je ne sais pas" ? "?" : "✓"}</span><div><div className="check-label">{question.label}</div><div className="check-answer">{answers[index]}</div></div></div>)}</div><div className="result-actions"><button className="primary" onClick={() => start(problem as Exclude<Problem, "home">)}><span><strong>RECOMMENCER</strong><small>REFAIRE LE DIAGNOSTIC</small></span><b>↻</b></button><button className="secondary" onClick={reset}>Choisir un autre problème</button></div><p className="source-note">Base technique : recommandations fabricants et données d’application. Les paramètres de coupe doivent être vérifiés selon l’outil, la matière et la stratégie.</p></div>}</section>}
    </div></main>
  );
}
