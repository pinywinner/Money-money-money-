import React from 'react';
import { AnalysisInsight } from '../../utils/analysisEngine';
import { AlertTriangle, TrendingUp, Trophy, Target, Lightbulb } from 'lucide-react';

interface InsightCardProps {
  insight: AnalysisInsight;
  onActionClick?: (action: string) => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onActionClick }) => {
  const getIcon = () => {
    switch (insight.type) {
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'opportunity':
        return <TrendingUp className="w-6 h-6 text-blue-500" />;
      case 'achievement':
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 'prediction':
        return <Target className="w-6 h-6 text-purple-500" />;
      case 'recommendation':
        return <Lightbulb className="w-6 h-6 text-green-500" />;
      default:
        return <Lightbulb className="w-6 h-6 text-gray-500" />;
    }
  };

  const getBorderColor = () => {
    switch (insight.type) {
      case 'warning':
        return 'border-r-red-500';
      case 'opportunity':
        return 'border-r-blue-500';
      case 'achievement':
        return 'border-r-yellow-500';
      case 'prediction':
        return 'border-r-purple-500';
      case 'recommendation':
        return 'border-r-green-500';
      default:
        return 'border-r-gray-500';
    }
  };

  const getPriorityColor = () => {
    switch (insight.priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = () => {
    switch (insight.priority) {
      case 'critical':
        return 'קריטי';
      case 'high':
        return 'גבוה';
      case 'medium':
        return 'בינוני';
      case 'low':
        return 'נמוך';
      default:
        return 'רגיל';
    }
  };

  return (
    <div className={`shadow-neu bg-gray-100 rounded-xl p-6 border-r-4 ${getBorderColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full shadow-inner-neu bg-gray-50 flex items-center justify-center">
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{insight.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor()}`}>
                {getPriorityText()}
              </span>
            </div>
            <p className="text-gray-600 mb-3">{insight.description}</p>
          </div>
        </div>
        
        <div className="text-left">
          <div className="text-sm text-gray-500 mb-1">השפעה</div>
          <div className="flex items-center gap-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < insight.impact ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(insight.confidence * 100)}% ביטחון
          </div>
        </div>
      </div>

      {insight.actionItems && insight.actionItems.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-2">פעולות מומלצות:</h4>
          <div className="space-y-2">
            {insight.actionItems.map((action, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-inner-neu"
              >
                <span className="text-sm text-gray-700">{action}</span>
                {onActionClick && (
                  <button
                    onClick={() => onActionClick(action)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    בצע
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {insight.category && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-500">קטגוריה: {insight.category}</span>
        </div>
      )}
    </div>
  );
};

export default InsightCard;