import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Artist from './components/Views/Artist';
import Albums from './components/Views/Albums';
import AlbumDetails from './components/Views/AlbumDetails';
import SongDetails from './components/Views/SongDetails';
import PlaylistDetails from './components/Views/PlaylistDetails';
import Header from './components/Commons/Header/index';
import Footer from './components/Commons/Footers/index';
import RegisterStep2 from './components/Commons/Auth/Register/RegisterStep2';
import RegisterStep3 from './components/Commons/Auth/Register/RegisterStep3';
import RegisterStep1 from './components/Commons/Auth/Register/RegisterStep1';
import { RegistrationProvider } from './components/Commons/Auth/Register/RegistrationContext';
import Main from './components/Views/main';
import Login from './components/Commons/Auth/Login/Login';


const AppContent = () => {
  const location = useLocation();
  const hideHeaderFooter = ['/register-step1', '/register-step2', '/register-step3', '/login'].includes(location.pathname);

  return (
    <>
      {!hideHeaderFooter && <Header />}
      <div className={`flex flex-col min-h-screen bg-black text-white ${hideHeaderFooter ? '' : 'mt-[242px]'}`}>
        <div className="flex-grow">
          <Routes>
            <Route path="/main" element={<Main />} />
            <Route path="/artist" element={<Artist />} />
            <Route path="/artist/:id" element={<Artist />} />
            <Route path="/artist/:id/albums" element={<Albums />} />
            <Route path="/albums/:id" element={<AlbumDetails />} />
            <Route path="/songs/:id" element={<SongDetails />} />
            <Route path="/playlists/:id" element={<PlaylistDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register-step1" element={<RegisterStep1 />} />
            <Route path="/register-step2" element={<RegisterStep2 />} />
            <Route path="/register-step3" element={<RegisterStep3 />} />
          </Routes>
        </div>
        {!hideHeaderFooter && <Footer />}
      </div>
    </>
  );
};

const App = () => {
  return (
    <RegistrationProvider>
      <Router>
        <AppContent />
      </Router>
    </RegistrationProvider>
  );
};

export default App;
