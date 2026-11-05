import React, { useState } from 'react';

export default function SummaryScreen({ summary, participant }) {
  const [activeTab, setActiveTab] = useState('team'); // 'team' | 'individual' | 'history'
  const [expandedTeam, setExpandedTeam] = useState(null);

  // 1위 조에 속해있는지 확인
  const topTeam = summary?.teamRankings?.[0];
  const isMyTeamTop = topTeam && participant?.team === topTeam.teamName;

  if (!summary) {
    return (
      <div className="text-center py-20 text-slate-400">
        집계 데이터를 계산 중입니다...
      </div>
    );
  }

  const teamRankings = summary.teamRankings || [];
  const individualRankings = summary.individualRankings || [];
  const roundHistory = summary.roundHistory || [];

  return (
    <div className="flex flex-col items-center justify-start min-h-[90vh] px-4 py-6 max-w-xl mx-auto w-full">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 mb-3 text-2xl">
          🏆
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          밸런스 게임 중간집계
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          조별 합산 총예산 및 개인별 기여도 순위
        </p>
      </div>

      {/* 내 조 현황 요약 카드 */}
      {participant && (
        <div className="w-full mb-6 p-4 rounded-2xl glass-card border border-cyan-500/40 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
              {participant.team}
            </div>
            <div>
              <p className="text-xs text-slate-400">내 소속 및 기여도</p>
              <p className="text-sm font-black text-white">
                {participant.name} ({participant.team})
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">내 획득 예산</p>
            <p className="text-base font-black text-emerald-400">
              {(participant.totalBudget || 0).toLocaleString()}원
            </p>
          </div>
        </div>
      )}

      {/* 탭 네비게이션 */}
      <div className="flex w-full bg-slate-800/80 p-1 rounded-xl mb-6 border border-slate-700/60">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'team'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🏆</span>
          조별 총예산 순위
        </button>
        <button
          onClick={() => setActiveTab('individual')}
          className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'individual'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🎖️</span>
          개인 MVP 랭킹
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>📜</span>
          라운드 히스토리
        </button>
      </div>

      {/* TAB 1: 조별 총예산 순위 (핵심 요구사항) */}
      {activeTab === 'team' && (
        <div className="w-full space-y-4">
          {/* 상위 1~3위 시상대 (Podium) */}
          {teamRankings.length >= 2 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-4 pb-2 mb-2">
              {/* 2위 조 */}
              <div className="flex flex-col items-center">
                <div className="text-xs font-bold text-slate-300 mb-1">
                  {teamRankings[1]?.teamName}
                </div>
                <div className="w-full bg-slate-800/90 border border-slate-600 rounded-t-xl pt-3 pb-2 text-center shadow-lg h-24 flex flex-col justify-between">
                  <span className="text-xl">🥈</span>
                  <div className="text-xs font-black text-slate-300">
                    {(teamRankings[1]?.totalBudget || 0).toLocaleString()}원
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">2위</span>
                </div>
              </div>

              {/* 1위 조 (골드) */}
              <div className="flex flex-col items-center">
                <div className="text-xs font-black text-amber-300 mb-1 flex items-center gap-1">
                  <span>🔥</span>
                  {teamRankings[0]?.teamName}
                </div>
                <div className="w-full bg-gradient-to-t from-amber-600/40 via-yellow-500/30 to-amber-400/20 border-2 border-amber-400 rounded-t-2xl pt-4 pb-2 text-center shadow-xl shadow-amber-500/20 h-32 flex flex-col justify-between">
                  <span className="text-3xl animate-bounce-slow">👑</span>
                  <div className="text-sm sm:text-base font-black text-amber-300">
                    {(teamRankings[0]?.totalBudget || 0).toLocaleString()}원
                  </div>
                  <span className="text-xs text-amber-200 font-black">1위 (우승 후보)</span>
                </div>
              </div>

              {/* 3위 조 */}
              <div className="flex flex-col items-center">
                <div className="text-xs font-bold text-slate-300 mb-1">
                  {teamRankings[2]?.teamName || '-'}
                </div>
                <div className="w-full bg-slate-800/70 border border-slate-700 rounded-t-xl pt-3 pb-2 text-center shadow-lg h-20 flex flex-col justify-between">
                  <span className="text-xl">🥉</span>
                  <div className="text-xs font-black text-amber-600/80">
                    {teamRankings[2] ? `${teamRankings[2].totalBudget.toLocaleString()}원` : '-'}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">3위</span>
                </div>
              </div>
            </div>
          )}

          {/* 전체 조 목록 카드 */}
          <div className="space-y-3">
            {teamRankings.map((team, idx) => {
              const isMyTeam = participant?.team === team.teamName;
              const isExpanded = expandedTeam === team.teamName;
              const maxBudget = teamRankings[0]?.totalBudget || 1;
              const percent = Math.max(10, Math.round((team.totalBudget / maxBudget) * 100));

              return (
                <div
                  key={team.teamName}
                  className={`glass-card rounded-2xl overflow-hidden transition-all border ${
                    isMyTeam
                      ? 'border-cyan-400/80 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                      : 'border-slate-700/60'
                  }`}
                >
                  <div
                    onClick={() => setExpandedTeam(isExpanded ? null : team.teamName)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                          team.rank === 1
                            ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                            : team.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : team.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {team.rank}위
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-base">
                            {team.teamName}
                          </span>
                          {isMyTeam && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-300 text-[10px] font-black border border-cyan-400/40">
                              우리 조
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          조원 {team.memberCount}명 • 총 {team.totalWins || 0}회 승리
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">총예산 합산</span>
                        <span className="text-lg font-black text-amber-300">
                          {team.totalBudget.toLocaleString()}원
                        </span>
                      </div>
                      <div className="text-slate-500 text-xs">
                        {isExpanded ? '▲' : '▼'}
                      </div>
                    </div>
                  </div>

                  {/* 기여도 비율 막대 */}
                  <div className="px-4 pb-2">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className={`h-full rounded-full ${
                          team.rank === 1 ? 'bg-amber-400' : 'bg-cyan-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* 아코디언: 조원별 상세 기여도 명단 */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-900/80 border-t border-slate-800 space-y-2">
                      <p className="text-xs font-bold text-slate-400 mb-2">
                        👥 {team.teamName} 조원별 기여 내역
                      </p>
                      {team.members.map((member, mIdx) => (
                        <div
                          key={member.id || mIdx}
                          className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-slate-800/40"
                        >
                          <span className="font-medium text-slate-200">
                            {member.name}
                            {member.id === participant?.id && (
                              <span className="text-cyan-400 font-bold ml-1">(나)</span>
                            )}
                          </span>
                          <span className="font-bold text-emerald-400">
                            {member.budget.toLocaleString()}원
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: 개인 MVP 랭킹 */}
      {activeTab === 'individual' && (
        <div className="w-full space-y-2.5">
          <p className="text-xs text-slate-400 mb-2">
            소수결에서 가장 많이 승리하여 예산을 획득한 상위 참가자들입니다.
          </p>
          {individualRankings.map((p, idx) => (
            <div
              key={p.id || idx}
              className={`p-3.5 rounded-xl glass-card flex items-center justify-between border ${
                p.id === participant?.id
                  ? 'border-cyan-400/80 bg-cyan-950/20'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center ${
                    idx === 0
                      ? 'bg-amber-400 text-slate-950'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-950'
                      : idx === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">
                      {p.name}
                    </span>
                    {p.id === participant?.id && (
                      <span className="text-[10px] text-cyan-400 font-bold">(나)</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {p.team} • 승리 {p.wins || 0}회
                  </span>
                </div>
              </div>

              <div className="text-right font-black text-sm text-emerald-400">
                {p.totalBudget.toLocaleString()}원
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: 라운드 히스토리 */}
      {activeTab === 'history' && (
        <div className="w-full space-y-3">
          {roundHistory.length > 0 ? (
            roundHistory.map((h, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl glass-card border border-slate-700/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-cyan-400 text-sm">
                    문제 {h.roundNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-black ${
                      h.isTie
                        ? 'bg-slate-700 text-slate-300'
                        : 'bg-amber-400 text-slate-950'
                    }`}
                  >
                    {h.isTie ? '무승부' : `[ ${h.winningOption} ] 승리`}
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex justify-between">
                  <span>투표 결과: A {h.countA}표 vs B {h.countB}표</span>
                  <span className="text-amber-300 font-bold">승자 {h.winners?.length || 0}명</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-xs text-slate-400">
              완료된 라운드 기록이 없습니다.
            </div>
          )}
        </div>
      )}

      {/* 하단 통계 바 */}
      <div className="mt-8 w-full p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-center text-xs text-slate-400">
        전체 누적 지급 예산: <span className="font-black text-amber-300 text-sm">{(summary.totalAwardedBudget || 0).toLocaleString()}원</span> (총 {summary.totalParticipants || 0}명 참가)
      </div>
    </div>
  );
}
