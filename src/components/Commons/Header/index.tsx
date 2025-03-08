import { useState } from 'react';
import NavigationMenu from './NavigationMenu';

const Header = () => {
  const [isHomeActive, setIsHomeActive] = useState(false);
  const [isNotificationsActive, setIsNotificationsActive] = useState(false);

  const handleHomeClick = () => {
    setIsHomeActive(prevState => !prevState);
  };

  const handleNotificationsClick = () => {
    setIsNotificationsActive(prevState => !prevState);
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
                  src={isHomeActive ? "/images/HomeIcon2.svg" : "/images/HomeIcon.svg"}
                  alt="Home"
                  className="h-12"
                />
              </button>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <div className="flex items-center bg-black text-white border border-white rounded-[22px] px-5 py-3 w-full max-w-[750px] gap-[12px]">
                <img src="/images/SearchIcon.svg" alt="Search" className="h-6 mr-3" style={{ width: '26px', height: '26px', flexShrink: 0 }} />
                <input
                  className="border-none outline-none bg-black text-white placeholder-white"
                  type="text"
                  placeholder="Пошук"
                />
              </div>
            </div>
            <div className="flex items-center pr-[160px] gap-5">
              <button className="flex items-center justify-center w-[180px] p-3 gap-[12px] rounded-[22px] bg-gradient-to-b from-[#660273] to-[#A305A6] text-white">
                Premium
              </button>
              <button onClick={handleNotificationsClick}>
                <img
                  src={isNotificationsActive ? "/images/notificationIconActive.svg" : "/images/notificationIcon.svg"}
                  alt="Notifications"
                  className="h-10"
                />
              </button>
              <img src="/images/avatars/frame (1).svg" alt="Avatar" className="h-12 w-12 rounded-full" />
            </div>
          </div>
        </header>
        <NavigationMenu />
      </div>
    </>
  );
};

export default Header;