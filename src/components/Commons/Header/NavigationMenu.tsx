import { useState } from 'react';

const NavigationMenu = () => {
  const [activeButtons, setActiveButtons] = useState<string[]>([]);

  const handleButtonClick = (buttonName: string) => {
    setActiveButtons(prevState =>
      prevState.includes(buttonName)
        ? prevState.filter(name => name !== buttonName)
        : [...prevState, buttonName]
    );
  };

  return (
    <nav className="font-noto-sans">
      <div className="flex w-full h-[92px] p-[24px_330px] justify-between items-center flex-shrink-0 rounded-b-[20px] bg-[#2D0140]">
        <div className="flex items-center gap-4">
          <button className="flex items-center" onClick={() => handleButtonClick('library')}>
            <img
              src={activeButtons.includes('library') ? "/images/libraryIcon2.svg" : "/images/libraryIcon.svg"}
              alt="My Library"
              className="h-8 w-8"
            />
            <span className="ml-2 text-white">Моя бібліотека</span>
          </button>
          <button className="flex items-center" onClick={() => handleButtonClick('favorites')}>
            <img
              src={activeButtons.includes('favorites') ? "/images/favoriteIcon2.svg" : "/images/favoritesIcon.svg"}
              alt="Favorite Songs"
              className="h-8 w-8"
            />
            <span className="ml-2 text-white">Улюблені пісні</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            className={`flex items-center w-[80px] p-2 justify-center gap-2 rounded-[20px] ${
              activeButtons.includes('all') ? 'bg-[#660273]' : 'bg-[rgba(102,2,115,0.25)]'
            } text-white`}
            onClick={() => handleButtonClick('all')}
          >
            Усе
          </button>
          <button
            className={`flex items-center w-[80px] p-2 justify-center gap-2 rounded-[20px] ${
              activeButtons.includes('music') ? 'bg-[#660273]' : 'bg-[rgba(102,2,115,0.25)]'
            } text-white`}
            onClick={() => handleButtonClick('music')}
          >
            Музика
          </button>
          <button
            className={`flex items-center w-[80px] p-2 justify-center gap-2 rounded-[20px] ${
              activeButtons.includes('podcasts') ? 'bg-[#660273]' : 'bg-[rgba(102,2,115,0.25)]'
            } text-white`}
            onClick={() => handleButtonClick('podcasts')}
          >
            Подкасти
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationMenu;