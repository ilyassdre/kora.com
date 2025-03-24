import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Clock, Radius as Stadium, Activity, Globe2, Search, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  time: string;
  stadium: string;
  league: string;
  isNational?: boolean;
  isLive: boolean;
  minute?: number;
  events?: string[];
  confederation?: string;
}

const confederations = {
  AFC: 'آسيا',
  CAF: 'أفريقيا',
  CONCACAF: 'الكونكاكاف',
  CONMEBOL: 'أمريكا الجنوبية',
  OFC: 'أوقيانوسيا',
  UEFA: 'أوروبا'
};

const leagues = [
  // World Cup
  'تصفيات كأس العالم - آسيا',
  'تصفيات كأس العالم - أفريقيا',
  'تصفيات كأس العالم - أوروبا',
  'تصفيات كأس العالم - أمريكا الجنوبية',
  'تصفيات كأس العالم - الكونكاكاف',
  'تصفيات كأس العالم - أوقيانوسيا',
  // Middle East
  'الدوري السعودي',
  'دوري أبطال آسيا',
  'كأس الملك',
  'الدوري المصري',
  'دوري أبطال أفريقيا',
  'الدوري الإماراتي',
  'الدوري القطري',
  // European Leagues
  'الدوري الإنجليزي',
  'الدوري الإسباني',
  'الدوري الإيطالي',
  'الدوري الألماني',
  'الدوري الفرنسي',
  'دوري أبطال أوروبا',
  // National Teams
  'كأس آسيا',
  'كأس أمم أفريقيا',
  'كأس أمم أوروبا',
  'كأس أمريكا الجنوبية'
];

const initialMatches: Match[] = [
  {
    id: 1,
    homeTeam: 'الهلال',
    awayTeam: 'النصر',
    homeScore: 2,
    awayScore: 1,
    date: '2024-03-20',
    time: '20:00',
    stadium: 'استاد الملك فهد الدولي',
    league: 'الدوري السعودي',
    isLive: true,
    minute: 75,
    events: ['د.75 - هجمة خطيرة للهلال', 'د.73 - تسديدة قوية من النصر']
  },
  {
    id: 2,
    homeTeam: 'السعودية',
    awayTeam: 'عمان',
    homeScore: 3,
    awayScore: 1,
    date: '2024-03-20',
    time: '19:00',
    stadium: 'استاد الملك عبدالله',
    league: 'تصفيات كأس العالم - آسيا',
    isNational: true,
    isLive: true,
    minute: 60,
    confederation: 'AFC',
    events: ['د.60 - ركلة ركنية للسعودية', 'د.58 - تبديل: دخول سالم الدوسري']
  },
  {
    id: 3,
    homeTeam: 'مانشستر سيتي',
    awayTeam: 'ريال مدريد',
    homeScore: 2,
    awayScore: 2,
    date: '2024-03-20',
    time: '22:00',
    stadium: 'الاتحاد',
    league: 'دوري أبطال أوروبا',
    isLive: true,
    minute: 85,
    events: ['د.85 - فرصة خطيرة لريال مدريد', 'د.82 - بطاقة صفراء']
  },
  {
    id: 4,
    homeTeam: 'المغرب',
    awayTeam: 'السنغال',
    homeScore: 1,
    awayScore: 0,
    date: '2024-03-20',
    time: '21:00',
    stadium: 'محمد الخامس',
    league: 'تصفيات كأس العالم - أفريقيا',
    isNational: true,
    isLive: true,
    confederation: 'CAF',
    minute: 55,
    events: ['د.55 - هدف للمغرب!', 'د.52 - تصدي رائع من الحارس المغربي']
  },
  {
    id: 5,
    homeTeam: 'إسبانيا',
    awayTeam: 'كرواتيا',
    homeScore: 2,
    awayScore: 1,
    date: '2024-03-20',
    time: '21:45',
    stadium: 'سانتياغو برنابيو',
    league: 'تصفيات كأس العالم - أوروبا',
    isNational: true,
    isLive: true,
    confederation: 'UEFA',
    minute: 65,
    events: ['د.65 - تبديل في المنتخب الإسباني', 'د.60 - هدف لإسبانيا!']
  }
];

const possibleEvents = [
  'تسديدة على المرمى',
  'ركلة ركنية',
  'تسلل',
  'مخالفة',
  'بطاقة صفراء',
  'فرصة خطيرة',
  'تبديل',
  'هجمة مرتدة',
  'تصدي رائع من الحارس',
  'ركلة حرة مباشرة',
  'ضغط متواصل',
  'استحواذ قوي',
  'محاولة تسديد',
  'اعتراض على قرار الحكم',
  'إصابة وتدخل الجهاز الطبي'
];

function App() {
  const [selectedLeague, setSelectedLeague] = useState<string>('الكل');
  const [selectedConfederation, setSelectedConfederation] = useState<string>('الكل');
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNationalOnly, setShowNationalOnly] = useState(false);
  const [showWorldCupOnly, setShowWorldCupOnly] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMatches(prevMatches => 
        prevMatches.map(match => {
          if (match.isLive && match.minute) {
            const newMinute = match.minute + 1;
            if (newMinute > 90) {
              return { ...match, isLive: false };
            }

            let newEvents = match.events || [];
            if (Math.random() < 0.2) {
              const newEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
              newEvents = [`د.${newMinute} - ${newEvent}`, ...newEvents].slice(0, 5);
            }

            let newHomeScore = match.homeScore;
            let newAwayScore = match.awayScore;
            if (Math.random() < 0.05) {
              if (Math.random() < 0.5) {
                newHomeScore++;
                newEvents = [`د.${newMinute} - هدف! ${match.homeTeam}`, ...newEvents].slice(0, 5);
              } else {
                newAwayScore++;
                newEvents = [`د.${newMinute} - هدف! ${match.awayTeam}`, ...newEvents].slice(0, 5);
              }
            }

            return {
              ...match,
              minute: newMinute,
              events: newEvents,
              homeScore: newHomeScore,
              awayScore: newAwayScore
            };
          }
          return match;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredMatches = matches.filter(match => {
    const matchesSearch = 
      match.homeTeam.includes(searchQuery) || 
      match.awayTeam.includes(searchQuery) || 
      match.league.includes(searchQuery);
    
    const matchesLeague = selectedLeague === 'الكل' || match.league === selectedLeague;
    const matchesNational = !showNationalOnly || match.isNational;
    const matchesWorldCup = !showWorldCupOnly || match.league.includes('تصفيات كأس العالم');
    const matchesConfederation = selectedConfederation === 'الكل' || match.confederation === selectedConfederation;

    return matchesSearch && matchesLeague && matchesNational && matchesWorldCup && matchesConfederation;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 text-white" dir="rtl">
      <header className="bg-black/30 p-6 sticky top-0 z-10 backdrop-blur-sm">
        <div className="container mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-8 w-8" />
              <h1 className="text-2xl font-bold">نتائج المباريات</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowWorldCupOnly(!showWorldCupOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  showWorldCupOnly 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                <Globe2 className="h-5 w-5" />
                <span>تصفيات كأس العالم</span>
              </button>
              <button
                onClick={() => setShowNationalOnly(!showNationalOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  showNationalOnly 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                <Flag className="h-5 w-5" />
                <span>المنتخبات فقط</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="ابحث عن فريق أو دوري..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white pr-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-blue-300" />
                <select 
                  value={selectedConfederation}
                  onChange={(e) => setSelectedConfederation(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white min-w-[150px]"
                >
                  <option value="الكل">كل القارات</option>
                  {Object.entries(confederations).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-300" />
                <select 
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white min-w-[200px]"
                >
                  <option value="الكل">جميع الدوريات</option>
                  {leagues.map(league => (
                    <option key={league} value={league}>{league}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid gap-6">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-12 bg-white/10 rounded-xl">
              <p className="text-xl text-gray-300">لا توجد مباريات تطابق بحثك</p>
            </div>
          ) : (
            filteredMatches.map(match => (
              <div 
                key={match.id}
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition ${
                  match.isLive ? 'border-2 border-green-400' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {match.isNational && (
                      <Flag className="h-5 w-5 text-yellow-400" />
                    )}
                    <h3 className="text-xl font-semibold text-green-300">{match.league}</h3>
                    {match.confederation && (
                      <span className="text-sm text-blue-300">({confederations[match.confederation as keyof typeof confederations]})</span>
                    )}
                    {match.isLive && (
                      <div className="flex items-center gap-2 bg-green-500 px-2 py-1 rounded-full text-sm">
                        <Activity className="h-4 w-4 animate-pulse" />
                        <span>الدقيقة {match.minute}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm" dir="ltr">
                        {format(new Date(match.date), 'dd MMM yyyy', { locale: ar })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{match.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1 text-center">
                    <div className="text-xl font-bold">{match.homeTeam}</div>
                    <div className={`text-3xl font-bold ${match.isLive ? 'text-green-400' : 'text-white'} mt-2`}>
                      {match.homeScore}
                    </div>
                  </div>
                  <div className="px-4 text-2xl font-bold">-</div>
                  <div className="flex-1 text-center">
                    <div className="text-xl font-bold">{match.awayTeam}</div>
                    <div className={`text-3xl font-bold ${match.isLive ? 'text-green-400' : 'text-white'} mt-2`}>
                      {match.awayScore}
                    </div>
                  </div>
                </div>

                {match.isLive && match.events && match.events.length > 0 && (
                  <div className="mt-4 bg-black/20 rounded-lg p-4">
                    <h4 className="text-sm font-semibold mb-2 text-green-300">آخر الأحداث:</h4>
                    <ul className="space-y-2">
                      {match.events.map((event, index) => (
                        <li key={index} className="text-sm text-gray-300">{event}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-center gap-2 text-gray-300">
                  <Stadium className="h-4 w-4" />
                  <span className="text-sm">{match.stadium}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default App;