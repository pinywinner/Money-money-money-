import React from 'react';
import { useFinancial } from '../context/FinancialContext';
import NeumorphicCard from '../components/ui/NeumorphicCard';
import NeumorphicButton from '../components/ui/NeumorphicButton';
import { Trophy, Star, Target, Clock, CheckCircle, Lock } from 'lucide-react';

const RaceChallenges = () => {
  const { state } = useFinancial();

  // Calculate user points
  const earnedBadges = state.badges.filter(b => b.earned);
  const totalPoints = earnedBadges.length * 100;

  // Active challenges
  const activeChallenges = [
    {
      id: 'budget-champion',
      title: 'אלוף התקציב',
      description: 'הקפד על התקציב החודשי במשך 30 יום',
      progress: 23,
      target: 30,
      reward: 150,
      icon: <Target className="w-6 h-6" />,
      type: 'daily' as const,
      difficulty: 'medium' as const
    },
    {
      id: 'savings-master',
      title: 'מאסטר חיסכון',
      description: 'חסוך מעל 20% מההכנסה החודשית',
      progress: 15,
      target: 20,
      reward: 200,
      icon: <Star className="w-6 h-6" />,
      type: 'monthly' as const,
      difficulty: 'hard' as const
    },
    {
      id: 'tracker-pro',
      title: 'מקצועי מעקב',
      description: 'תעד כל עסקה במשך 7 יום ברצף',
      progress: 7,
      target: 7,
      reward: 100,
      icon: <CheckCircle className="w-6 h-6" />,
      type: 'weekly' as const,
      difficulty: 'easy' as const,
      completed: true
    }
  ];

  // Upcoming challenges
  const upcomingChallenges = [
    {
      id: 'goal-achiever',
      title: 'משיג מטרות',
      description: 'השג יעד פיננסי שהגדרת',
      reward: 300,
      icon: <Trophy className="w-6 h-6" />,
      difficulty: 'hard' as const,
      unlockLevel: 5
    },
    {
      id: 'category-king',
      title: 'מלך הקטגוריות',
      description: 'נהל 5 קטגוריות שונות בחודש אחד',
      reward: 120,
      icon: <Star className="w-6 h-6" />,
      difficulty: 'medium' as const,
      unlockLevel: 3
    }
  ];

  const currentLevel = Math.floor(totalPoints / 500) + 1;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-500';
      case 'weekly': return 'bg-purple-500';
      case 'monthly': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          אתגרי המירוץ
        </h1>
        <p className="text-gray-600">
          השג הישגים והרוויח נקודות בדרך להצלחה פיננסית
        </p>
      </div>

      {/* User Progress */}
      <NeumorphicCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-neu">
              {currentLevel}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                רמה {currentLevel}
              </h2>
              <p className="text-gray-600">
                {earnedBadges.length} תגים הושגו
              </p>
            </div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-blue-600">
              {totalPoints.toLocaleString('he-IL')}
            </div>
            <div className="text-sm text-gray-600">נקודות</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg shadow-inner-neu">
            <div className="text-lg font-bold text-blue-600">{activeChallenges.length}</div>
            <div className="text-sm text-gray-600">אתגרים פעילים</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg shadow-inner-neu">
            <div className="text-lg font-bold text-green-600">{earnedBadges.length}</div>
            <div className="text-sm text-gray-600">תגים הושגו</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg shadow-inner-neu">
            <div className="text-lg font-bold text-purple-600">{upcomingChallenges.length}</div>
            <div className="text-sm text-gray-600">אתגרים חדשים</div>
          </div>
        </div>
      </NeumorphicCard>

      {/* Active Challenges */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          אתגרים פעילים
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeChallenges.map(challenge => (
            <NeumorphicCard key={challenge.id}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full shadow-inner-neu bg-gray-50 flex items-center justify-center text-blue-600`}>
                    {challenge.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{challenge.title}</h3>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty === 'easy' ? 'קל' : challenge.difficulty === 'medium' ? 'בינוני' : 'קשה'}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getTypeColor(challenge.type)}`} />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>התקדמות</span>
                  <span>{challenge.progress}/{challenge.target}</span>
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full shadow-inner-neu">
                  <div
                    className="absolute top-0 right-0 h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-800">
                    {challenge.reward} נקודות
                  </span>
                </div>
                {challenge.completed ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">הושלם!</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    {((challenge.progress / challenge.target) * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            </NeumorphicCard>
          ))}
        </div>
      </div>

      {/* Upcoming Challenges */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          אתגרים חדשים
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingChallenges.map(challenge => (
            <NeumorphicCard key={challenge.id} className="opacity-75">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full shadow-inner-neu bg-gray-50 flex items-center justify-center text-gray-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{challenge.title}</h3>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty === 'easy' ? 'קל' : challenge.difficulty === 'medium' ? 'בינוני' : 'קשה'}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-800">
                    {challenge.reward} נקודות
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  נפתח ברמה {challenge.unlockLevel}
                </div>
              </div>
            </NeumorphicCard>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          תגים שהושגו
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {state.badges.map(badge => (
            <NeumorphicCard key={badge.id} className={!badge.earned ? 'opacity-50' : ''}>
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl ${
                  badge.earned ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-neu' : 'bg-gray-200 text-gray-400'
                }`}>
                  {badge.earned ? '🏆' : '🔒'}
                </div>
                <h3 className="font-medium text-gray-800 mb-1">{badge.name}</h3>
                <p className="text-xs text-gray-600">{badge.description}</p>
                {badge.earned && badge.earnedDate && (
                  <p className="text-xs text-green-600 mt-2">
                    הושג: {badge.earnedDate.toLocaleDateString('he-IL')}
                  </p>
                )}
              </div>
            </NeumorphicCard>
          ))}
        </div>
      </div>

      {/* Leaderboard Teaser */}
      <NeumorphicCard>
        <div className="text-center py-8">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            לוח תוצאות
          </h3>
          <p className="text-gray-600 mb-4">
            השווה את ההישגים שלך עם חברים (בקרוב)
          </p>
          <NeumorphicButton variant="secondary">
            בקרוב
          </NeumorphicButton>
        </div>
      </NeumorphicCard>
    </div>
  );
};

export default RaceChallenges;