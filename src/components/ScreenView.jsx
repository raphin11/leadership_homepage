import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function ScreenView({
  gameState
}) {
  const { lang, toggleLang, t } = useLanguage();
  const [accessUrl, setAccessUrl] = useState(window.location.origin);

  const status = gameState?.status || 'LOBBY';
  const roundNumber = gameState?.roundNumber || 1;
  const votedCount = gameState?.votedCount || 0;
  const totalCount = gameState?.totalParticipants || 0;
  const result = gameState?.roundResult;
  const summary = gameState?.summary;

  // 접속 URL 로드
  useEffect(() => {
    fetch(`/api/qr?host=${encodeURIComponent(window.location.host)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setAccessUrl(data.url);
        }
      })
      .catch((err) => console.error('Connection info fetch error:', err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12">
      {/* 상단 전광판 헤더 */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950">
            ⚖️
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t('screen.title')}
            </h1>
            <p className="text-xs text-slate-400">
              {t('screen.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 언어 토글 버튼 */}
          <button
            onClick={toggleLang}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title={lang === 'ko' ? 'Switch to English' : '한국어로 변경'}
          >
            <span>🌐</span>
            <span className="font-extrabold">{lang === 'ko' ? 'English' : '한국어'}</span>
          </button>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm">
            <span>👥</span>
            <span className="text-slate-400">{t('screen.totalParticipants')}</span>
            <span className="font-black text-cyan-300">{totalCount}{t('common.person')}</span>
          </div>
        </div>
      </header>

      {/* 메인 본문 컨텐츠 (상태별) */}
      <main className="flex-1 flex flex-col items-center justify-center py-8">
        {/* 1. LOBBY 상태: 접속 URL 및 입장 안내 */}
        {status === 'LOBBY' && (
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-base font-extrabold animate-pulse">
              <span>✨</span>
              {t('screen.waitingLobby')}
            </div>

            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              {t('screen.connectMobileTitle')}
            </h2>

            {/* 접속 주소 안내 카드 */}
            <div className="w-full p-8 sm:p-10 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/10 flex flex-col items-center space-y-4">
              <span className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest">
                {t('screen.browserUrlLabel')}
              </span>
              <div className="px-6 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-2xl sm:text-4xl font-mono font-black text-cyan-300 select-all tracking-wide">
                {accessUrl}
              </div>
              <p className="text-sm text-slate-400">
                {t('screen.browserGuide')}
              </p>
            </div>
          </div>
        )}

        {/* 2. VOTING 상태: 투표 진행 중 화면 */}
        {status === 'VOTING' && (
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto w-full space-y-8">
            <div className="px-6 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-lg font-black tracking-wide">
              {t('screen.votingInProgress', { round: roundNumber })}
            </div>

            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              {t('screen.chooseGuide')}
            </h2>

            {/* 투표 진행 프로그레스 바 */}
            <div className="w-full glass-card p-8 rounded-3xl border border-slate-700/80 space-y-4">
              <div className="flex justify-between items-center text-base sm:text-lg font-black text-slate-300">
                <span>{t('screen.votedCountLabel')}</span>
                <span className="text-cyan-400 text-2xl font-black">
                  {votedCount} / {totalCount}{t('common.person')} ({totalCount > 0 ? Math.round((votedCount / totalCount) * 100) : 0}%)
                </span>
              </div>

              <div className="w-full h-8 bg-slate-900 rounded-2xl overflow-hidden p-1 border border-slate-800">
                <div
                  style={{ width: `${totalCount > 0 ? (votedCount / totalCount) * 100 : 0}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl transition-all duration-500"
                />
              </div>

              <p className="text-xs text-slate-400 pt-2">
                {t('screen.secrecyNote')}
              </p>
            </div>
          </div>
        )}

        {/* 3. ROUND_RESULT 상태: 문제 당 결과 화면 (소수 승자 리스트 대형 출력) */}
        {status === 'ROUND_RESULT' && result && (
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto w-full space-y-8">
            <div className="px-5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-base font-black">
              {t('screen.resultRevealTitle', { round: result.roundNumber })}
            </div>

            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              {result.isTie ? t('result.tie') : (
                <>{t('result.minorityWin', { option: '' })}<span className={result.winningOption === 'A' ? 'text-cyan-400' : 'text-rose-400'}>[ {result.winningOption} ]</span></>
              )}
            </h2>

            {/* A vs B 득표 비교 대형 전광판 바 */}
            <div className="w-full glass-card p-6 rounded-3xl border border-slate-700/80 space-y-3">
              <div className="flex justify-between text-base font-extrabold">
                <span className="text-cyan-400">
                  {t('result.optionA')} : {result.countA}{t('common.votes')} {result.winningOption === 'A' && t('screen.winnerCrown')}
                </span>
                <span className="text-rose-400">
                  {result.winningOption === 'B' && t('screen.winnerCrown')} {t('result.optionB')} : {result.countB}{t('common.votes')}
                </span>
              </div>

              <div className="relative h-14 bg-slate-900 rounded-2xl overflow-hidden flex border border-slate-800">
                <div
                  style={{ width: `${result.totalVotes > 0 ? Math.round((result.countA / result.totalVotes) * 100) : 50}%` }}
                  className={`h-full flex items-center justify-start pl-6 font-black text-xl transition-all duration-700 ${
                    result.winningOption === 'A' ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-300/50' : 'bg-cyan-950 text-cyan-400'
                  }`}
                >
                  A ({result.countA}{t('common.person')})
                </div>
                <div
                  style={{ width: `${result.totalVotes > 0 ? Math.round((result.countB / result.totalVotes) * 100) : 50}%` }}
                  className={`h-full flex items-center justify-end pr-6 font-black text-xl transition-all duration-700 ${
                    result.winningOption === 'B' ? 'bg-rose-500 text-slate-950 ring-4 ring-rose-300/50' : 'bg-rose-950 text-rose-400'
                  }`}
                >
                  B ({result.countB}{t('common.person')})
                </div>
              </div>
            </div>

            {/* ★ 핵심 요구사항: 이긴 사람(소수인 사람들) 리스트 대형 스크린 출력 */}
            <div className="w-full glass-card p-8 rounded-3xl border border-amber-400/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎖️</span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {t('screen.winnersListTitle')}
                  </h3>
                </div>
                <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-sm">
                  {t('screen.rewardPerWinnerTag', { reward: (result.rewardPerWinner || 0).toLocaleString() })}
                </span>
              </div>

              {result.winners?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pt-2">
                  {result.winners.map((winner, idx) => (
                    <div
                      key={winner.id || idx}
                      className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-col items-center justify-center text-center shadow-lg"
                    >
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-xs font-black mb-1">
                        {winner.team}
                      </span>
                      <span className="text-base sm:text-lg font-black text-white">
                        {winner.name}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-slate-400 text-base">
                  {t('result.tieNoWinners')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. SUMMARY 상태: 벨겜 종료 후 중간집계 대형 랭킹 전광판 */}
        {status === 'SUMMARY' && summary && (
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto w-full space-y-8">
            <div className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/20">
              {t('screen.summaryHeader')}
            </div>

            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              {t('screen.currentFirstPlace')} <span className="text-amber-300 font-black">{summary.teamRankings?.[0]?.teamName}</span>
            </h2>

            {/* 조별 총예산 랭킹 대형 그리드 */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.teamRankings?.map((team) => (
                <div
                  key={team.teamName}
                  className={`p-6 rounded-3xl glass-card border flex flex-col justify-between text-left transition-all ${
                    team.rank === 1
                      ? 'border-amber-400 shadow-2xl shadow-amber-500/20 bg-amber-950/20 scale-102 ring-2 ring-amber-400'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`w-10 h-10 rounded-2xl font-black text-base flex items-center justify-center ${
                        team.rank === 1
                          ? 'bg-amber-400 text-slate-950'
                          : team.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : team.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t('screen.rankDisplay', { rank: team.rank })}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">
                      {t('screen.teamDetails', { count: team.memberCount, wins: team.totalWins || 0 })}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-2xl font-black text-white mb-1">
                      {team.teamName}
                    </h4>
                    <div className="text-3xl font-black text-amber-300 tracking-tight">
                      {team.totalBudget.toLocaleString()}{t('common.currency')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="text-center text-xs text-slate-500 border-t border-slate-900 pt-4">
        {t('screen.footer')}
      </footer>
    </div>
  );
}
