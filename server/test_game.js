const GameManager = require('./gameManager');
const assert = require('assert');

console.log('--- 밸런스 게임 및 중간집계 단위 테스트 시작 ---');
const game = new GameManager();

// 1. 참가자 등록 (이름, 조)
console.log('1. 참가자 등록 테스트...');
const p1 = game.registerParticipant('u1', '홍길동', '1조', 'sock_1');
const p2 = game.registerParticipant('u2', '김철수', '1조', 'sock_2');
const p3 = game.registerParticipant('u3', '이영희', '2조', 'sock_3');
const p4 = game.registerParticipant('u4', '박민수', '2조', 'sock_4');
const p5 = game.registerParticipant('u5', '최강자', '3조', 'sock_5');

assert.strictEqual(Object.keys(game.participants).length, 5, '참가자 5명 등록');
console.log('✅ 참가자 5명 등록 완료');

// 2. 문제 1 라운드 시작
console.log('2. 문제 1 라운드 시작...');
game.startRound(1);
assert.strictEqual(game.status, 'VOTING');
assert.strictEqual(game.currentQuestionIndex, 0);
console.log('✅ 문제 1 라운드 시작 완료 (status: VOTING)');

// 3. 투표 직후 결과 알 수 없음 검증
console.log('3. 투표 및 결과 비공개 & 번복 불가 검증...');
const v1 = game.submitVote('u1', 'A');
assert.strictEqual(v1.success, true);

// 번복 불가 시도
const v1_retry = game.submitVote('u1', 'B');
assert.strictEqual(v1_retry.success, false, '재투표 불가해야 함');
console.log('✅ 투표 번복 차단 확인:', v1_retry.message);

// 나머지 투표
game.submitVote('u2', 'A');
game.submitVote('u3', 'B'); // 소수!
game.submitVote('u4', 'A');
game.submitVote('u5', 'A');

// 일반 참가자 공개 상태 확인 (결과 절대 노출 안 됨)
const publicStateU1 = game.getPublicState('u1');
assert.strictEqual(publicStateU1.hasVoted, true);
assert.strictEqual(publicStateU1.myChoice, 'A');
assert.strictEqual(publicStateU1.roundResult, null, '투표 중에는 roundResult가 null이어야 함');
assert.strictEqual(publicStateU1.votedCount, 5);
console.log('✅ 투표 직후 결과 알 수 없음 검증 완료 (A/B 비율 비공개)');

// 4. 문제 1 결과 공개
console.log('4. 문제 1 결과 공개 (소수결 승자 확인)...');
const res1 = game.revealRoundResult();
assert.strictEqual(res1.success, true);
assert.strictEqual(game.status, 'ROUND_RESULT');
assert.strictEqual(res1.result.countA, 4);
assert.strictEqual(res1.result.countB, 1);
assert.strictEqual(res1.result.winningOption, 'B', '소수인 B가 승리');
assert.strictEqual(res1.result.winners.length, 1);
assert.strictEqual(res1.result.winners[0].name, '이영희');
assert.strictEqual(res1.result.winners[0].team, '2조');
assert.strictEqual(res1.result.rewardPerWinner, 100000);
console.log('✅ 문제 1 소수결 결과: B 승리, 승자 [2조] 이영희 (+100,000원)');

// 5. 문제 2 진행
console.log('5. 문제 2 진행...');
game.nextRound();
assert.strictEqual(game.status, 'VOTING');
assert.strictEqual(game.currentQuestionIndex, 1);

game.submitVote('u1', 'B'); // 소수!
game.submitVote('u2', 'A');
game.submitVote('u3', 'A');
game.submitVote('u4', 'A');
game.submitVote('u5', 'A');

const res2 = game.revealRoundResult();
assert.strictEqual(res2.result.winningOption, 'B');
assert.strictEqual(res2.result.winners[0].name, '홍길동');
assert.strictEqual(res2.result.winners[0].team, '1조');
console.log('✅ 문제 2 소수결 결과: B 승리, 승자 [1조] 홍길동 (+100,000원)');

// 6. 벨겜 종료 후 중간집계 검증
console.log('6. 조별 총예산 합산 및 중간집계 검증...');
game.showSummary();
assert.strictEqual(game.status, 'SUMMARY');
const summary = game.getSummaryData();

console.log('조별 랭킹 결과:');
summary.teamRankings.forEach(t => {
  console.log(`- ${t.rank}위: [${t.teamName}] 총예산 ${t.totalBudget.toLocaleString()}원 (조원 ${t.memberCount}명)`);
});

// 검증
const team1 = summary.teamRankings.find(t => t.teamName === '1조');
const team2 = summary.teamRankings.find(t => t.teamName === '2조');
const team3 = summary.teamRankings.find(t => t.teamName === '3조');

assert.strictEqual(team1.totalBudget, 100000, '1조 총예산 100,000원');
assert.strictEqual(team2.totalBudget, 100000, '2조 총예산 100,000원');
assert.strictEqual(team3.totalBudget, 0, '3조 총예산 0원');
assert.strictEqual(summary.totalAwardedBudget, 200000, '전체 누적 200,000원');
console.log('✅ 조별 총예산 합산 및 중간집계 정상 동작 확인 완료!');
console.log('🎉 모든 테스트 통과!');
