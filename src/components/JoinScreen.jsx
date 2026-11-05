import React, { useState } from 'react';

export default function JoinScreen({ onJoin }) {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('1조');
  const [customTeam, setCustomTeam] = useState('');
  const [isCustomTeam, setIsCustomTeam] = useState(false);

  const defaultTeams = ['1조', '2조', '3조', '4조', '5조', '6조', '7조', '8조'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTeam = isCustomTeam ? customTeam.trim() : team;
    if (!name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!finalTeam) {
      alert('조(팀)를 선택하거나 입력해주세요.');
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
          리더십 밸런스 게임
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          소수결 투표 & 조별 총예산 쟁탈전
        </p>
      </div>

      {/* 등록 카드 */}
      <form onSubmit={handleSubmit} className="w-full glass-card rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
        {/* 이름 입력 */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <span>👤</span> 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="본인 성함을 입력하세요"
            className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all font-medium text-base"
            maxLength={10}
            autoFocus
          />
        </div>

        {/* 조 선택 */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
            <span>👥</span> 소속 조 (팀)
          </label>
          
          {/* 조 선택 퀵 버튼 그리드 */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {defaultTeams.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTeam(t);
                  setIsCustomTeam(false);
                }}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                  !isCustomTeam && team === t
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 scale-102 ring-2 ring-cyan-300'
                    : 'bg-slate-800/70 text-slate-300 border border-slate-700/80 hover:bg-slate-700/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* 직접 입력 토글 */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsCustomTeam(!isCustomTeam)}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-medium mb-2"
            >
              {isCustomTeam ? '← 기본 조 목록에서 선택하기' : '+ 다른 조 이름 직접 입력하기'}
            </button>

            {isCustomTeam && (
              <input
                type="text"
                value={customTeam}
                onChange={(e) => setCustomTeam(e.target.value)}
                placeholder="예: 리더조, 특별조 등"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 font-medium text-sm"
                maxLength={12}
              />
            )}
          </div>
        </div>

        {/* 게임 규칙 핵심 안내 */}
        <div className="bg-slate-800/40 rounded-xl p-3.5 border border-slate-700/50 text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <div className="font-semibold text-amber-400 flex items-center gap-1.5">
            <span>🛡️</span> 소수결 게임 핵심 룰
          </div>
          <p>• PPT 문제를 보고 <span className="text-cyan-300 font-bold">A</span> 또는 <span className="text-rose-400 font-bold">B</span>에 투표합니다.</p>
          <p>• <span className="text-emerald-400 font-bold">더 적은 사람이 선택한 쪽(소수)</span>이 승리합니다!</p>
          <p>• <span className="text-rose-400 font-bold">투표 직후 결과는 비공개</span>이며, <span className="text-rose-400 font-bold">한 번 투표하면 번복 불가</span>합니다.</p>
          <p>• 승자가 획득한 예산은 <span className="text-amber-300 font-bold">소속 조의 총예산으로 합산</span>됩니다.</p>
        </div>

        {/* 입장 버튼 */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-98 text-slate-950 font-extrabold text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          입장하여 투표 준비하기 →
        </button>
      </form>
    </div>
  );
}
