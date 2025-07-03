import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import NeumorphicCard from '../components/ui/NeumorphicCard';
import NeumorphicButton from '../components/ui/NeumorphicButton';
import { User, Settings, Bell, Target, Calendar, Smartphone } from 'lucide-react';

const DriverProfile = () => {
  const { state, dispatch } = useFinancial();
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    name: 'נהג מקצועי',
    reviewFrequency: 'weekly',
    mindsetType: 'balanced',
    trackingMethod: 'manual',
    monthlyBudget: state.monthlyBudget,
    notifications: {
      budgetAlerts: true,
      goalReminders: true,
      monthlyReports: true
    }
  });

  const handleSaveProfile = () => {
    dispatch({
      type: 'SET_MONTHLY_BUDGET',
      payload: profileData.monthlyBudget
    });
    // Here you would normally save to backend
  };

  const tabs = [
    { id: 'profile', label: 'פרופיל', icon: <User className="w-5 h-5" /> },
    { id: 'preferences', label: 'העדפות', icon: <Settings className="w-5 h-5" /> },
    { id: 'notifications', label: 'התראות', icon: <Bell className="w-5 h-5" /> },
    { id: 'goals', label: 'מטרות', icon: <Target className="w-5 h-5" /> }
  ];

  const mindsetTypes = [
    { value: 'conservative', label: 'שמרני', description: 'מעדיף בטיחות ויציבות' },
    { value: 'balanced', label: 'מאוזן', description: 'איזון בין חיסכון להוצאות' },
    { value: 'aggressive', label: 'אגרסיבי', description: 'מוכן לקחת סיכונים למטרות גדולות' }
  ];

  const reviewFrequencies = [
    { value: 'daily', label: 'יומי', description: 'בדיקה יומית קצרה' },
    { value: 'weekly', label: 'שבועי', description: 'סיכום שבועי מפורט' },
    { value: 'monthly', label: 'חודשי', description: 'דו"ח חודשי מקיף' }
  ];

  const trackingMethods = [
    { value: 'manual', label: 'ידני', description: 'רישום ידני של כל עסקה' },
    { value: 'spreadsheet', label: 'אקסל', description: 'שימוש בגיליונות אלקטרוניים' },
    { value: 'bank-sync', label: 'סנכרון בנק', description: 'חיבור אוטומטי לחשבון הבנק' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          פרופיל הנהג
        </h1>
        <p className="text-gray-600">
          התאם את החוויה הפיננסית שלך
        </p>
      </div>

      {/* Profile Header */}
      <NeumorphicCard>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-neu">
            {profileData.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800">
              {profileData.name}
            </h2>
            <p className="text-gray-600 mb-2">
              רמה {Math.floor(state.badges.filter(b => b.earned).length / 2) + 1} • {state.badges.filter(b => b.earned).length} תגים
            </p>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>📊 {profileData.trackingMethod === 'manual' ? 'רישום ידני' : profileData.trackingMethod === 'spreadsheet' ? 'אקסל' : 'סנכרון בנק'}</span>
              <span>🎯 {profileData.mindsetType === 'conservative' ? 'שמרני' : profileData.mindsetType === 'balanced' ? 'מאוזן' : 'אגרסיבי'}</span>
              <span>📅 {profileData.reviewFrequency === 'daily' ? 'יומי' : profileData.reviewFrequency === 'weekly' ? 'שבועי' : 'חודשי'}</span>
            </div>
          </div>
        </div>
      </NeumorphicCard>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'shadow-inner-neu bg-blue-50 text-blue-600'
                : 'shadow-neu bg-gray-100 text-gray-600 hover:shadow-neu-hover'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'profile' && (
          <NeumorphicCard>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              פרטי פרופיל
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שם
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 rounded-lg shadow-inner-neu focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  תקציב חודשי
                </label>
                <input
                  type="number"
                  value={profileData.monthlyBudget}
                  onChange={(e) => setProfileData({ ...profileData, monthlyBudget: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-50 rounded-lg shadow-inner-neu focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סוג הנהג הפיננסי
                </label>
                <div className="space-y-2">
                  {mindsetTypes.map(type => (
                    <label key={type.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-inner-neu cursor-pointer hover:bg-gray-100">
                      <input
                        type="radio"
                        name="mindsetType"
                        value={type.value}
                        checked={profileData.mindsetType === type.value}
                        onChange={(e) => setProfileData({ ...profileData, mindsetType: e.target.value })}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-medium text-gray-800">{type.label}</div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </NeumorphicCard>
        )}

        {activeTab === 'preferences' && (
          <NeumorphicCard>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              העדפות שימוש
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  תדירות סקירה
                </label>
                <div className="space-y-2">
                  {reviewFrequencies.map(freq => (
                    <label key={freq.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-inner-neu cursor-pointer hover:bg-gray-100">
                      <input
                        type="radio"
                        name="reviewFrequency"
                        value={freq.value}
                        checked={profileData.reviewFrequency === freq.value}
                        onChange={(e) => setProfileData({ ...profileData, reviewFrequency: e.target.value })}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-medium text-gray-800">{freq.label}</div>
                        <div className="text-sm text-gray-600">{freq.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שיטת מעקב מועדפת
                </label>
                <div className="space-y-2">
                  {trackingMethods.map(method => (
                    <label key={method.value} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-inner-neu cursor-pointer hover:bg-gray-100">
                      <input
                        type="radio"
                        name="trackingMethod"
                        value={method.value}
                        checked={profileData.trackingMethod === method.value}
                        onChange={(e) => setProfileData({ ...profileData, trackingMethod: e.target.value })}
                        className="text-blue-600"
                      />
                      <div>
                        <div className="font-medium text-gray-800">{method.label}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </NeumorphicCard>
        )}

        {activeTab === 'notifications' && (
          <NeumorphicCard>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              הגדרות התראות
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-inner-neu">
                <div>
                  <div className="font-medium text-gray-800">התראות תקציב</div>
                  <div className="text-sm text-gray-600">קבל התראה כאשר מתקרב לסיום התקציב</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.notifications.budgetAlerts}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      notifications: { ...profileData.notifications, budgetAlerts: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-inner-neu">
                <div>
                  <div className="font-medium text-gray-800">תזכורות מטרות</div>
                  <div className="text-sm text-gray-600">תזכורות להתקדמות במטרות הפיננסיות</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.notifications.goalReminders}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      notifications: { ...profileData.notifications, goalReminders: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-inner-neu">
                <div>
                  <div className="font-medium text-gray-800">דו"חות חודשיים</div>
                  <div className="text-sm text-gray-600">קבל סיכום חודשי של הפעילות הפיננסית</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileData.notifications.monthlyReports}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      notifications: { ...profileData.notifications, monthlyReports: e.target.checked }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </NeumorphicCard>
        )}

        {activeTab === 'goals' && (
          <NeumorphicCard>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ניהול מטרות
            </h3>
            <div className="space-y-4">
              {state.goals.map(goal => (
                <div key={goal.id} className="p-4 bg-gray-50 rounded-lg shadow-inner-neu">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{goal.title}</h4>
                    <span className="text-sm text-gray-600">
                      {((goal.current / goal.target) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full mb-2">
                    <div
                      className="absolute top-0 right-0 h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{goal.current.toLocaleString('he-IL')} ₪</span>
                    <span>{goal.target.toLocaleString('he-IL')} ₪</span>
                  </div>
                </div>
              ))}
              <NeumorphicButton className="w-full" variant="primary">
                הוסף מטרה חדשה
              </NeumorphicButton>
            </div>
          </NeumorphicCard>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <NeumorphicButton onClick={handleSaveProfile} variant="primary">
          שמור הגדרות
        </NeumorphicButton>
      </div>
    </div>
  );
};

export default DriverProfile;