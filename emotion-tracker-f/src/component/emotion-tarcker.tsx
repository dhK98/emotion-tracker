import React, { useState } from 'react';
import { Calendar, User, Heart, Smile, Meh, Frown, Angry, X } from 'lucide-react';
import { useAuthStore } from '../common/auth/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../common/api/axios.service';

interface User {
   id: string;
   name: string;
}

interface EmotionData {
   [date: string]: {
      emotion: string;
      reason?: string;
   };
}

type EmotionType = 'very-happy' | 'happy' | 'neutral' | 'sad' | 'angry';

const emotions = {
   'very-happy': { label: '매우 기쁨', color: '#10B981', icon: Heart },
   happy: { label: '기쁨', color: '#3B82F6', icon: Smile },
   neutral: { label: '보통', color: '#6B7280', icon: Meh },
   sad: { label: '우울', color: '#F59E0B', icon: Frown },
   angry: { label: '화남', color: '#EF4444', icon: Angry },
};

const EmotionTracker: React.FC = () => {
   const [todayEmotion, setTodayEmotion] = useState<EmotionType | null>(null);
   const [todayReason, setTodayReason] = useState('');
   const [emotionData, setEmotionData] = useState<EmotionData>({});
   const [selectedDate, setSelectedDate] = useState<string | null>(null);
   
   // 수정된 부분 1: useState의 초깃값을 'false'로 명확하게 설정합니다.
   const [reasonToggle, setReasonToggle] = useState(false);

   // 현재 날짜 정보
   const today = new Date();
   const currentYear = today.getFullYear();
   const currentMonth = today.getMonth();
   const todayDateString = today.toISOString().split('T')[0];

   const logout = useAuthStore((state)=>state.logout)
   const navigate = useNavigate();
   const user = useAuthStore((state)=>state.user)


   // 오늘의 감정 설정
   const handleSetTodayEmotion = (emotion: EmotionType) => {
      setTodayEmotion(emotion);
      // 수정된 부분 2: 감정을 선택할 때만 토글을 true로 설정합니다.
      setReasonToggle(true);
   };

   // 감정 저장
   const handleSaveEmotion = () => {
      if (todayEmotion) {
         requestCreateEmotionAPI(todayEmotion, todayReason);
         setEmotionData(prev => ({
            ...prev,
            [todayDateString]: {
               emotion: todayEmotion,
               reason: todayReason.trim(),
            },
         }));
         setTodayReason('');
         setReasonToggle(false);
      }
   };

   const requestCreateEmotionAPI = async (emotion: EmotionType, reason: string) => {
      const response = await api.post('/emotion', {
         emotion,
         reason
      })
      return response.data;
   };

   // 날짜 클릭 처리 (데이터가 있는 경우만)
   const handleDateClick = (dateString: string) => {
      if (emotionData[dateString]) {
         setSelectedDate(dateString);
      }
   };

   // 달력 데이터 생성
   const generateCalendarDays = () => {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startDay = firstDay.getDay();

      const days = [];

      // 이전 달의 빈 칸들
      for (let i = 0; i < startDay; i++) {
         days.push(null);
      }

      // 현재 달의 날짜들
      for (let day = 1; day <= daysInMonth; day++) {
         const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(
            2,
            '0',
         )}`;
         const emotionEntry = emotionData[dateString];
         days.push({
            day,
            dateString,
            emotion: emotionEntry?.emotion as EmotionType | undefined,
            reason: emotionEntry?.reason,
            isToday: dateString === todayDateString,
         });
      }

      return days;
   };

   const calendarDays = generateCalendarDays();
   const monthName = new Date(currentYear, currentMonth).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
   });

   // 감정 통계 계산
   const getEmotionStats = () => {
      const stats: { [key in EmotionType]: number } = {
         'very-happy': 0,
         happy: 0,
         neutral: 0,
         sad: 0,
         angry: 0,
      };

      Object.values(emotionData).forEach(entry => {
         if (entry && entry.emotion && entry.emotion in stats) {
            stats[entry.emotion as EmotionType]++;
         }
      });

      return stats;
   };

   const emotionStats = getEmotionStats();

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
         {/* 헤더 */}
         <header className="bg-white shadow-sm border-b">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
               <div className="flex items-center space-x-3">
                  <Heart className="w-8 h-8 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-800">감정 다이어리</h1>
               </div>
               <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">{user!.name}</span>
                  <button onClick={() => {
                     logout()
                     navigate('/login')
                  }} className="text-sm text-gray-500 hover:text-gray-700">
                     로그아웃
                  </button>
               </div>
            </div>
         </header>

         <div className="max-w-6xl mx-auto px-4 py-8">
            {/* 오늘의 감정 설정 */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
               <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  오늘의 감정은 어떠신가요? ({today.toLocaleDateString('ko-KR')})
               </h2>

               {/* 감정 선택 */}
               <div className="grid grid-cols-5 gap-4 mb-6">
                  {Object.entries(emotions).map(([key, emotion]) => {
                     const IconComponent = emotion.icon;
                     const isSelected = todayEmotion === key;
                     return (
                        <button
                           key={key}
                           onClick={() => {
                              handleSetTodayEmotion(key as EmotionType);
                           }}
                           className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                              isSelected
                                 ? 'border-blue-500 bg-blue-50 scale-105'
                                 : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                           }`}>
                           <div className="flex flex-col items-center space-y-2">
                              <div
                                 className="w-12 h-12 rounded-full flex items-center justify-center"
                                 style={{ backgroundColor: emotion.color + '20' }}>
                                 <IconComponent className="w-6 h-6" style={{ color: emotion.color }} />
                              </div>
                              <span className="text-sm font-medium text-gray-700">{emotion.label}</span>
                           </div>
                        </button>
                     );
                  })}
               </div>

               {/* 이유 입력 */}
               {todayEmotion && reasonToggle && (
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                           이유를 간단히 적어주세요 (선택사항)
                        </label>
                        <textarea
                           value={todayReason}
                           onChange={e => setTodayReason(e.target.value)}
                           placeholder="오늘 이런 감정을 느낀 이유가 있나요?"
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                           rows={3}
                        />
                     </div>
                     <button
                        onClick={handleSaveEmotion}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        저장하기
                     </button>
                  </div>
               )}
            </div>

            {/* 대시보드 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* 달력 */}
               <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        {monthName}
                     </h2>
                  </div>

                  {/* 요일 헤더 */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                     {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                           {day}
                        </div>
                     ))}
                  </div>

                  {/* 달력 날짜들 */}
                  <div className="grid grid-cols-7 gap-2">
                     {calendarDays.map((dayData, index) => {
                        if (!dayData) {
                           return <div key={index} className="aspect-square"></div>;
                        }

                        const { day, emotion, reason, isToday, dateString } = dayData;
                        const emotionColor = emotion ? emotions[emotion].color : 'transparent';
                        const hasData = !!emotion;

                        return (
                           <button
                              key={day}
                              onClick={() => handleDateClick(dateString)}
                              disabled={!hasData}
                              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                                 hasData ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
                              } ${
                                 isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                              } ${
                                 emotion
                                    ? 'text-white shadow-sm hover:shadow-md'
                                    : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                              }`}
                              style={{
                                 backgroundColor: emotionColor,
                              }}
                              title={emotion ? `${emotions[emotion].label}${reason ? `: ${reason}` : ''} (클릭하여 상세보기)` : ''}>
                              {day}
                           </button>
                        );
                     })}
                  </div>

                  {/* 범례 */}
                  <div className="mt-6 pt-4 border-t">
                     <div className="flex flex-wrap gap-3">
                        {Object.entries(emotions).map(([key, emotion]) => (
                           <div key={key} className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded" style={{ backgroundColor: emotion.color }}></div>
                              <span className="text-xs text-gray-600">{emotion.label}</span>
                           </div>
                        ))}
                     </div>
                     <p className="text-xs text-gray-500 mt-2">💡 감정이 기록된 날짜를 클릭하면 상세 정보를 볼 수 있어요</p>
                  </div>
               </div>

               {/* 통계 */}
               <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">이번 달 통계</h2>
                  <div className="space-y-4">
                     {Object.entries(emotions).map(([key, emotion]) => {
                        const count = emotionStats[key as EmotionType];
                        const totalDays = Object.values(emotionStats).reduce((a, b) => a + b, 0);
                        const percentage = totalDays > 0 ? Math.round((count / totalDays) * 100) : 0;

                        return (
                           <div key={key} className="space-y-2">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded" style={{ backgroundColor: emotion.color }}></div>
                                    <span className="text-sm text-gray-700">{emotion.label}</span>
                                 </div>
                                 <span className="text-sm font-medium text-gray-900">
                                    {count}일 ({percentage}%)
                                 </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                 <div
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{
                                       backgroundColor: emotion.color,
                                       width: `${percentage}%`,
                                    }}></div>
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                     <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">
                           {Object.values(emotionStats).reduce((a, b) => a + b, 0)}
                        </p>
                        <p className="text-sm text-gray-600">총 기록된 날</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 모달 - 선택된 날짜 상세 정보 */}
         {selectedDate && emotionData[selectedDate] && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
               <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-xl font-bold text-gray-800">
                        {new Date(selectedDate).toLocaleDateString('ko-KR', {
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric',
                           weekday: 'long'
                        })}
                     </h2>
                     <button 
                        onClick={() => setSelectedDate(null)} 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="닫기"
                     >
                        <X className="w-5 h-5 text-gray-500" />
                     </button>
                  </div>
                  
                  <div className="space-y-6">
                     {(() => {
                        const emotionKey = emotionData[selectedDate].emotion as EmotionType;
                        const emotion = emotions[emotionKey];
                        const IconComponent = emotion.icon;
                        return (
                           <>
                              <div className="flex items-center space-x-4">
                                 <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
                                    style={{ backgroundColor: emotion.color }}>
                                    <IconComponent className="w-8 h-8 text-white" />
                                 </div>
                                 <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{emotion.label}</h3>
                                    <p className="text-sm text-gray-500">이날의 감정</p>
                                 </div>
                              </div>
                              
                              {emotionData[selectedDate].reason && (
                                 <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">기록한 이유</h4>
                                    <p className="text-gray-800 leading-relaxed">
                                       {emotionData[selectedDate].reason}
                                    </p>
                                 </div>
                              )}
                              
                              <div className="pt-4 border-t">
                                 <button
                                    onClick={() => setSelectedDate(null)}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                                 >
                                    닫기
                                 </button>
                              </div>
                           </>
                        );
                     })()}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default EmotionTracker;
