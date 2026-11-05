class GameManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.status = 'LOBBY'; // 'LOBBY' | 'VOTING' | 'ROUND_RESULT' | 'SUMMARY'
    this.currentQuestionIndex = 0; // 0-based: 문제 1은 index 0
    this.totalQuestions = 5; // 기본 5문제 (관리자가 조절 가능)
    
    // participants: Map of userId -> { id, name, team, totalBudget: 0, connected: true, socketId, roundWins: [] }
    this.participants = {};
    
    // currentRoundVotes: Map of userId -> 'A' | 'B'
    this.currentRoundVotes = {};
    
    // currentRoundResult: { roundNumber, countA, countB, winningOption, winners: [], isTie, rewardPerWinner }
    this.currentRoundResult = null;
    
    // history: Array of round results
    this.history = [];
    
    // 예산 설정: 승자 1인당 기본 100,000원 (또는 문제당 총풀 설정)
    this.settings = {
      rewardPerPerson: 100000, // 이긴 사람(소수인 사람) 1인당 지급 예산
      rewardType: 'per_person', // 'per_person' (소수 승자 1인당 고정) or 'split_pool' (총 상금 N등분)
      poolAmount: 500000 // split_pool일 때 라운드 총상금
    };
  }

  // 참가자 등록 또는 재접속
  registerParticipant(userId, name, team, socketId) {
    if (!userId || !name || !team) {
      return { success: false, message: '이름과 조를 입력해주세요.' };
    }

    const cleanTeam = team.trim();
    const cleanName = name.trim();

    if (this.participants[userId]) {
      this.participants[userId].name = cleanName;
      this.participants[userId].team = cleanTeam;
      this.participants[userId].socketId = socketId;
      this.participants[userId].connected = true;
    } else {
      this.participants[userId] = {
        id: userId,
        name: cleanName,
        team: cleanTeam,
        totalBudget: 0,
        roundWins: [], // 승리한 라운드 번호들
        connected: true,
        socketId: socketId,
        joinedAt: Date.now()
      };
    }

    return { success: true, participant: this.participants[userId] };
  }

  disconnectParticipant(socketId) {
    for (const userId in this.participants) {
      if (this.participants[userId].socketId === socketId) {
        this.participants[userId].connected = false;
        break;
      }
    }
  }

  removeParticipant(userId) {
    if (this.participants[userId]) {
      delete this.participants[userId];
      delete this.currentRoundVotes[userId];
      return true;
    }
    return false;
  }

  // 투표 제출 (한 번 제출하면 번복 불가!)
  submitVote(userId, choice) {
    if (this.status !== 'VOTING') {
      return { success: false, message: '현재 투표 진행 중이 아닙니다.' };
    }

    if (!['A', 'B'].includes(choice)) {
      return { success: false, message: 'A 또는 B를 선택해주세요.' };
    }

    if (!this.participants[userId]) {
      return { success: false, message: '참가자 정보를 찾을 수 없습니다.' };
    }

    // 투표 결과 번복 불가!
    if (this.currentRoundVotes[userId]) {
      return { success: false, message: '이미 투표를 완료하셨습니다. 투표 결과는 번복할 수 없습니다.' };
    }

    this.currentRoundVotes[userId] = choice;

    return { 
      success: true, 
      choice: choice,
      message: '투표가 완료되었습니다! 결과 발표를 기다려주세요.' 
    };
  }

  // 라운드(문제) 시작
  startRound(roundNumber = null) {
    if (roundNumber !== null && roundNumber >= 1) {
      this.currentQuestionIndex = roundNumber - 1;
      if (roundNumber > this.totalQuestions) {
        this.totalQuestions = roundNumber;
      }
    }

    this.status = 'VOTING';
    this.currentRoundVotes = {};
    this.currentRoundResult = null;

    return { 
      success: true, 
      roundNumber: this.currentQuestionIndex + 1,
      totalQuestions: this.totalQuestions 
    };
  }

  // 문제 당 결과 집계 및 공개 (소수결 계산)
  revealRoundResult() {
    if (this.status !== 'VOTING' && this.status !== 'ROUND_RESULT') {
      return { success: false, message: '현재 결과를 집계할 수 없는 상태입니다.' };
    }

    const roundNumber = this.currentQuestionIndex + 1;
    let countA = 0;
    let countB = 0;
    const votersA = [];
    const votersB = [];

    for (const [userId, choice] of Object.entries(this.currentRoundVotes)) {
      const participant = this.participants[userId];
      if (!participant) continue;

      const voterInfo = {
        id: participant.id,
        name: participant.name,
        team: participant.team,
        choice: choice
      };

      if (choice === 'A') {
        countA++;
        votersA.push(voterInfo);
      } else if (choice === 'B') {
        countB++;
        votersB.push(voterInfo);
      }
    }

    let winningOption = null;
    let winners = [];
    let isTie = false;

    // 소수결 로직: 투표수가 더 적은 쪽이 승리!
    if (countA === 0 && countB === 0) {
      isTie = true;
      winningOption = null;
    } else if (countA === countB) {
      isTie = true;
      winningOption = null; // 동점: 소수 없음 (무승부)
    } else if (countA < countB) {
      winningOption = 'A';
      winners = votersA;
    } else {
      winningOption = 'B';
      winners = votersB;
    }

    // 예산(상금) 계산
    let rewardPerWinner = 0;
    if (!isTie && winners.length > 0) {
      if (this.settings.rewardType === 'split_pool') {
        rewardPerWinner = Math.floor(this.settings.poolAmount / winners.length);
      } else {
        rewardPerWinner = this.settings.rewardPerPerson;
      }
    }

    // 승자들에게 예산 지급 (이전에 해당 라운드 결과가 확정되지 않았을 때만 누적)
    if (!this.currentRoundResult) {
      winners.forEach(winner => {
        if (this.participants[winner.id]) {
          this.participants[winner.id].totalBudget += rewardPerWinner;
          if (!this.participants[winner.id].roundWins.includes(roundNumber)) {
            this.participants[winner.id].roundWins.push(roundNumber);
          }
        }
      });
    }

    const winnersWithReward = winners.map(w => ({
      ...w,
      reward: rewardPerWinner
    }));

    const result = {
      roundNumber: roundNumber,
      totalVotes: countA + countB,
      countA: countA,
      countB: countB,
      votersA: votersA,
      votersB: votersB,
      winningOption: winningOption,
      winners: winnersWithReward, // 이긴 사람(소수인 사람들) 리스트!
      isTie: isTie,
      rewardPerWinner: rewardPerWinner,
      timestamp: Date.now()
    };

    this.currentRoundResult = result;
    this.status = 'ROUND_RESULT';

    // 히스토리 업데이트
    const existingIndex = this.history.findIndex(h => h.roundNumber === roundNumber);
    if (existingIndex >= 0) {
      this.history[existingIndex] = result;
    } else {
      this.history.push(result);
    }

    return { success: true, result: result };
  }

  // 다음 문제로 이동
  nextRound() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.totalQuestions) {
      this.totalQuestions = this.currentQuestionIndex + 1;
    }
    return this.startRound();
  }

  // 이전 문제로 이동
  prevRound() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      return this.startRound();
    }
    return { success: false, message: '첫 번째 문제입니다.' };
  }

  // 중간 집계 화면으로 전환
  showSummary() {
    this.status = 'SUMMARY';
    return { success: true, summary: this.getSummaryData() };
  }

  // 로비로 이동
  goToLobby() {
    this.status = 'LOBBY';
    return { success: true };
  }

  // 조별 총예산 및 개인별 합산 집계 계산
  getSummaryData() {
    const teamBudgets = {}; // teamName -> { teamName, totalBudget, memberCount, members: [] }
    const allParticipants = Object.values(this.participants);

    allParticipants.forEach(p => {
      const teamName = p.team || '미지정';
      if (!teamBudgets[teamName]) {
        teamBudgets[teamName] = {
          teamName: teamName,
          totalBudget: 0,
          memberCount: 0,
          totalWins: 0,
          members: []
        };
      }

      teamBudgets[teamName].totalBudget += (p.totalBudget || 0);
      teamBudgets[teamName].memberCount += 1;
      teamBudgets[teamName].totalWins += (p.roundWins ? p.roundWins.length : 0);
      teamBudgets[teamName].members.push({
        id: p.id,
        name: p.name,
        budget: p.totalBudget || 0,
        wins: p.roundWins ? p.roundWins.length : 0
      });
    });

    // 조별 순위 정렬 (예산 높은 순 -> 승리 횟수 순)
    const teamRankings = Object.values(teamBudgets).sort((a, b) => {
      if (b.totalBudget !== a.totalBudget) {
        return b.totalBudget - a.totalBudget;
      }
      return b.totalWins - a.totalWins;
    });

    let currentRank = 1;
    for (let i = 0; i < teamRankings.length; i++) {
      if (i > 0 && teamRankings[i].totalBudget < teamRankings[i - 1].totalBudget) {
        currentRank = i + 1;
      }
      teamRankings[i].rank = currentRank;
      teamRankings[i].members.sort((a, b) => b.budget - a.budget);
    }

    // 개인별 순위 (MVP)
    const individualRankings = [...allParticipants]
      .sort((a, b) => (b.totalBudget || 0) - (a.totalBudget || 0))
      .map((p, index) => ({
        id: p.id,
        name: p.name,
        team: p.team,
        totalBudget: p.totalBudget || 0,
        wins: p.roundWins ? p.roundWins.length : 0,
        rank: index + 1
      }));

    const totalAwardedBudget = allParticipants.reduce((sum, p) => sum + (p.totalBudget || 0), 0);

    return {
      teamRankings: teamRankings,
      individualRankings: individualRankings,
      totalAwardedBudget: totalAwardedBudget,
      totalParticipants: allParticipants.length,
      currentRound: this.currentQuestionIndex + 1,
      totalQuestions: this.totalQuestions,
      completedRounds: this.history.length,
      roundHistory: this.history
    };
  }

  // 참가자용 상태 반환
  // ★ 중요: 투표 직후 결과 알 수 없음!
  getPublicState(requestUserId = null) {
    const totalParticipants = Object.keys(this.participants).length;
    const votedCount = Object.keys(this.currentRoundVotes).length;

    const userVote = requestUserId ? this.currentRoundVotes[requestUserId] : null;
    const hasVoted = Boolean(userVote);

    // ROUND_RESULT일 때만 결과 데이터 전달
    let roundResult = null;
    if (this.status === 'ROUND_RESULT') {
      roundResult = this.currentRoundResult;
    }

    // SUMMARY일 때만 중간 집계 데이터 전달
    let summaryData = null;
    if (this.status === 'SUMMARY') {
      summaryData = this.getSummaryData();
    }

    return {
      status: this.status,
      roundNumber: this.currentQuestionIndex + 1,
      totalQuestions: this.totalQuestions,
      totalParticipants: totalParticipants,
      votedCount: votedCount,
      hasVoted: hasVoted,
      myChoice: userVote, // 본인이 누른 것만 (A 또는 B)
      roundResult: roundResult,
      summary: summaryData,
      settings: {
        rewardPerPerson: this.settings.rewardPerPerson
      }
    };
  }

  // 관리자용 상태 반환
  getAdminState() {
    const publicState = this.getPublicState();
    const summary = this.getSummaryData();

    return {
      ...publicState,
      participants: Object.values(this.participants),
      rawVotes: this.currentRoundVotes,
      history: this.history,
      summary: summary,
      settings: this.settings
    };
  }

  updateSettings(settings) {
    if (settings) {
      if (settings.rewardPerPerson !== undefined) {
        this.settings.rewardPerPerson = Number(settings.rewardPerPerson);
      }
      if (settings.rewardType !== undefined) {
        this.settings.rewardType = settings.rewardType;
      }
      if (settings.poolAmount !== undefined) {
        this.settings.poolAmount = Number(settings.poolAmount);
      }
      if (settings.totalQuestions !== undefined) {
        this.totalQuestions = Number(settings.totalQuestions);
      }
    }
    return { success: true, settings: this.settings };
  }
}

module.exports = GameManager;
