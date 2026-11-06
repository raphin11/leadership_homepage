import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function AdminPanel({
  adminState,
  onAdminAction,
  onLogout
}) {
  const { t } = useLanguage();
  const [rewardInput, setRewardInput] = useState(adminState?.settings?.rewardPerPerson || 100000);
  const [totalQuestionsInput, setTotalQuestionsInput] = useState(adminState?.totalQuestions || 5);
  const [targetRoundInput, setTargetRoundInput] = useState(adminState?.roundNumber || 1);

  const status = adminState?.status || 'LOBBY';
  const participants = adminState?.participants || [];
  const currentVotes = adminState?.rawVotes || {};
  const votedCount = Object.keys(currentVotes).length;
  const totalCount = participants.length;

  // 관리자 액션 핸들러
  const handleAction = (action, payload = null) => {
    onAdminAction(action, payload);
  };

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    onAdminAction('update_settings', {
      settings: {
        rewardPerPerson: Number(rewardInput),
        totalQuestions: Number(totalQuestionsInput)
      }
    });
    alert(t('admin.alertSaved'));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 관리자 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-rose-500/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">{t('admin.hostTower')}</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            {t('admin.title')}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('admin.desc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700">
            {t('admin.currentStatus')} <span className="text-cyan-400 font-extrabold">{status}</span>
          </span>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 cursor-pointer"
          >
            {t('admin.logout')}
          </button>
        </div>
      </div>

      {/* 게임 진행 핵심 컨트롤러 */}
      <div className="p-6 rounded-2xl glass-card border border-slate-700 space-y-5">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <span>▶</span>
          {t('admin.roundControl')}
        </h3>

        {/* 현재 라운드 정보 & 투표율 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
          <div>
            <span className="text-xs text-slate-400 block">{t('admin.ongoingQuestion')}</span>
            <span className="text-xl font-black text-cyan-300">
              {t('admin.questionDisplay', {
                round: adminState?.roundNumber || 1,
                total: adminState?.totalQuestions || 5
              })}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">{t('admin.votingStatus')}</span>
            <span className="text-xl font-black text-white">
              {t('admin.votingDisplay', {
                voted: votedCount,
                total: totalCount
              })}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">{t('admin.monitorLabel')}</span>
            <span className="text-sm font-black text-slate-300">
              A: <span className="text-cyan-400 font-bold">{Object.values(currentVotes).filter(v => v === 'A').length}</span>{t('common.votes')} vs B: <span className="text-rose-400 font-bold">{Object.values(currentVotes).filter(v => v === 'B').length}</span>{t('common.votes')}
            </span>
          </div>
        </div>

        {/* 핵심 제어 액션 버튼들 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 문제 시작 (투표 오픈) */}
          <button
            onClick={() => handleAction('start_round')}
            className="p-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-slate-950 font-black text-sm flex flex-col items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 cursor-pointer"
          >
            <span className="text-xl">▶</span>
            <span>{t('admin.btnStart', { round: adminState?.roundNumber || 1 })}</span>
          </button>

          {/* 투표 마감 및 결과 공개 */}
          <button
            onClick={() => handleAction('reveal_result')}
            className="p-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-sm flex flex-col items-center justify-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer"
          >
            <span className="text-xl">👁️</span>
            <span>{t('admin.btnReveal')}</span>
          </button>

          {/* 다음 문제로 이동 */}
          <button
            onClick={() => handleAction('next_round')}
            className="p-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-sm flex flex-col items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <span className="text-xl">⏩</span>
            <span>{t('admin.btnNext')}</span>
          </button>

          {/* 중간 집계 공개 */}
          <button
            onClick={() => handleAction('show_summary')}
            className="p-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 font-black text-sm flex flex-col items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <span className="text-xl">📊</span>
            <span>{t('admin.btnSummary')}</span>
          </button>
        </div>

        {/* 특정 문제로 점프 / 로비 이동 */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">{t('admin.jumpLabel')}</span>
            <input
              type="number"
              min={1}
              max={20}
              value={targetRoundInput}
              onChange={(e) => setTargetRoundInput(e.target.value)}
              className="w-16 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold text-center"
            />
            <button
              onClick={() => handleAction('start_round', { questionIndex: Number(targetRoundInput) - 1 })}
              className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white cursor-pointer"
            >
              {t('admin.btnJump')}
            </button>
          </div>

          <button
            onClick={() => handleAction('go_to_lobby')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 cursor-pointer"
          >
            {t('admin.btnLobby')}
          </button>

          <button
            onClick={() => {
              if (window.confirm(t('admin.confirmReset'))) {
                handleAction('reset_game');
              }
            }}
            className="ml-auto px-3 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/70 text-xs font-bold text-rose-300 border border-rose-800/60 flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔄</span>
            {t('admin.btnReset')}
          </button>
        </div>
      </div>

      {/* 예산 및 게임 설정 */}
      <div className="p-6 rounded-2xl glass-card border border-slate-700">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4">
          <span>⚙️</span>
          {t('admin.settingsTitle')}
        </h3>

        <form onSubmit={handleUpdateSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <span>💰</span>
              {t('admin.rewardLabel')}
            </label>
            <input
              type="number"
              step={10000}
              value={rewardInput}
              onChange={(e) => setRewardInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">{t('admin.rewardDesc')}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {t('admin.totalQuestionsLabel')}
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={totalQuestionsInput}
              onChange={(e) => setTotalQuestionsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">{t('admin.totalQuestionsDesc')}</span>
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md cursor-pointer"
            >
              {t('admin.saveSettings')}
            </button>
          </div>
        </form>
      </div>

      {/* 참가자 현황 & 관리 */}
      <div className="p-6 rounded-2xl glass-card border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>👥</span>
            {t('admin.participantsTitle', { count: participants.length })}
          </h3>
        </div>

        {participants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
            {participants.map((p) => {
              const voted = Boolean(currentVotes[p.id]);
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-slate-700 text-cyan-300 font-extrabold text-[10px]">
                        {p.team}
                      </span>
                      <span className="font-bold text-white text-sm">
                        {p.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>{t('admin.budgetLabel', { budget: (p.totalBudget || 0).toLocaleString() })}</span>
                      <span>•</span>
                      <span className={voted ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {voted ? t('admin.votedTag') : t('admin.notVotedTag')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(t('admin.removeConfirm', { team: p.team, name: p.name }))) {
                        handleAction('remove_participant', { userId: p.id });
                      }
                    }}
                    title={t('common.cancel')}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 cursor-pointer text-xs font-bold"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            {t('admin.noParticipants')}
          </div>
        )}
      </div>
    </div>
  );
}
