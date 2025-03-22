import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth, AuthProvider } from './components/context/AuthContext';
import Artist from './components/Views/ArtistPage/Artist';
import Header from './components/Commons/Header/index';
import HeaderGuest from './components/Commons/Header/HeaderGuest';
import Footer from './components/Commons/Footers/index';
import RegisterStep1 from './components/Commons/Auth/Register/RegisterStep1';
import RegisterStep2 from './components/Commons/Auth/Register/RegisterStep2';
import RegisterStep3 from './components/Commons/Auth/Register/RegisterStep3';
import { RegistrationProvider } from './components/context/RegistrationContext';
import Profile from './components/Views/Profile/Profile';
import Main from './components/Views/MainPage/main';
import MainGuest from './components/Views/MainGuest/MainGuest';
import Login from './components/Commons/Auth/Login/Login';
import ForgotPassword from './components/Commons/Auth/ChangePassword/ForgotPassword';
import EmailSent from './components/Commons/Auth/ChangePassword/EmailSent';
import CreateNewPassword from './components/Commons/Auth/ChangePassword/CreateNewPassword';
import SuccessfulPasswordChange from './components/Commons/Auth/ChangePassword/SuccessfulPasswordChange';
import Logout from './components/Commons/Auth/Logout';
import PremiumPage from './components/Views/Premium/PremiumPage';
import Favourite from './components/Views/favouritePage/favourite';
import MyLibrary from './components/Views/MyLibraryPage/MyLibrary';
import PlaylistPage from './components/Views/PlaylistPage/playlistPage';
import AllSongs from './components/Views/allSongsPage/allSongs';
import AddTrackToPlaylist from './components/Views/PlaylistPage/AddTrackToPlaylist';
import Search from './components/Views/SearchPage/search';
import NotFoundPage from './components/Views/NotFoundPage';
import NotificationPage from './components/Views/NotificationPage/Notification';
import AlbumPage from './components/Views/albumPage/album';
import SettingsPage from './components/Views/SettingsPage/settings';
//import Layout from './components/Layout';


const AppContent = () => {
  const auth = useAuth();
  const loggedIn = auth? auth.loggedIn : false;
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    console.log(`User is ${loggedIn ? 'logged in' : 'logged out'}`);
  }, [loggedIn]);

  const hideHeaderFooter = [
    '/register-step1',
    '/register-step2',
    '/register-step3',
    '/login',
    '/forgot-password',
    '/forgot-password/EmailSent',
    '/forgot-password/NewPassword',
    '/forgot-password/SuccessfulChangePassword'
  ].includes(location.pathname);

  return (
    <>
      {!hideHeaderFooter && (loggedIn ? <Header /> : <HeaderGuest />)}

      <div className={`flex flex-col min-h-screen bg-black text-white ${hideHeaderFooter ? '' : 'mt-[242px]'}`}>
        <div className="flex-grow">
          <Routes>
            {loggedIn ? (
              <>
                <Route path="/main" element={<Main />} />
                <Route path="/search" element={<Search />} />
                <Route path='/settings' element={<SettingsPage />} />
                <Route path="/artist/:id" element={<Artist />} />
                <Route path="/profile" element={<Profile setLoggedIn={loggedIn => console.log(loggedIn)} />} />
                <Route path="/login" element={<Navigate to="/main" />} />
                <Route path="/register-step1" element={<Navigate to="/main" />} />
                <Route path="/register-step2" element={<Navigate to="/main" />} />
                <Route path="/register-step3" element={<Navigate to="/main" />} />
                <Route path="/main-guest" element={<Navigate to="/main" />} />
                <Route path="/favourite" element={<Favourite />} />
                <Route path="/library" element={<MyLibrary />} />
                <Route path="/playlist/:id" element={<PlaylistPage />} />
                <Route path="/playlist/AddTrack/:id" element={<AddTrackToPlaylist />} />
                <Route path="/all-songs" element={<AllSongs />} />
                <Route path="/album/:id" element={<AlbumPage />} />
                <Route path="/notifications" element={<NotificationPage />} />
                <Route path="/logout" element={<Logout />} />
              </>
            ) : (
              <>
                <Route path="/main-guest" element={<MainGuest />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register-step1" element={<RegisterStep1 />} />
                <Route path="/favourite" element={<Navigate to="/main-guest" />} />
                <Route path="/library" element={<Navigate to="/main-guest" />} />
                <Route path="/profile" element={<Navigate to="/main-guest" />} />
                <Route path="/artist/:id" element={<Navigate to="/main-guest" />} />
                <Route path="/playlist/:id" element={<Navigate to="/main-guest" />} />
                <Route path="/all-songs" element={<Navigate to="/main-guest" />} />
                <Route path="/playlist/AddTrack/:id" element={<Navigate to="/main-guest" />} />

                <Route path="/register-step2" element={<RegisterStep2 />} />
                <Route path="/register-step3" element={<RegisterStep3 />} />
                <Route path="/main" element={<Navigate to="/main-guest" />} />
              </>
            )}
            <Route path="/premium" element={<PremiumPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/forgot-password/EmailSent" element={<EmailSent />} />
            <Route path="/forgot-password/NewPassword" element={<CreateNewPassword />} />
            <Route path="/forgot-password/SuccessfulChangePassword" element={<SuccessfulPasswordChange />} />

            <Route path="*" element={<NotFoundPage />} />
            <Route path="/" element={<Navigate to={loggedIn ? "/main" : "/main-guest"} />} />
          </Routes>
        </div>
        {!hideHeaderFooter && <Footer />}
      </div>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <RegistrationProvider>
        <Router>
          <AppContent />
        </Router>
      </RegistrationProvider>
    </AuthProvider>
  );
};

export default App;
