import { useEffect, useState } from 'react'; 
import { useLocation, useNavigate } from 'react-router-dom';
import NavigationMenu from './NavigationMenu';
import { useAuth } from '../../context/AuthContext';

const Header = () => {

  const [, setIsHomeActive] = useState(false);
  const [, setIsNotificationsActive] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string>('/images/avatars/frame (1).svg');
  const [homeIconSrc, setHomeIconSrc] = useState<string>('/images/HomeIcon.svg');
  const [notificationIconSrc, setNotificationIconSrc] = useState<string>('/images/notificationIcon.svg');
  const navigate = useNavigate();
  const authContext = useAuth();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const location = useLocation();

  const updateAvatarUrl = (url: string) => {
    setAvatarUrl(`${BASE_URL}${url}?t=${new Date().getTime()}`);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/user/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authContext?.token}`
          }
        });
        if (response.ok) {
          const data = await response.json();

          if (data.avatarUrl) {
            updateAvatarUrl(data.avatarUrl);
          } else {
            setAvatarUrl('/images/avatars/frame (1).svg');
          }
        } else {
          console.error('Failed to fetch user data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (authContext?.token) {
      fetchUserData();
    }
  }, [authContext, BASE_URL]);


  useEffect(() => {
    if (location.pathname !== "/main") {
      setIsHomeActive(false);
      setHomeIconSrc("/images/HomeIcon.svg");
    }
  }, [location.pathname]);

  const handleHomeClick = () => {
    setIsHomeActive(true);
    setHomeIconSrc("/images/HomeIcon2.svg");
    navigate("/main");
  };

  useEffect(() => {
    if (location.pathname === "/notifications") {
      setIsNotificationsActive(true);
      setNotificationIconSrc("/images/notificationIconActive.svg");
    } else {
      setIsNotificationsActive(false);
      setNotificationIconSrc("/images/notificationIcon.svg");
    }
  }, [location.pathname]);

  const handleNotificationsClick = () => {
    navigate("/notifications");
  };
  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) return; // Не отправляем пустой запрос
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };


  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 font-noto-sans">
        <header className="flex w-full h-[150px] p-[50px_20px] flex-col justify-center items-center gap-[12px] flex-shrink-0 bg-black text-white">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center pl-[160px] pr-[160px]">
              <img src="/images/logos/Logo.svg" alt="SoundScape Logo" className="h-12 flex-shrink-0" />
              <button className="ml-5 flex-shrink-0" onClick={handleHomeClick}>
                <img
                  src={homeIconSrc}
                  alt="Home"
                  className="h-12"
                />
              </button>
            </div>
            <form onSubmit={handleSearch} className="flex-grow flex items-center justify-center">
              <div className="flex items-center bg-black text-white border border-white rounded-[22px] px-5 py-3 w-full max-w-[750px] gap-[12px]">
                <img src="/images/SearchIcon.svg" alt="Search" className="h-6 mr-3" style={{ width: '26px', height: '26px', flexShrink: 0 }} />
                <input
                  className="border-none outline-none bg-black text-white placeholder-white w-full"
                  type="text"
                  placeholder="Пошук"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form> 
            <div className="flex items-center pr-[160px] gap-5">
              <button onClick={() => navigate('/premium')} className="flex items-center justify-center w-[180px] p-3 gap-[12px] rounded-[22px] bg-gradient-to-b from-[#660273] to-[#A305A6] text-white">
                Premium
              </button>
              <button onClick={handleNotificationsClick}>
                <img
                  src={notificationIconSrc}
                  alt="Notifications"
                  className="h-10"
                />
              </button>
              <button onClick={handleProfileClick} className="flex items-center justify-center">
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="h-13 w-13 rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = `${BASE_URL}/images/default-avatar.png`;
                    }}
                  />
                )}
              </button>
            </div>
          </div>
        </header>
        <NavigationMenu />
      </div>
    </>
  );
};

export default Header;