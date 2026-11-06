const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const os = require('os');
const GameManager = require('./gameManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '6767';

const game = new GameManager();

app.use(cors());
app.use(express.json());

// 로컬 IP 주소 탐색 (스마트폰 접속 안내용)
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// 클라이언트 빌드 산출물 정적 서빙
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// API: 현재 게임 상태
app.get('/api/state', (req, res) => {
  res.json(game.getPublicState());
});

// API: 스마트폰 접속용 URL 정보 제공
app.get('/api/qr', (req, res) => {
  const host = req.query.host || `${getLocalIpAddress()}:${PORT}`;
  const url = host.startsWith('http') ? host : `http://${host}`;
  res.json({ url });
});

// 관리자 인증 API
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: 'auth-token-' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: '비밀번호가 올바르지 않습니다.' });
  }
});

// Socket.IO 통신
io.on('connection', (socket) => {
  let currentUserId = null;
  let isAdmin = false;

  // 1. 참가자 참가/재접속
  socket.on('join', ({ userId, name, team }) => {
    currentUserId = userId;
    const result = game.registerParticipant(userId, name, team, socket.id);
    
    if (result.success) {
      socket.emit('joined', {
        participant: result.participant,
        gameState: game.getPublicState(userId)
      });

      // 전체 상태 브로드캐스트
      broadcastState();
    } else {
      socket.emit('join_error', { message: result.message });
    }
  });

  // 2. 투표 제출 (한 번 제출하면 번복 불가!)
  socket.on('submit_vote', ({ userId, choice }) => {
    const effectiveUserId = userId || currentUserId;
    if (!effectiveUserId) {
      return socket.emit('vote_error', { message: '참가자 정보가 없습니다.' });
    }

    const voteResult = game.submitVote(effectiveUserId, choice);
    if (voteResult.success) {
      // 본인에게 투표 완료 상태 전달 (결과는 절대 노출 안 함)
      socket.emit('vote_success', {
        choice: voteResult.choice,
        message: voteResult.message,
        gameState: game.getPublicState(effectiveUserId)
      });

      // 다른 사람들에게는 투표 인원수 업데이트만 브로드캐스트 (A/B 선택값은 절대 알 수 없음)
      broadcastState();
    } else {
      socket.emit('vote_error', { message: voteResult.message });
    }
  });

  // 3. 상태 동기화 요청
  socket.on('sync_state', ({ userId }) => {
    const targetUserId = userId || currentUserId;
    socket.emit('state_update', game.getPublicState(targetUserId));
  });

  // 4. 관리자 전용 채널
  socket.on('admin_connect', ({ password }) => {
    if (password === ADMIN_PASSWORD) {
      isAdmin = true;
      socket.join('admin_room');
      socket.emit('admin_auth_success', {
        adminState: game.getAdminState()
      });
    } else {
      socket.emit('admin_auth_failed', { message: '비밀번호가 일치하지 않습니다.' });
    }
  });

  // 관리자 액션 처리기
  socket.on('admin_action', ({ action, payload, password }) => {
    if (!isAdmin && password !== ADMIN_PASSWORD) {
      return socket.emit('admin_error', { message: '권한이 없습니다.' });
    }

    switch (action) {
      case 'start_round':
        game.startRound(payload?.questionIndex);
        break;
      case 'reveal_result':
        game.revealRoundResult();
        break;
      case 'next_round':
        game.nextRound();
        break;
      case 'prev_round':
        game.prevRound();
        break;
      case 'show_summary':
        game.showSummary();
        break;
      case 'go_to_lobby':
        game.goToLobby();
        break;
      case 'reset_game':
        game.reset();
        break;
      case 'add_question':
        game.addQuestion(payload);
        break;
      case 'edit_question':
        game.editQuestion(payload?.id, payload);
        break;
      case 'delete_question':
        game.deleteQuestion(payload?.id);
        break;
      case 'update_questions':
        game.updateQuestions(payload?.questions);
        break;
      case 'update_settings':
        game.updateSettings(payload?.settings);
        break;
      case 'remove_participant':
        game.removeParticipant(payload?.userId);
        break;
      default:
        return socket.emit('admin_error', { message: '알 수 없는 관리자 동작입니다.' });
    }

    // 상태 변경 후 모든 클라이언트 및 관리자에게 실시간 브로드캐스트
    broadcastState();
  });

  // 5. 연결 해제
  socket.on('disconnect', () => {
    game.disconnectParticipant(socket.id);
    broadcastState();
  });
});

// 모든 클라이언트와 관리자에게 상태 전파
function broadcastState() {
  // 1. 일반 참가자들에게 개별 상태 전송 (각자의 투표 여부 및 선택값 반영)
  for (const [userId, participant] of Object.entries(game.participants)) {
    if (participant.socketId) {
      io.to(participant.socketId).emit('state_update', game.getPublicState(userId));
    }
  }

  // 2. 미등록/방문자 소켓들에게 기본 공개 상태 전송
  io.emit('global_state_update', game.getPublicState(null));

  // 3. 관리자 룸에 상세 관리 상태 전송
  io.to('admin_room').emit('admin_state_update', game.getAdminState());
}

// SPA fallback for routing
app.get('*path', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`🚀 Minority Game (소수결 게임) Server Started!`);
  console.log(`📡 Local:   http://localhost:${PORT}`);
  console.log(`🌐 Network: http://${getLocalIpAddress()}:${PORT}`);
  console.log(`🔑 Admin PW: ${ADMIN_PASSWORD}`);
  console.log(`===============================================`);
});
