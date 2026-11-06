import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function RoundResultScreen({
  result,
  participant,
  myChoice
}) {
  const { t } = useLanguage();
  const isWinner = result?.winners?.some((w) => w.id === participant?.id);
  const isTie = result?.isTie;
  const winningOption = result?.winningOption;
  const winners = result?.winners || [];

  if (!result) {
    return (
      <div className="text-center py-20 text-slate-400">
        ...
      </div>
    );
  }

  const total = (result.countA || 0) + (result.countB || 0);
  const percentA = total > 0 ? Math.round((result.countA / total) * 100) : 50;
  const percentB = total > 0 ? 100 - percentA : 50;

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-6 max-w-lg mx-auto">
      {/* 상단 라운드 뱃지 */}
      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-400 mb-3">
        <span>✨</span>
        {t('result.title', { round: result.roundNumber })}
      </div>

      <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-6">
        {isTie ? t('result.tie') : t('result.minorityWin', { option: winningOption })}
      </h2>

      {/* 내 결과 축하 / 위로 배너 */}
      {isWinner ? (
        <div className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/50 text-center shadow-lg shadow-amber-500/10 animate-pulse-slow">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-400 text-slate-950 font-black mb-2 shadow-md text-2xl">
            🏆
          </div>
          <h3 className="text-lg font-black text-amber-300">
            {t('result.congratsWinner')}
          </h3>
          <p className="text-xs text-amber-200 mt-1">
            {t('result.rewardAdded', {
              team: participant?.team,
              reward: (result.rewardPerWinner || 0).toLocaleString()
            })}
          </p>
        </div>
      ) : (
        <div className="w-full mb-6 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 text-center text-xs text-slate-400">
          {t('result.myChoice')} <span className="font-bold text-white">[ {myChoice || t('result.notVoted')} ]</span>
          {isTie ? t('result.tieDesc') : t('result.loseDesc')}
        </div>
      )}

      {/* 투표 득표율 비교 바 (A vs B) */}
      <div className="w-full glass-card rounded-2xl p-5 mb-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5 text-cyan-400">
            {t('result.optionA')} {winningOption === 'A' && <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-black">{t('result.minorityWinnerTag')}</span>}
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            {winningOption === 'B' && <span className="px-1.5 py-0.5 rounded bg-rose-500 text-slate-950 text-[10px] font-black">{t('result.minorityWinnerTag')}</span>} {t('result.optionB')}
          </span>
        </div>

        {/* 득표 수 게이지 */}
        <div className="relative h-10 bg-slate-800 rounded-xl overflow-hidden flex border border-slate-700">
          <div
            style={{ width: `${percentA}%` }}
            className={`h-full transition-all duration-700 flex items-center justify-start pl-3 font-black text-sm ${
              winningOption === 'A'
                ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-300 z-10'
                : 'bg-cyan-900/60 text-cyan-200'
            }`}
          >
            {result.countA}{t('common.votes')} ({percentA}%)
          </div>
          <div
            style={{ width: `${percentB}%` }}
            className={`h-full transition-all duration-700 flex items-center justify-end pr-3 font-black text-sm ${
              winningOption === 'B'
                ? 'bg-rose-500 text-slate-950 ring-2 ring-rose-300 z-10'
                : 'bg-rose-900/60 text-rose-200'
            }`}
          >
            {result.countB}{t('common.votes')} ({percentB}%)
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          {t('result.votersSummary', {
            total,
            countA: result.countA,
            countB: result.countB
          })}
        </p>
      </div>

      {/* ★ 핵심 요구사항: 이긴 사람(소수인 사람들) 리스트 나오도록 */}
      <div className="w-full glass-card rounded-2xl p-5 shadow-xl border border-slate-700/80">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎖️</span>
            <h3 className="font-extrabold text-white text-base">
              {t('result.winnersListTitle')}
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black">
            {t('result.winnersCountTag', { count: winners.length })}
          </span>
        </div>

        {/* 승자 목록 */}
        {winners.length > 0 ? (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {winners.map((winner, idx) => (
              <div
                key={winner.id || idx}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  winner.id === participant?.id
                    ? 'bg-amber-500/20 border border-amber-400/60 shadow-sm'
                    : 'bg-slate-800/60 border border-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-700 text-xs font-bold text-slate-300 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-700 text-cyan-300 text-xs font-extrabold">
                    {winner.team}
                  </span>
                  <span className="font-bold text-white text-sm">
                    {winner.name}
                    {winner.id === participant?.id && (
                      <span className="ml-1 text-[11px] text-amber-300 font-bold">{t('result.meTag')}</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-emerald-400 font-black text-sm">
                  <span>🪙</span>
                  +{(winner.reward || result.rewardPerWinner || 0).toLocaleString()}{t('common.currency')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs">
            {isTie ? t('result.tieNoWinners') : t('result.noWinners')}
          </div>
        )}
      </div>

      {/* 대기 안내 */}
      <div className="mt-6 text-center text-xs text-slate-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        {t('result.waitingNext')}
      </div>
    </div>
  );
}
