import React, { useState, useEffect } from 'react';
import { Check, X, Heart, UserPlus, Save, AlertCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Modal 컴포넌트의 props 인터페이스 정의
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: 'login_failure' | 'signup_success' | 'signup_failure' | 'save' | 'success' | 'error';
  // 모든 내용을 외부에서 props로 받을 수 있도록 추가
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  title?: string;
  message?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  type,
  icon,
  iconColor,
  iconBg,
  title,
  message,
  autoClose, // autoClose prop을 별도로 받습니다.
  autoCloseDelay = 2000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // autoClose의 최종 값을 결정. prop으로 전달되지 않으면 type에 따라 기본값 설정
  const defaultAutoClose = type === 'login_failure' ? false : true;
  const finalAutoClose = autoClose !== undefined ? autoClose : defaultAutoClose;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (finalAutoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [isOpen, finalAutoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // type에 따라 기본값을 가져오는 함수
  const getDefaultContent = () => {
    switch (type) {
      case 'signup_success':
        return {
          icon: UserPlus,
          iconColor: '#10B981',
          iconBg: '#D1FAE5',
          title: '회원가입 완료!',
          message: '감정 다이어리에 오신 것을 환영합니다.',
        };
      case 'signup_failure':
        return {
          icon: AlertCircle,
          iconColor: '#3B82F6',
          iconBg: '#abc1f0ff',
          title: '회원가입 실패',
          message: '아이디와 비밀번호를 다시 확인해주세요.',
        };
      case 'login_failure':
        return {
          icon: AlertCircle,
          // iconColor: '#EF4444',
          iconColor: '#3B82F6',
          iconBg: '#abc1f0ff',
          title: '로그인 실패',
          message: '아이디와 비밀번호를 다시 확인해주세요.',
        };
      case 'save':
        return {
          icon: Save,
          iconColor: '#3B82F6',
          iconBg: '#DBEAFE',
          title: '저장 완료!',
          message: '감정이 성공적으로 기록되었습니다.',
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconColor: '#EF4444',
          iconBg: '#FEE2E2',
          title: '오류 발생!',
          message: '작업을 처리하는 중 문제가 발생했습니다.',
        };
      case 'success':
      default:
        return {
          icon: Check,
          iconColor: '#10B981',
          iconBg: '#D1FAE5',
          title: '완료!',
          message: '작업이 성공적으로 완료되었습니다.',
        };
    }
  };

  if (!isOpen) return null;

  const defaultContent = getDefaultContent();

  const IconComponent = icon || defaultContent.icon;
  const modalIconColor = iconColor || defaultContent.iconColor;
  const modalIconBg = iconBg || defaultContent.iconBg;
  const modalTitle = title || defaultContent.title;
  const modalMessage = message || defaultContent.message;

  const isErrorType = type === 'error';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'bg-opacity-30' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />
      
      <div className={`relative bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
            style={{ backgroundColor: modalIconBg }}
          >
            <IconComponent
              className="w-8 h-8"
              style={{ color: modalIconColor }}
            />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
          {modalTitle}
        </h2>

        <p className="text-gray-600 text-center text-sm leading-relaxed mb-6">
          {modalMessage}
        </p>

        {!finalAutoClose && (
          <button
            onClick={handleClose}
            className={`w-full text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg ${
              isErrorType ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            }`}
          >
            확인
          </button>
        )}

        {finalAutoClose && (
          <div className="flex justify-center">
            <div className="flex items-center text-xs text-gray-500 space-x-2">
              <div className={`w-2 h-2 rounded-full animate-ping ${isErrorType ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              <span>잠시 후 자동으로 닫힙니다</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;