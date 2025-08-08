import React, { useState, useEffect } from 'react';
import { Check, X, Heart, UserPlus, Save, AlertCircle } from 'lucide-react';

// Modal 컴포넌트의 props 인터페이스 정의
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'signup' | 'save' | 'success' | 'error'; // 'success'와 'error' 타입 추가
  title?: string;
  message?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 2000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getModalContent = () => {
    switch (type) {
      case 'signup':
        return {
          icon: UserPlus,
          iconColor: '#10B981',
          iconBg: '#D1FAE5',
          title: title || '회원가입 완료!',
          message: message || '감정 다이어리에 오신 것을 환영합니다.',
        };
      case 'save':
        return {
          icon: Save,
          iconColor: '#3B82F6',
          iconBg: '#DBEAFE',
          title: title || '저장 완료!',
          message: message || '감정이 성공적으로 기록되었습니다.',
        };
      case 'error': // 실패(error) 타입 추가
        return {
          icon: AlertCircle,
          iconColor: '#EF4444',
          iconBg: '#FEE2E2',
          title: title || '오류 발생!',
          message: message || '작업을 처리하는 중 문제가 발생했습니다.',
        };
      case 'success': // 일반적인 성공(success) 타입
      default:
        return {
          icon: Check,
          iconColor: '#10B981',
          iconBg: '#D1FAE5',
          title: title || '완료!',
          message: message || '작업이 성공적으로 완료되었습니다.',
        };
    }
  };

  if (!isOpen) return null;

  const { icon: IconComponent, iconColor, iconBg, title: modalTitle, message: modalMessage } = getModalContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-30' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className={`relative bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 아이콘 */}
        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
            style={{ backgroundColor: iconBg }}
          >
            <IconComponent
              className="w-8 h-8"
              style={{ color: iconColor }}
            />
          </div>
        </div>

        {/* 제목 */}
        <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
          {modalTitle}
        </h2>

        {/* 메시지 */}
        <p className="text-gray-600 text-center text-sm leading-relaxed mb-6">
          {modalMessage}
        </p>

        {/* 확인 버튼 (자동 닫기가 비활성화된 경우) */}
        {!autoClose && (
          <button
            onClick={handleClose}
            className={`w-full text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg ${
              type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            }`}
          >
            확인
          </button>
        )}

        {/* 자동 닫기 표시 */}
        {autoClose && (
          <div className="flex justify-center">
            <div className="flex items-center text-xs text-gray-500 space-x-2">
              <div className={`w-2 h-2 rounded-full animate-ping ${type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              <span>잠시 후 자동으로 닫힙니다</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 사용 예시 컴포넌트
const ExampleUsage: React.FC = () => {
  const [signupModal, setSignupModal] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false); // 'general' 대신 'success'로 변경
  const [errorModal, setErrorModal] = useState(false); // 실패 모달 상태 추가

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full">
        <div className="flex items-center space-x-3 mb-8">
          <Heart className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">모달 테스트</h1>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => setSignupModal(true)}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            회원가입 모달
          </button>
          
          <button
            onClick={() => setSaveModal(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            저장 모달
          </button>
          
          <button
            onClick={() => setSuccessModal(true)}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            일반 성공 모달
          </button>

          <button
            onClick={() => setErrorModal(true)}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors"
          >
            실패 모달
          </button>
        </div>
      </div>

      {/* 모달들 */}
      <Modal
        isOpen={signupModal}
        onClose={() => setSignupModal(false)}
        type="signup"
      />
      
      <Modal
        isOpen={saveModal}
        onClose={() => setSaveModal(false)}
        type="save"
      />
      
      <Modal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        type="success"
        autoClose={false} // 수동 닫기 예시
      />

      <Modal
        isOpen={errorModal}
        onClose={() => setErrorModal(false)}
        type="error"
        autoClose={false} // 수동 닫기 예시
        title="로그인 실패!"
        message="아이디 또는 비밀번호를 다시 확인해주세요."
      />
    </div>
  );
};

export default ExampleUsage;