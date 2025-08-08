import React, { useState, useEffect, useRef } from 'react';
import { Calendar, User, Heart, Smile, Meh, Frown, Angry, X, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../common/auth/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../common/api/axios.service';

export type EmotionType = 'very-happy' | 'happy' | 'neutral' | 'sad' | 'angry';

interface EmotionRecord {
    date: string;
    emotion: EmotionType;
    reason?: string;
}

interface MonthlyEmotionResponse {
    data: EmotionRecord[];
}

interface YearlyStatsResponse {
    data: {
        [key in EmotionType]: number;
    };
}

interface EmotionData {
    [date: string]: {
        emotion: EmotionType;
        reason?: string;
    };
}

interface UserInfo {
    id: string;
    name: string;
}

const emotions = {
    'very-happy': { label: '매우 기쁨', color: '#10B981', icon: Heart },
    happy: { label: '기쁨', color: '#3B82F6', icon: Smile },
    neutral: { label: '보통', color: '#6B7280', icon: Meh },
    sad: { label: '우울', color: '#F59E0B', icon: Frown },
    angry: { label: '화남', color: '#EF4444', icon: Angry },
};

const EmotionTracker: React.FC = () => {
    const [today] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    });
    
    const [todayDateString] = useState(() => {
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    });

    const [todayEmotion, setTodayEmotion] = useState<EmotionType | null>(null);
    const [todayReason, setTodayReason] = useState('');
    const [emotionData, setEmotionData] = useState<EmotionData>({});
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [reasonToggle, setReasonToggle] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [yearlyStats, setYearlyStats] = useState<YearlyStatsResponse['data']>({
        'very-happy': 0,
        happy: 0,
        neutral: 0,
        sad: 0,
        angry: 0,
    });
    const [isYearlyStatsLoading, setIsYearlyStatsLoading] = useState(false);

    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    
    const [loadedMonths, setLoadedMonths] = useState<Set<string>>(new Set());

    const logout = useAuthStore(state => state.logout);
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user as UserInfo);

    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // 첫 렌더링 시에만 실행되는 로직을 분리합니다.
    const isFirstRender = useRef(true);

    // 모든 초기 데이터를 한 번에 로드합니다.
    useEffect(() => {
        const initializeData = async () => {
            try {
                setIsLoading(true);
                // 초기 월별 데이터 로드 (첫 렌더링 시에만)
                await loadMonthlyEmotionData(today.getFullYear(), today.getMonth());
                // 연간 통계 로드 (첫 렌더링 시에만)
                await loadYearlyStats(today.getFullYear());
            } catch (error) {
                console.error("초기 데이터 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };
        initializeData();
    }, []);

    // 사용자가 달력을 넘길 때만 월별 데이터를 로드합니다.
    useEffect(() => {
        // isFirstRender.current가 true이면, 첫 렌더링이므로 실행하지 않습니다.
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const monthKey = `${currentYear}-${currentMonth}`;
        if (!loadedMonths.has(monthKey)) {
            loadMonthlyEmotionData(currentYear, currentMonth);
        }
    }, [currentYear, currentMonth]);

    const loadMonthlyEmotionData = async (year: number, month: number) => {
        const monthKey = `${year}-${month}`;
        if (loadedMonths.has(monthKey)) {
            return;
        }

        try {
            const response = await api.get<MonthlyEmotionResponse | EmotionRecord[]>('/emotions/monthly', {
                params: {
                    year: year,
                    month: month + 1,
                }
            });
            const rawData = (response.data as MonthlyEmotionResponse).data || response.data;
            const monthlyEmotionMap: EmotionData = {};

            if (Array.isArray(rawData)) {
                rawData.forEach((item) => {
                    monthlyEmotionMap[item.date] = {
                        emotion: item.emotion as EmotionType,
                        reason: item.reason || ''
                    };
                });
            }

            setEmotionData(prev => ({
                ...prev,
                ...monthlyEmotionMap
            }));

            setLoadedMonths(prev => new Set([...prev, monthKey]));
            
            if (year === today.getFullYear() && month === today.getMonth() && monthlyEmotionMap[todayDateString]) {
                setTodayEmotion(monthlyEmotionMap[todayDateString].emotion);
                setTodayReason(monthlyEmotionMap[todayDateString].reason || '');
            }
            
        } catch (error) {
            console.error(`${year}년 ${month + 1}월 감정 데이터 로드 실패:`, error);
        }
    };

    const loadYearlyStats = async (year: number) => {
        try {
            setIsYearlyStatsLoading(true);
            const response = await api.get<YearlyStatsResponse>('/emotions/yearly-stats', {
                params: {
                    year: year
                }
            });
            const rawData = response.data.data || response.data;

            if (rawData) {
                setYearlyStats(rawData);
            }
            
        } catch (error) {
            console.error('연간 통계 로드 실패:', error);
        } finally {
            setIsYearlyStatsLoading(false);
        }
    };

    const goToPreviousMonth = () => {
        const prevMonth = new Date(currentYear, currentMonth - 1);
        if (prevMonth >= oneYearAgo) {
            setCurrentYear(prevMonth.getFullYear());
            setCurrentMonth(prevMonth.getMonth());
        }
    };

    const goToNextMonth = () => {
        const nextMonth = new Date(currentYear, currentMonth + 1);
        if (nextMonth <= today) {
            setCurrentYear(nextMonth.getFullYear());
            setCurrentMonth(nextMonth.getMonth());
        }
    };

    const goToCurrentMonth = () => {
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth());
    };

    const canGoPrevious = () => {
        const prevMonth = new Date(currentYear, currentMonth - 1);
        return prevMonth >= oneYearAgo;
    };

    const canGoNext = () => {
        const nextMonth = new Date(currentYear, currentMonth + 1);
        return nextMonth <= today;
    };

    const isCurrentMonth = () => {
        return currentYear === today.getFullYear() && currentMonth === today.getMonth();
    };

    const handleSetTodayEmotion = (emotion: EmotionType) => {
        setTodayEmotion(emotion);
        setReasonToggle(true);
    };

    const handleSaveEmotion = async () => {
        if (todayEmotion) {
            try {
                await requestCreateEmotionAPI(todayEmotion, todayReason);
                
                setEmotionData(prev => ({
                    ...prev,
                    [todayDateString]: {
                        emotion: todayEmotion,
                        reason: todayReason.trim(),
                    },
                }));
                
                setTodayReason('');
                setReasonToggle(false);
                
                loadYearlyStats(today.getFullYear());
                
                console.log('감정이 성공적으로 저장되었습니다.');
                
            } catch (error) {
                console.error('감정 저장 실패:', error);
            }
        }
    };

    const requestCreateEmotionAPI = async (emotion: EmotionType, reason: string) => {
        await api.post('/emotions', {
            emotion,
            reason: reason.trim(),
            date: todayDateString
        });
    };

    const handleDateClick = (dateString: string) => {
        if (emotionData[dateString]) {
            setSelectedDate(dateString);
        }
    };

    const generateCalendarDays = () => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

    const getMonthlyEmotionStats = () => {
        const stats: { [key in EmotionType]: number } = {
            'very-happy': 0,
            happy: 0,
            neutral: 0,
            sad: 0,
            angry: 0,
        };

        Object.entries(emotionData).forEach(([date, entry]) => {
            const entryDate = new Date(date);
            if (
                entryDate.getFullYear() === currentYear &&
                entryDate.getMonth() === currentMonth &&
                entry &&
                entry.emotion in stats
            ) {
                stats[entry.emotion as EmotionType]++;
            }
        });
        return stats;
    };
    const monthlyEmotionStats = getMonthlyEmotionStats();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">감정 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Heart className="w-8 h-8 text-blue-600" />
                        <h1 className="text-xl font-bold text-gray-800">감정 다이어리</h1>
                    </div>
                    <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">{user!.name}</span>
                        <button
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700">
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {isCurrentMonth() && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            오늘의 감정은 어떠신가요? ({today.toLocaleDateString('ko-KR')})
                        </h2>

                        {emotionData[todayDateString] && !reasonToggle && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-800 text-sm">
                                    ✅ 오늘의 감정이 이미 기록되었습니다: <strong>{emotions[emotionData[todayDateString].emotion].label}</strong>
                                    {emotionData[todayDateString].reason && (
                                        <span className="block mt-1 text-green-700">"{emotionData[todayDateString].reason}"</span>
                                    )}
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-5 gap-4 mb-6">
                            {Object.entries(emotions).map(([key, emotion]) => {
                                const IconComponent = emotion.icon;
                                const isSelected = todayEmotion === key;
                                const isAlreadyRecorded = emotionData[todayDateString]?.emotion === key;
                                
                                return (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            handleSetTodayEmotion(key as EmotionType);
                                        }}
                                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50 scale-105'
                                                : isAlreadyRecorded
                                                ? 'border-green-400 bg-green-50'
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
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleSaveEmotion}
                                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                        저장하기
                                    </button>
                                    <button
                                        onClick={() => {
                                            setReasonToggle(false);
                                            setTodayEmotion(null);
                                            setTodayReason('');
                                        }}
                                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors">
                                        취소
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                {monthName}
                            </h2>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={goToPreviousMonth}
                                    disabled={!canGoPrevious()}
                                    className={`p-2 rounded-lg transition-colors ${
                                        canGoPrevious() ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                    title="이전 달">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {!isCurrentMonth() && (
                                    <button
                                        onClick={goToCurrentMonth}
                                        className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                                        오늘
                                    </button>
                                )}

                                <button
                                    onClick={goToNextMonth}
                                    disabled={!canGoNext()}
                                    className={`p-2 rounded-lg transition-colors ${
                                        canGoNext() ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                    title="다음 달">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-4">
                            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

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
                                        key={index}
                                        onClick={() => handleDateClick(dateString)}
                                        disabled={!hasData}
                                        className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                                            hasData ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
                                        } ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''} ${
                                            emotion
                                                ? 'text-white shadow-sm hover:shadow-md'
                                                : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                        style={{ backgroundColor: emotionColor }}
                                        title={emotion ? `${emotions[emotion].label}${reason ? `: ${reason}` : ''} (클릭하여 상세보기)` : ''}>
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 pt-4 border-t">
                            <div className="flex flex-wrap gap-3">
                                {Object.entries(emotions).map(([key, emotion]) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <div className="w-4 h-4 rounded" style={{ backgroundColor: emotion.color }}></div>
                                        <span className="text-xs text-gray-600">{emotion.label}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                💡 감정이 기록된 날짜를 클릭하면 상세 정보를 볼 수 있어요
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                📅 최근 1년간의 기록을 확인할 수 있습니다 | 오늘: {todayDateString}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-6">
                                {isCurrentMonth() ? '이번 달' : monthName.split(' ')[1]} 통계
                            </h2>
                            <div className="space-y-4">
                                {Object.entries(emotions).map(([key, emotion]) => {
                                    const count = monthlyEmotionStats[key as EmotionType];
                                    const totalDays = Object.values(monthlyEmotionStats).reduce((a, b) => a + b, 0);
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
                                        {Object.values(monthlyEmotionStats).reduce((a, b) => a + b, 0)}
                                    </p>
                                    <p className="text-sm text-gray-600">기록된 날</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2" />
                                {today.getFullYear()}년 통계
                            </h2>
                            
                            {isYearlyStatsLoading ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-600">연간 통계 로딩 중...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        {Object.entries(emotions).map(([key, emotion]) => {
                                            const count = yearlyStats[key as EmotionType] || 0;
                                            const totalDays = Object.values(yearlyStats).reduce((a, b) => (a || 0) + (b || 0), 0);
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
                                                {Object.values(yearlyStats).reduce((a, b) => (a || 0) + (b || 0), 0)}
                                            </p>
                                            <p className="text-sm text-gray-600">전체 기록된 날</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {selectedDate && emotionData[selectedDate] && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {new Date(selectedDate).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    weekday: 'long',
                                })}
                            </h2>
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="닫기">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {(() => {
                                const emotionKey = emotionData[selectedDate].emotion;
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
                                                <p className="text-gray-800 leading-relaxed">{emotionData[selectedDate].reason}</p>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t">
                                            <button
                                                onClick={() => setSelectedDate(null)}
                                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors">
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