import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Header from './components/Header';
import JoinScreen from './components/JoinScreen';
import VotingScreen from './components/VotingScreen';
import RoundResultScreen from './components/RoundResultScreen';
import SummaryScreen from './components/SummaryScreen';
import AdminPanel from './components/AdminPanel';
import ScreenView from './components/ScreenView';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // 사용자 세션 정보 (LocalStorage 유지)
  const [userId, setUserId] = useState(() => {
    let id = localStorage.getItem('lh_user_id');
    if (!id) {
      id = 'u_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('lh_user_id', id);
    }
    return id;
  });

  const [participant, setParticipant] = useState(() => {
    const saved = localStorage.getItem('lh_participant');
    return saved ? JSON.parse(saved) : null;
  });

  // 게임 상태
  const [gameState, setGameState] = useState({
    status: 'LOBBY',
    roundNumber: 1,
    totalQuestions: 5,
    totalParticipants: 0,
    votedCount: 0,
    hasVoted: false,
    myChoice: null,
    roundResult: null,
    summary: null
  });

  // 관리자 상태
  const [adminState, setAdminState] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // 뷰 모드: 'participant' | 'screen' | 'admin'
  const [viewMode, setViewMode] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'screen') return 'screen';
    if (urlParams.get('mode') === 'admin') return 'admin';
    return 'participant';
  });

  // Socket.IO 연결
  useEffect(() => {
    const s = io({
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    s.on('connect', () => {
      setConnected(true);

      // 이미 저장된 참가자가 있다면 자동 join
      if (participant && userId) {
        s.emit('join', {
          userId,
          name: participant.name,
          team: participant.team
        });
      } else {
        s.emit('sync_state', { userId });
      }

      // 관리자 로그인 토큰이 있다면 자동 연결
      const savedAdminPw = sessionStorage.getItem('lh_admin_pw');
      if (savedAdminPw) {
        s.emit('admin_connect', { password: savedAdminPw });
      }
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('joined', ({ participant: p, gameState: gs }) => {
      setParticipant(p);
      localStorage.setItem('lh_participant', JSON.stringify(p));
      if (gs) setGameState(gs);
    });

    s.on('state_update', (newState) => {
      setGameState(newState);
    });

    s.on('global_state_update', (newState) => {
      setGameState((prev) => ({
        ...newState,
        hasVoted: prev.hasVoted,
        myChoice: prev.myChoice
      }));
    });

    s.on('vote_success', ({ choice, message, gameState: gs }) => {
      if (gs) setGameState(gs);
    });

    s.on('vote_error', ({ message }) => {
      alert(`⚠️ ${message}`);
    });

    // 관리자 이벤트
    s.on('admin_auth_success', ({ adminState: as }) => {
      setIsAdminLoggedIn(true);
      setAdminState(as);
      setShowAdminLoginModal(false);
      setAdminLoginError('');
      sessionStorage.setItem('lh_admin_pw', adminPasswordInput || sessionStorage.getItem('lh_admin_pw') || 'admin1234');
    });

    s.on('admin_auth_failed', ({ message }) => {
      setAdminLoginError(message || '비밀번호가 올바르지 않습니다.');
    });

    s.on('admin_state_update', (as) => {
      setAdminState(as);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [userId]);

  // 참가자 등록 핸들러
  const handleJoin = (name, team) => {
    if (!socket) return;
    socket.emit('join', { userId, name, team });
  };

  // 투표 제출 핸들러
  const handleSubmitVote = (choice) => {
    if (!socket || !userId) return;
    socket.emit('submit_vote', { userId, choice });
  };

  // 관리자 액션 핸들러
  const handleAdminAction = (action, payload = null) => {
    if (!socket) return;
    const password = sessionStorage.getItem('lh_admin_pw');
    socket.emit('admin_action', { action, payload, password });
  };

  // 관리자 로그인 핸들러
  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    if (!socket) return;
    socket.emit('admin_connect', { password: adminPasswordInput });
  };

  // 관리자 로그아웃
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('lh_admin_pw');
    setViewMode('participant');
  };

  // 참가자 정보 초기화
  const handleResetParticipant = () => {
    if (window.confirm('이름과 조를 변경하시겠습니까?')) {
      localStorage.removeItem('lh_participant');
      setParticipant(null);
    }
  };

  // 전광판(Screen) 뷰 모드일 때는 전광판 컴포넌트 렌더링
  if (viewMode === 'screen') {
    return (
      <div className="relative">
        {/* 헤더 툴바 (화면 전환용) */}
        <Header
          viewMode={viewMode}
          setViewMode={setViewMode}
          participant={participant}
          onResetParticipant={handleResetParticipant}
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        />
        <ScreenView gameState={gameState} />
      </div>
    );
  }

  // 관리자 뷰 모드일 때
  if (viewMode === 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 pb-16">
        <Header
          viewMode={viewMode}
          setViewMode={setViewMode}
          participant={participant}
          onResetParticipant={handleResetParticipant}
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        />

        {isAdminLoggedIn ? (
          <AdminPanel
            adminState={adminState}
            onAdminAction={handleAdminAction}
            onLogout={handleAdminLogout}
          />
        ) : (
          <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
            <span className="text-4xl block mx-auto">🛡️</span>
            <h2 className="text-xl font-bold text-white">진행자 로그인이 필요합니다</h2>
            <button
              onClick={() => setShowAdminLoginModal(true)}
              className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black cursor-pointer"
            >
              관리자 로그인 창 열기
            </button>
          </div>
        )}
      </div>
    );
  }

  // 기본: 참가자(모바일) 뷰 모드
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pb-8">
      {/* 상단 네비게이션 헤더 */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        participant={participant}
        onResetParticipant={handleResetParticipant}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
      />

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 w-full">
        {/* 1. 참가자 등록 전 -> 이름, 조 입력 화면 */}
        {!participant ? (
          <JoinScreen onJoin={handleJoin} />
        ) : (
          /* 2. 등록 후 -> 게임 상태별 화면 렌더링 */
          <>
            {/* LOBBY 상태: 투표 대기 화면 */}
            {gameState.status === 'LOBBY' && (
              <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-8 text-center max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-3xl shadow-lg border border-cyan-500/30 animate-pulse-slow">
                  ⏳
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    투표 대기 중입니다
                  </h2>
                  <p className="text-sm text-slate-400 mt-2">
                    <span className="font-bold text-cyan-300">[{participant.team}] {participant.name}</span>님 환영합니다!<br />
                    진행자가 PPT 문제를 공개하고 투표를 시작할 때까지 잠시 대기해주세요.
                  </p>
                </div>

                <div className="p-4 rounded-2xl glass-card border border-slate-700/60 w-full text-xs text-slate-300 space-y-2 text-left">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <span>✨</span> 투표 시 주의사항
                  </div>
                  <p>• PPT의 문제를 보고 <span className="text-cyan-300 font-bold">A</span> 또는 <span className="text-rose-400 font-bold">B</span> 버튼을 누릅니다.</p>
                  <p>• <span className="text-rose-400 font-bold">투표 직후 결과는 알 수 없습니다.</span></p>
                  <p>• <span className="text-rose-400 font-bold">한 번 투표하면 번복할 수 없습니다.</span></p>
                  <p>• 소수가 되어 승리하면 조 총예산에 상금이 합산됩니다!</p>
                </div>
              </div>
            )}

            {/* VOTING 상태: 투표 화면 (A vs B) */}
            {gameState.status === 'VOTING' && (
              <VotingScreen
                roundNumber={gameState.roundNumber}
                totalQuestions={gameState.totalQuestions}
                hasVoted={gameState.hasVoted}
                myChoice={gameState.myChoice}
                votedCount={gameState.votedCount}
                totalParticipants={gameState.totalParticipants}
                onSubmitVote={handleSubmitVote}
                participant={participant}
              />
            )}

            {/* ROUND_RESULT 상태: 문제별 결과 화면 (소수 승자 리스트) */}
            {gameState.status === 'ROUND_RESULT' && (
              <RoundResultScreen
                result={gameState.roundResult}
                participant={participant}
                myChoice={gameState.myChoice}
              />
            )}

            {/* SUMMARY 상태: 조별 총예산 중간집계 화면 */}
            {gameState.status === 'SUMMARY' && (
              <SummaryScreen
                summary={gameState.summary}
                participant={participant}
              />
            )}
          </>
        )}
      </main>

      {/* 관리자 로그인 모달 */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-card rounded-2xl p-6 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
              <span>🛡️</span>
              진행자 관리자 로그인
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              기본 비밀번호: <span className="font-mono text-cyan-400 font-bold">admin1234</span>
            </p>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500 font-medium"
                  autoFocus
                />
                {adminLoginError && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {adminLoginError}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLoginModal(false);
                    setAdminLoginError('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-extrabold cursor-pointer"
                >
                  로그인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
