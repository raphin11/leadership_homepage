module.exports = [
  {
    id: 'q1',
    title: '리더십 밸런스 게임 #1',
    description: '어떤 팀원과 함께 일하시겠습니까?',
    optionA: { id: 'A', text: '일은 진짜 잘하는데 성격이 너무 까칠한 팀원' },
    optionB: { id: 'B', text: '성격은 천사인데 일 처리가 너무 답답한 팀원' },
    rewardAmount: 100000, // 승자 1인당 기본 예산 (또는 풀)
    rewardType: 'per_person' // 'per_person' (승자당 고정) or 'split_pool' (총액 1/N)
  },
  {
    id: 'q2',
    title: '리더십 밸런스 게임 #2',
    description: '리더로서 피하고 싶은 최악의 상황은?',
    optionA: { id: 'A', text: '내 모든 기획과 공을 가로채는 유능한 상사' },
    optionB: { id: 'B', text: '권한은 다 넘기면서 책임질 땐 쏙 빠지는 무능한 상사' },
    rewardAmount: 100000,
    rewardType: 'per_person'
  },
  {
    id: 'q3',
    title: '근무 조건 밸런스 게임 #3',
    description: '당신의 선택은?',
    optionA: { id: 'A', text: '평생 100% 재택근무 (단, 연봉 15% 삭감)' },
    optionB: { id: 'B', text: '평생 주5일 9 to 6 출근 (단, 연봉 20% 인상)' },
    rewardAmount: 100000,
    rewardType: 'per_person'
  },
  {
    id: 'q4',
    title: '인생 밸런스 게임 #4',
    description: '둘 중 하나를 무조건 골라야 한다면?',
    optionA: { id: 'A', text: '내가 모든 사람의 마음속 생각을 읽을 수 있는 능력' },
    optionB: { id: 'B', text: '모든 사람이 내 생각에 무조건 설득당하는 말빨' },
    rewardAmount: 100000,
    rewardType: 'per_person'
  },
  {
    id: 'q5',
    title: '회식 밸런스 게임 #5',
    description: '금요일 저녁, 더 나은 회식은?',
    optionA: { id: 'A', text: '1인 30만원 최고급 한우 오마카세 (단, 대표님 옆자리)' },
    optionB: { id: 'B', text: '동네 치맥집 (단, 법카 주고 대표님은 즉시 귀가)' },
    rewardAmount: 150000,
    rewardType: 'per_person'
  }
];
