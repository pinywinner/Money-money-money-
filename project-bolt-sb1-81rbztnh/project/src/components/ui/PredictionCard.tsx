import React from 'react';
import { PredictiveInsight } from '../../utils/analysisEngine';
import { TrendingUp, TrendingDown, AlertCircle, Target } from 'lucide-react';

interface PredictionCardProps {
  prediction: PredictiveInsight;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ prediction }) => {
  const getIcon = () => {
    switch (prediction.type) {
      case 'cash_flow':
        return prediction.prediction.includes('עודף') ? 
          <TrendingUp className="w-6 h-6 text-green-500" /> : 
          <TrendingDown className="w-6 h-6 text-red-500" />;
      case 'budget_breach':
        return <AlertCircle className="w-6 h-6 text-orange-500" />;
      case 'goal_achievement':
        return <Target className="w-6 h-6 text-blue-500" />;
      case 'lifestyle_creep':
        return <TrendingUp className="w-6 h-6 text-yellow-500" />;
      default:
        return <TrendingUp className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (prediction.type) {
      case 'cash_flow':
        return 'תחזית תזרים מזומנים';
      case 'budget_breach':
        return 'אזהרת תקציב';
      case 'goal_achievement':
        return 'תחזית השגת יעדים';
      case 'lifestyle_creep':
        return 'זיהוי זחילת סגנון חיים';
      default:
        return 'תחזית כללית';
    }
  };

  const getConfidenceColor = () => {
    if (prediction.confidence >= 0.8) return 'text-green-600';
    if (prediction.confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="shadow-neu bg-gray-100 rounded-xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full shadow-inner-neu bg-gray-50 flex items-center justify-center">
          {getIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{getTypeLabel()}</h3>
            <div className="text-left">
              <div className="text-sm text-gray-500">רמת ביטחון</div>
              <div className={`text-sm font-medium ${getConfidenceColor()}`}>
                {Math.round(prediction.confidence * 100)}%
              </div>
            </div>
          </div>
          <p className="text-gray-600 mb-2">{prediction.prediction}</p>
          <div className="text-sm text-gray-500">
            <span className="font-medium">מסגרת זמן:</span> {prediction.timeframe}
          </div>
        </div>
      </div>

      {prediction.recommendedActions && prediction.recommendedActions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3">פעולות מומלצות:</h4>
          <div className="space-y-2">
            {prediction.recommendedActions.map((action, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-inner-neu"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                <span className="text-sm text-gray-700">{action}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">דיוק התחזית</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < Math.round(prediction.confidence * 5) ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionCard;