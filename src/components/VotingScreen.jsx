import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function VotingScreen({
  roundNumber,
  totalQuestions,
  hasVoted,
  myChoice,
  votedCount,
  totalParticipants,
  onSubmitVote,
  participant
}) {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 투표 확인 및 제출
  const handleVoteClick = (choice) => {
    if (hasVoted || isSubmitting) return;

    // 모바일 터치 실수 방지를 위해 확인창 또는 즉시 확정
    const confirmMessage = t('voting.confirmPrompt', { choice });
    if (window.confirm(confirmMessage)) {
      setIsSubmitting(true);
      onSubmitVote(choice);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-6 max-w-lg mx-auto">
      {/* 상단 라운드 배지 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          {t('voting.questionBadge')} {roundNumber}
        </span>
        <span className="text-xs text-slate-400">
          {t('voting.progress', { current: roundNumber, total: totalQuestions })}
        </span>
      </div>

      {/* 메인 타이틀: 문제 번호 강조 */}
      <div className="text-center mb-6">
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
          {t('voting.title', { round: roundNumber })}
        </h2>
        <p className="text-sm text-slate-300">
          {t('voting.desc')}
        </p>
      </div>

      {/* 상태 1: 아직 투표하지 않은 경우 -> A vs B 투표 버튼 */}
      {!hasVoted ? (
        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* A 선택 버튼 */}
            <button
              onClick={() => handleVoteClick('A')}
              disabled={isSubmitting}
              className="relative group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-cyan-600/90 to-blue-700/90 hover:from-cyan-500 hover:to-blue-600 active:scale-95 transition-all shadow-xl shadow-cyan-900/40 border border-cyan-400/40 flex flex-col items-center justify-center min-h-[160px] cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="text-3xl sm:text-4xl font-black text-white">A</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                {t('voting.choiceA')}
              </span>
              <span className="text-xs text-cyan-200 mt-1">
                {t('voting.tapToChoose')}
              </span>
            </button>

            {/* B 선택 버튼 */}
            <button
              onClick={() => handleVoteClick('B')}
              disabled={isSubmitting}
              className="relative group p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-rose-600/90 to-pink-700/90 hover:from-rose-500 hover:to-pink-600 active:scale-95 transition-all shadow-xl shadow-rose-900/40 border border-rose-400/40 flex flex-col items-center justify-center min-h-[160px] cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <span className="text-3xl sm:text-4xl font-black text-white">B</span>
              </div>
              <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                {t('voting.choiceB')}
              </span>
              <span className="text-xs text-rose-200 mt-1">
                {t('voting.tapToChoose')}
              </span>
            </button>
          </div>

          {/* 투표 번복 불가 경고 */}
          <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold text-center">
            <span>⚠️</span>
            <span>{t('voting.warningIrreversible')}</span>
          </div>
        </div>
      ) : (
        /* 상태 2: 투표 완료 후 화면 -> 번복 불가 & 결과 알 수 없음 대기 화면 */
        <div className="w-full glass-card rounded-2xl p-6 sm:p-8 text-center space-y-6 border border-emerald-500/30 shadow-2xl">
          {/* 완료 아이콘 및 내 선택 */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-1 text-3xl font-black">
            ✓
          </div>

          <div>
            <h3 className="text-2xl font-black text-white mb-2">
              {t('voting.votedTitle')}
            </h3>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700">
              <span className="text-xs text-slate-400">{t('voting.myChoiceLabel')}</span>
              <span className={`text-xl font-black ${myChoice === 'A' ? 'text-cyan-400' : 'text-rose-400'}`}>
                [ {myChoice} ]
              </span>
            </div>
          </div>

          {/* 투표 직후 결과 알 수 없음 & 번복 불가 안내 카드 */}
          <div className="space-y-3 bg-slate-800/60 rounded-xl p-4 text-left border border-slate-700/60">
            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">🔒</span>
              <div>
                <p className="text-xs font-bold text-rose-300">{t('voting.ruleLockedTitle')}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t('voting.ruleLockedDesc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="text-base mt-0.5">⏳</span>
              <div>
                <p className="text-xs font-bold text-amber-300">{t('voting.ruleSecretTitle')}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t('voting.ruleSecretDesc')}</p>
              </div>
            </div>
          </div>

          {/* 진행자의 발표 대기 애니메이션 */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              {t('voting.waitingHost')}
            </div>
          </div>
        </div>
      )}

      {/* 하단 실시간 투표 완료 인원 수 (선택지 비율은 절대 노출하지 않음!) */}
      <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
        <span>👥</span>
        <span>{t('voting.currentStatusLabel')}</span>
        <span className="font-bold text-white">{votedCount}</span> / <span>{totalParticipants} {t('common.person')}</span>
      </div>
    </div>
  );
}
