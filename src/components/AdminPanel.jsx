import React, { useState } from 'react';

export default function AdminPanel({
  adminState,
  onAdminAction,
  onLogout
}) {
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
    alert('설정이 저장되었습니다.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 관리자 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-rose-500/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">호스트 전용 컨트롤 타워</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            밸런스 게임 진행자 콘솔
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            PPT 발표 흐름에 맞추어 버튼 하나로 모든 참가자 화면과 전광판을 동기화합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700">
            현재 상태: <span className="text-cyan-400 font-extrabold">{status}</span>
          </span>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/40 cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </div>

      {/* 게임 진행 핵심 컨트롤러 */}
      <div className="p-6 rounded-2xl glass-card border border-slate-700 space-y-5">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2">
          <span>▶</span>
          실시간 라운드 제어
        </h3>

        {/* 현재 라운드 정보 & 투표율 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
          <div>
            <span className="text-xs text-slate-400 block">진행 중인 문제</span>
            <span className="text-xl font-black text-cyan-300">
              문제 {adminState?.roundNumber || 1} / {adminState?.totalQuestions || 5}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">투표 현황</span>
            <span className="text-xl font-black text-white">
              {votedCount}명 투표 완료 <span className="text-xs text-slate-400">/ {totalCount}명 참가</span>
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">관리자 투표 모니터 (A vs B)</span>
            <span className="text-sm font-black text-slate-300">
              A: <span className="text-cyan-400 font-bold">{Object.values(currentVotes).filter(v => v === 'A').length}</span>표 vs B: <span className="text-rose-400 font-bold">{Object.values(currentVotes).filter(v => v === 'B').length}</span>표
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
            <span>문제 {adminState?.roundNumber || 1} 투표 시작</span>
          </button>

          {/* 투표 마감 및 결과 공개 */}
          <button
            onClick={() => handleAction('reveal_result')}
            className="p-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-sm flex flex-col items-center justify-center gap-2 shadow-lg shadow-amber-500/30 cursor-pointer"
          >
            <span className="text-xl">👁️</span>
            <span>마감 & 소수 승자 공개</span>
          </button>

          {/* 다음 문제로 이동 */}
          <button
            onClick={() => handleAction('next_round')}
            className="p-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-sm flex flex-col items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <span className="text-xl">⏩</span>
            <span>다음 문제로 이동</span>
          </button>

          {/* 중간 집계 공개 */}
          <button
            onClick={() => handleAction('show_summary')}
            className="p-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 font-black text-sm flex flex-col items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <span className="text-xl">📊</span>
            <span>조별 총예산 중간집계</span>
          </button>
        </div>

        {/* 특정 문제로 점프 / 로비 이동 */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">문제 바로가기:</span>
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
              해당 문제 시작
            </button>
          </div>

          <button
            onClick={() => handleAction('go_to_lobby')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700 cursor-pointer"
          >
            로비(대기)로 전환
          </button>

          <button
            onClick={() => {
              if (window.confirm('게임 전체를 초기화하시겠습니까? 누적된 모든 예산과 투표 기록이 리셋됩니다.')) {
                handleAction('reset_game');
              }
            }}
            className="ml-auto px-3 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900/70 text-xs font-bold text-rose-300 border border-rose-800/60 flex items-center gap-1.5 cursor-pointer"
          >
            <span>🔄</span>
            게임 전체 리셋
          </button>
        </div>
      </div>

      {/* 예산 및 게임 설정 */}
      <div className="p-6 rounded-2xl glass-card border border-slate-700">
        <h3 className="text-base font-extrabold text-white flex items-center gap-2 mb-4">
          <span>⚙️</span>
          예산 및 라운드 설정
        </h3>

        <form onSubmit={handleUpdateSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <span>💰</span>
              승자 1인당 지급 예산 (원)
            </label>
            <input
              type="number"
              step={10000}
              value={rewardInput}
              onChange={(e) => setRewardInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">소수 승리 시 승자 1명당 소속 조에 적립될 금액</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              총 밸런스 게임 문제 수
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={totalQuestionsInput}
              onChange={(e) => setTotalQuestionsInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">예정된 총 문제 수 (중간에 늘릴 수 있음)</span>
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-md cursor-pointer"
            >
              설정 저장
            </button>
          </div>
        </form>
      </div>

      {/* 참가자 현황 & 관리 */}
      <div className="p-6 rounded-2xl glass-card border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>👥</span>
            참가자 명단 및 관리 ({participants.length}명)
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
                      <span>예산: {(p.totalBudget || 0).toLocaleString()}원</span>
                      <span>•</span>
                      <span className={voted ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {voted ? '투표완료' : '미투표'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`[${p.team}] ${p.name} 참가자를 퇴장시키겠습니까?`)) {
                        handleAction('remove_participant', { userId: p.id });
                      }
                    }}
                    title="참가자 삭제"
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
            아직 참가한 사람이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
