import React, { useState } from 'react';
import { ArticulationLevel, ArticulationQuestion, EssaySections } from '../../types';
import { fetchHint, fetchSoalanPanduan, fetchIdea, fetchKosaKata, fetchPeribahasa, fetchBaikiAyat } from '../../lib/aiCoach';
import { soundManager } from '../../lib/audio';
import { Lightbulb, HelpCircle, Sparkles, BookOpen, Quote, Wand2, Loader2 } from 'lucide-react';

interface AiCoachPanelProps {
  question: ArticulationQuestion;
  level: ArticulationLevel;
  sections: EssaySections;
  isiCount: number;
}

type SectionKey = 'pengenalan' | `isi-${number}` | 'penutup';

function sectionLabel(key: SectionKey): string {
  if (key === 'pengenalan') return 'Pengenalan';
  if (key === 'penutup') return 'Penutup';
  const idx = Number(key.split('-')[1]);
  return `Isi ${idx + 1}`;
}

function sectionText(sections: EssaySections, key: SectionKey): string {
  if (key === 'pengenalan') return sections.pengenalan;
  if (key === 'penutup') return sections.penutup;
  const idx = Number(key.split('-')[1]);
  return sections.isi[idx] || '';
}

// Practice Mode only — AI Guidance is disabled entirely in Exam Mode
// (plan #9.1 Bahagian 18). This component is never rendered there.
export const AiCoachPanel: React.FC<AiCoachPanelProps> = ({ question, level, sections, isiCount }) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('pengenalan');
  const [loadingTool, setLoadingTool] = useState<string | null>(null);
  const [result, setResult] = useState<{ tool: string; content: React.ReactNode } | null>(null);
  const [wordInput, setWordInput] = useState('');
  const [sentenceInput, setSentenceInput] = useState('');

  const sectionOptions: SectionKey[] = ['pengenalan', ...Array.from({ length: isiCount }, (_, i) => `isi-${i}` as SectionKey), 'penutup'];
  const currentText = sectionText(sections, activeSection);

  const run = async (tool: string, fn: () => Promise<any>) => {
    soundManager.playClick();
    setLoadingTool(tool);
    setResult(null);
    const data = await fn();
    setLoadingTool(null);
    if (!data) {
      setResult({ tool, content: <span className="text-clay-500">AI tidak dapat dihubungi buat masa ini. Sila cuba lagi.</span> });
      return;
    }
    setResult({ tool, content: renderResult(tool, data) });
  };

  const renderResult = (tool: string, data: any): React.ReactNode => {
    if (tool === 'idea') {
      return (
        <ul className="list-disc list-inside space-y-1">
          {(data.ideas || []).map((idea: string, i: number) => (
            <li key={i}>{idea}</li>
          ))}
        </ul>
      );
    }
    if (tool === 'kosa_kata' || tool === 'peribahasa') {
      const list: string[] = data.suggestions || [];
      if (list.length === 0) return <span className="text-ink-500">Tiada cadangan sesuai buat masa ini.</span>;
      return (
        <ul className="list-disc list-inside space-y-1">
          {list.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      );
    }
    return <p>{data.text}</p>;
  };

  return (
    <div className="bg-sage-100 border border-sage-200 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-display font-bold text-ink-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sage-600" />
          <span>AI Writing Coach</span>
        </h3>
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value as SectionKey)}
          className="bg-cream-50 border border-sand-300 text-ink-900 text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-mist-400"
        >
          {sectionOptions.map((opt) => (
            <option key={opt} value={opt}>
              {sectionLabel(opt)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => run('hint', () => fetchHint(question.question, level, sectionLabel(activeSection), currentText))}
          disabled={loadingTool !== null}
          className="flex flex-col items-center gap-1 py-2.5 px-2 bg-cream-50 hover:bg-cream-100 rounded-xl text-[11px] font-bold text-ink-700 transition-colors disabled:opacity-50"
        >
          <Lightbulb className="w-4 h-4 text-honey-500" />
          <span>Hint</span>
        </button>
        <button
          onClick={() => run('soalan_panduan', () => fetchSoalanPanduan(question.question, level, sectionLabel(activeSection), currentText))}
          disabled={loadingTool !== null}
          className="flex flex-col items-center gap-1 py-2.5 px-2 bg-cream-50 hover:bg-cream-100 rounded-xl text-[11px] font-bold text-ink-700 transition-colors disabled:opacity-50"
        >
          <HelpCircle className="w-4 h-4 text-mist-600" />
          <span>Soalan Panduan</span>
        </button>
        <button
          onClick={() => run('idea', () => fetchIdea(question.question, question.topic, level, sectionLabel(activeSection)))}
          disabled={loadingTool !== null}
          className="flex flex-col items-center gap-1 py-2.5 px-2 bg-cream-50 hover:bg-cream-100 rounded-xl text-[11px] font-bold text-ink-700 transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-sage-600" />
          <span>Idea</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
            placeholder="Perkataan..."
            className="flex-1 min-w-0 bg-cream-50 border border-sand-300 text-ink-900 text-xs rounded-xl px-3 py-2 outline-none focus:border-mist-400"
          />
          <button
            onClick={() => wordInput.trim() && run('kosa_kata', () => fetchKosaKata(wordInput.trim(), level, currentText))}
            disabled={loadingTool !== null || !wordInput.trim()}
            className="shrink-0 flex items-center gap-1 px-3 py-2 bg-cream-50 hover:bg-cream-100 rounded-xl text-[11px] font-bold text-ink-700 transition-colors disabled:opacity-50"
          >
            <BookOpen className="w-3.5 h-3.5 text-mist-600" />
            <span className="hidden xs:inline">Kosa Kata</span>
          </button>
        </div>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={sentenceInput}
            onChange={(e) => setSentenceInput(e.target.value)}
            placeholder="Ayat..."
            className="flex-1 min-w-0 bg-cream-50 border border-sand-300 text-ink-900 text-xs rounded-xl px-3 py-2 outline-none focus:border-mist-400"
          />
          <button
            onClick={() => sentenceInput.trim() && run('baiki_ayat', () => fetchBaikiAyat(sentenceInput.trim(), level))}
            disabled={loadingTool !== null || !sentenceInput.trim()}
            className="shrink-0 flex items-center gap-1 px-3 py-2 bg-cream-50 hover:bg-cream-100 rounded-xl text-[11px] font-bold text-ink-700 transition-colors disabled:opacity-50"
          >
            <Wand2 className="w-3.5 h-3.5 text-clay-500" />
            <span className="hidden xs:inline">Baiki Ayat</span>
          </button>
        </div>
      </div>

      <button
        onClick={() => run('peribahasa', () => fetchPeribahasa([sections.pengenalan, ...sections.isi, sections.penutup].join(' '), level))}
        disabled={loadingTool !== null}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-2 bg-cream-50 hover:bg-cream-100 rounded-xl text-[11px] font-bold text-ink-700 transition-colors disabled:opacity-50"
      >
        <Quote className="w-4 h-4 text-honey-500" />
        <span>Cadangan Simpulan Bahasa / Peribahasa</span>
      </button>

      {loadingTool && (
        <div className="flex items-center gap-2 text-xs text-ink-500 font-semibold">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>AI sedang berfikir...</span>
        </div>
      )}

      {result && !loadingTool && (
        <div className="bg-cream-50 border border-sand-200 rounded-2xl p-4 text-xs text-ink-700 leading-relaxed">
          {result.content}
        </div>
      )}
    </div>
  );
};
