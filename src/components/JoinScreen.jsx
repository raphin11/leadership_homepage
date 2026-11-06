import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function JoinScreen({ onJoin }) {
  const { lang, t } = useLanguage();
  const defaultTeams = lang === 'en'
    ? ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6', 'Team 7']
    : ['1조', '2조', '3조', '4조', '5조', '6조', '7조'];

  const [name, setName] = useState('');
  const [team, setTeam] = useState(defaultTeams[0]);
  const [customTeam, setCustomTeam] = useState('');
  const [isCustomTeam, setIsCustomTeam] = useState(false);

  useEffect(() => {
    if (!isCustomTeam) {
      setTeam(defaultTeams[0]);
    }
  }, [lang]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTeam = isCustomTeam ? customTeam.trim() : team;
    if (!name.trim()) {
      alert(t('join.alertName'));
      return;
    }
    if (!finalTeam) {
      alert(t('join.alertTeam'));
      return;
    }
    onJoin(name.trim(), finalTeam);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8 max-w-md mx-auto">
      {/* 타이틀 헤더 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 mb-4 animate-bounce-slow text-2xl">
          ✨
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
          {t('join.title')}
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          {t('join.subtitle')}
        </p>
      </div>

      {/* 등록 카드 */}
      <form onSubmit={handleSubmit} className="w-full glass-card rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
        {/* 이름 입력 */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <span>👤</span> {t('join.nameLabel')}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('join.namePlaceholder')}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all font-medium text-base"
            maxLength={10}
            autoFocus
          />
        </div>

        {/* 조 선택 */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <span>👥</span> {t('join.teamLabel')}
          </label>
          
          {/* 조 선택 퀵 버튼 그리드 */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {defaultTeams.map((tName) => (
              <button
                key={tName}
                type="button"
                onClick={() => {
                  setTeam(tName);
                  setIsCustomTeam(false);
                }}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  !isCustomTeam && team === tName
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 scale-102 ring-2 ring-cyan-300'
                    : 'bg-slate-800/70 text-slate-300 border border-slate-700/80 hover:bg-slate-700/60'
                }`}
              >
                {tName}
              </button>
            ))}
          </div>

          {/* 직접 입력 토글 */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsCustomTeam(!isCustomTeam)}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-medium mb-2 cursor-pointer"
            >
              {isCustomTeam ? t('join.customTeamBack') : t('join.customTeamToggle')}
            </button>

            {isCustomTeam && (
              <input
                type="text"
                value={customTeam}
                onChange={(e) => setCustomTeam(e.target.value)}
                placeholder={t('join.customTeamPlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 font-medium text-sm"
                maxLength={12}
              />
            )}
          </div>
        </div>

        {/* 게임 규칙 핵심 안내 */}
        <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/50 text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <div className="font-semibold text-amber-400 flex items-center gap-1.5">
            <span>🛡️</span> {t('join.rulesTitle')}
          </div>
          <p>• {t('join.rule1')}</p>
          <p>• {t('join.rule2')}</p>
          <p>• {t('join.rule3')}</p>
          <p>• {t('join.rule4')}</p>
        </div>

        {/* 입장 버튼 */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-slate-950 font-extrabold text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {t('join.submitBtn')}
        </button>
      </form>
    </div>
  );
}
