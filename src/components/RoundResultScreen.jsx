import React from 'react';

export default function RoundResultScreen({
  result,
  participant,
  myChoice
}) {
  const isWinner = result?.winners?.some((w) => w.id === participant?.id);
  const isTie = result?.isTie;
  const winningOption = result?.winningOption;
  const winners = result?.winners || [];

  if (!result) {
    return (
      <div className="text-center py-20 text-slate-400">
        결과를 불러오는 중입니다...
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
        문제 {result.roundNumber} 최종 결과
      </div>

      <h2 className="text-3xl sm:text-4xl font-black text-white text-center mb-6">
        {isTie ? '무승부 (동점)' : `소수결 승리: [ ${winningOption} ]`}
      </h2>

      {/* 내 결과 축하 / 위로 배너 */}
      {isWinner ? (
        <div className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/50 text-center shadow-lg shadow-amber-500/10 animate-pulse-slow">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-400 text-slate-950 font-black mb-2 shadow-md text-2xl">
            🏆
          </div>
          <h3 className="text-lg font-black text-amber-300">
            축하합니다! 소수결에서 승리하셨습니다!
          </h3>
          <p className="text-xs text-amber-200 mt-1">
            소속된 <span className="font-extrabold text-white">[{participant?.team}]</span>에 <span className="font-extrabold text-white">+{result.rewardPerWinner?.toLocaleString()}원</span>의 예산이 적립되었습니다!
          </p>
        </div>
      ) : (
        <div className="w-full mb-6 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 text-center text-xs text-slate-400">
          내가 선택한 항목: <span className="font-bold text-white">[ {myChoice || '미참여'} ]</span>
          {isTie ? ' — 동점으로 소수가 없어 상금이 지급되지 않았습니다.' : ' — 아쉽게도 다수(패배)를 선택하셨습니다.'}
        </div>
      )}

      {/* 투표 득표율 비교 바 (A vs B) */}
      <div className="w-full glass-card rounded-2xl p-5 mb-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center text-xs font-bold text-slate-300">
          <span className="flex items-center gap-1.5 text-cyan-400">
            선택지 A {winningOption === 'A' && <span className="px-1.5 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-black">승리(소수)</span>}
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            {winningOption === 'B' && <span className="px-1.5 py-0.5 rounded bg-rose-500 text-slate-950 text-[10px] font-black">승리(소수)</span>} 선택지 B
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
            {result.countA}표 ({percentA}%)
          </div>
          <div
            style={{ width: `${percentB}%` }}
            className={`h-full transition-all duration-700 flex items-center justify-end pr-3 font-black text-sm ${
              winningOption === 'B'
                ? 'bg-rose-500 text-slate-950 ring-2 ring-rose-300 z-10'
                : 'bg-rose-900/60 text-rose-200'
            }`}
          >
            {result.countB}표 ({percentB}%)
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          총 투표 참여자: {total}명 (A: {result.countA}명 vs B: {result.countB}명)
        </p>
      </div>

      {/* ★ 핵심 요구사항: 이긴 사람(소수인 사람들) 리스트 나오도록 */}
      <div className="w-full glass-card rounded-2xl p-5 shadow-xl border border-slate-700/80">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎖️</span>
            <h3 className="font-extrabold text-white text-base">
              이긴 사람 (소수결 승자) 명단
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black">
            총 {winners.length}명 승리
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
                      <span className="ml-1 text-[11px] text-amber-300 font-bold">(나)</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-emerald-400 font-black text-sm">
                  <span>🪙</span>
                  +{(winner.reward || result.rewardPerWinner || 0).toLocaleString()}원
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs">
            {isTie ? '동점으로 인해 소수인 승자가 없습니다.' : '승자가 없습니다.'}
          </div>
        )}
      </div>

      {/* 대기 안내 */}
      <div className="mt-6 text-center text-xs text-slate-400 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
        진행자의 다음 라운드 또는 중간집계 전환을 기다리고 있습니다.
      </div>
    </div>
  );
}
