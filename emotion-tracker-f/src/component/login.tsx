import { Heart, X } from 'lucide-react';
import React, { useState } from 'react';
import api from '../common/api/axios.service';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../common/auth/authStore';

const Login: React.FC = () => {
   const [id, setId] = useState('');
   const [password, setPassword] = useState('');
   const navigate = useNavigate();
   const setUser = useAuthStore(state => state.setUser);

   // 회원가입 모달 상태
   const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
   const [signupData, setSignupData] = useState({
      id: '',
      password: '',
      confirmPassword: '',
      name: '',
   });

   // 기존 로그인 로직 그대로 유지
   const handleLogin = async () => {
      try {
         const data = await requestLoginAPI(id, password);
         localStorage.setItem(`access_token`, data.token);
         setUser(data.user);
         navigate('/main');
         console.log(data.user)
      } catch (error) {
         setPassword('');
         console.log(`effiect login failure madal`);
         alert('로그인 실패');
      }
   };

   const requestLoginAPI = async (id: string, password: string) => {
      const response = await api.post('auth/login', {
         id,
         password,
      });
      return response.data;
   };

   // 새로 추가된 회원가입 로직
   const handleSignup = async () => {
      // 유효성 검사
      if (!signupData.id || !signupData.password || !signupData.name) {
         alert('모든 필드를 입력해주세요.');
         return;
      }

      if (signupData.password !== signupData.confirmPassword) {
         alert('비밀번호가 일치하지 않습니다.');
         return;
      }

      try {
         const data = await requestSignupAPI(signupData);
         alert('회원가입이 완료되었습니다!');
         setIsSignupModalOpen(false);
         // 회원가입 폼 초기화
         setSignupData({
            id: '',
            password: '',
            confirmPassword: '',
            name: '',
         });
      } catch (error) {
         console.log('Signup failure:', error);
         alert('회원가입 실패');
      }
   };

   const requestSignupAPI = async (signupData: any) => {
      const response = await api.post('/users', {
         id: signupData.id,
         password: signupData.password,
         name: signupData.name,
      });
      return response.data;
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
         <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
               <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Heart className="w-8 h-8 text-blue-600" />
               </div>
               <h1 className="text-2xl font-bold text-gray-800 mb-2">감정 다이어리</h1>
               <p className="text-gray-600">매일의 감정을 기록하고 추적해보세요</p>
            </div>

            <div className="space-y-4">
               <div>
                  <input
                     type="text"
                     placeholder="아이디을 입력하세요"
                     value={id}
                     onChange={e => setId(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleLogin()}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
               </div>
               <div>
                  <input
                     type="text"
                     placeholder="패스워드를 입력하세요"
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleLogin()}
                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
               </div>
               <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  로그인
               </button>

               <div className="text-center mt-4">
                  <p className="text-gray-600">
                     계정이 없으신가요?{' '}
                     <button
                        onClick={() => setIsSignupModalOpen(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium underline">
                        회원가입
                     </button>
                  </p>
               </div>
            </div>
         </div>

         {/* 회원가입 모달 */}
         {isSignupModalOpen && (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 z-50">
               <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
                  {/* 닫기 버튼 */}
                  <button
                     onClick={() => setIsSignupModalOpen(false)}
                     className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                     <X className="w-6 h-6" />
                  </button>

                  <div className="text-center mb-6">
                     <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                        <Heart className="w-6 h-6 text-blue-600" />
                     </div>
                     <h2 className="text-xl font-bold text-gray-800 mb-2">회원가입</h2>
                     <p className="text-gray-600">새 계정을 만들어보세요</p>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <input
                           type="text"
                           placeholder="이름을 입력하세요"
                           value={signupData.name}
                           onChange={e => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                     </div>
                     <div>
                        <input
                           type="text"
                           placeholder="아이디를 입력하세요"
                           value={signupData.id}
                           onChange={e => setSignupData(prev => ({ ...prev, id: e.target.value }))}
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                     </div>
                     <div>
                        <input
                           type="password"
                           placeholder="비밀번호를 입력하세요"
                           value={signupData.password}
                           onChange={e => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                     </div>
                     <div>
                        <input
                           type="password"
                           placeholder="비밀번호를 확인하세요"
                           value={signupData.confirmPassword}
                           onChange={e => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                           onKeyDown={e => e.key === 'Enter' && handleSignup()}
                           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                     </div>

                     <div className="flex space-x-3 mt-6">
                        <button
                           onClick={() => setIsSignupModalOpen(false)}
                           className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                           취소
                        </button>
                        <button
                           onClick={handleSignup}
                           className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                           가입하기
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default Login;