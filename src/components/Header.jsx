import React from 'react';

export default function Header({
  viewMode,
  setViewMode,
  participant,
  onResetParticipant,
  isAdminLoggedIn,
  onOpenAdminLogin
}) {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* 좌측 로고 / 타이틀 */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setViewMode('participant')}
            className="flex items-center gap-2 text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
              ⚖️
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white leading-tight">
                밸런스 게임 투표
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                리더십 소수결 & 조별 총예산
              </p>
            </div>
          </button>
        </div>

        {/* 중앙: 내 참가 정보 (등록된 경우) */}
        {participant && viewMode === 'participant' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80">
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-black">
              {participant.team}
            </span>
            <span className="text-xs font-bold text-white">
              {participant.name}
            </span>
            <div className="flex items-center gap-1 text-xs font-black text-amber-300 pl-1 border-l border-slate-700">
              <span className="text-xs">🪙</span>
              {(participant.totalBudget || 0).toLocaleString()}원
            </div>
          </div>
        )}

        {/* 우측: 뷰 모드 탭 & 관리자 진입 */}
        <div className="flex items-center gap-1.5">
          {/* 전광판 모드 버튼 */}
          <button
            onClick={() => setViewMode(viewMode === 'screen' ? 'participant' : 'screen')}
            className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === 'screen'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
            title="빔프로젝터 / TV 전광판 모드"
          >
            <span className="text-sm">🖥️</span>
            <span className="hidden md:inline">전광판 모드</span>
          </button>

          {/* 관리자 모드 버튼 */}
          <button
            onClick={() => {
              if (isAdminLoggedIn) {
                setViewMode(viewMode === 'admin' ? 'participant' : 'admin');
              } else {
                onOpenAdminLogin();
              }
            }}
            className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === 'admin'
                ? 'bg-rose-500 text-slate-950 shadow-md font-extrabold'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}
            title="진행자 관리자 콘솔"
          >
            <span className="text-sm">⚙️</span>
            <span className="hidden md:inline">진행자 관리</span>
          </button>

          {/* 참가자 정보 초기화 / 다시 등록 */}
          {participant && (
            <button
              onClick={onResetParticipant}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-rose-300 text-xs transition-colors cursor-pointer"
              title="이름/조 변경"
            >
              <span className="text-sm">🚪</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
