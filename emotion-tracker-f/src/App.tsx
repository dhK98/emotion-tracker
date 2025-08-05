// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './component/login';
import RequireAuth from './component/require-auth';
import EmotionTracker from './component/emotion-tarcker';
import NotFound from './page/not-found';

function App() {
   return (
      <Routes>
         {/* 공개 라우트 */}
         <Route path="/login" element={<Login />} />

         {/* 보호된 라우트 */}
         <Route element={<RequireAuth />}>
            <Route path="/" element={<Navigate to="/main" replace />} />
            <Route path="/main" element={<EmotionTracker />} />
         </Route>

         {/* 404 */}
         <Route path="*" element={<NotFound />} />
      </Routes>
   );
}

export default App;
