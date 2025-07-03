import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Gauge, 
  BookOpen, 
  BarChart3, 
  Calendar, 
  Trophy, 
  User,
  Settings,
  LogOut
} from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Gauge, label: 'קוקפיט', description: 'מבט כללי על המצב הפיננסי' },
    { path: '/transactions', icon: BookOpen, label: 'עסקאות', description: 'יומן הכנסות והוצאות' },
    { path: '/analysis', icon: BarChart3, label: 'ניתוח', description: 'ניתוח הוצאות מפורט' },
    { path: '/summary', icon: Calendar, label: 'סיכום', description: 'סיכום חודשי' },
    { path: '/challenges', icon: Trophy, label: 'אתגרים', description: 'משחקים ותגים' },
    { path: '/profile', icon: User, label: 'פרופיל', description: 'הגדרות אישיות' }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex lg:fixed lg:right-0 lg:top-0 lg:h-full lg:w-80 bg-white shadow-neu flex-col z-10">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-neu flex items-center justify-center">
              <Gauge className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">הקוקפיט הכלכלי</h1>
              <p className="text-sm text-gray-600">נהיגה פיננסית מקצועית</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-4 p-4 rounded-xl transition-all duration-200 nav-item-hover ${
                  isActive 
                    ? 'shadow-inner-neu bg-blue-50 text-blue-600' 
                    : 'shadow-neu bg-gray-100 text-gray-600 hover:shadow-neu-hover hover:text-gray-800'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-50 text-gray-500 group-hover:bg-gray-200'
                }`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.label}</div>
                  <div className="text-xs text-gray-500 mt-1 truncate">{item.description}</div>
                </div>
                {isActive && (
                  <div className="w-1 h-8 bg-blue-500 rounded-full shadow-neu active-indicator" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="w-full flex items-center gap-4 p-3 rounded-xl shadow-neu bg-gray-100 text-gray-600 hover:shadow-neu-hover hover:text-gray-800 transition-all">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <Settings size={16} />
            </div>
            <span className="font-medium">הגדרות</span>
          </button>
          <button className="w-full flex items-center gap-4 p-3 rounded-xl shadow-neu bg-gray-100 text-gray-600 hover:shadow-neu-hover hover:text-red-600 transition-all">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
              <LogOut size={16} />
            </div>
            <span className="font-medium">יציאה</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-neu z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 min-w-0 ${
                    isActive 
                      ? 'text-blue-600 bg-blue-50 shadow-inner-neu' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs mt-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;