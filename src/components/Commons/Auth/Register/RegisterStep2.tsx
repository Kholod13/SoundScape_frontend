import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegistrationContext } from './RegistrationContext';

const RegisterStep2 = () => {
  const navigate = useNavigate();
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('RegistrationContext must be used within a RegistrationProvider');
  }
  const { registrationData, setRegistrationData } = context;
  const [password, setPassword] = useState(registrationData.password);
  const [repeatPassword, setRepeatPassword] = useState(registrationData.repeatPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowRepeatPassword = () => setShowRepeatPassword(!showRepeatPassword);

  const isMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);

  const handleNextClick = () => {
    if (isMinLength && hasLetter && hasNumber && password === repeatPassword) {
      setRegistrationData({ ...registrationData, password, repeatPassword });
      navigate('/register-step3');
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex flex-col justify-between items-center p-8 bg-cover bg-center" style={{ backgroundImage: "linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%), url('/images/SUM.png')", borderRadius: '20px' }}>
        <div></div>
        <div className="flex items-center mb-8">
          <img src="/images/logos/Logo.svg" alt="Logo" className="w-12 h-12" />
          <span className="text-white ml-4" style={{ fontFamily: 'Noto Sans', fontSize: '32px', fontWeight: 300 }}>SoundScape</span>
        </div>
      </div>

      <div className="w-1/2 flex flex-col justify-center items-center p-8">
        <h2 className="text-3xl font-bold mb-[48px]">Створіть пароль</h2>
        <div className="w-full max-w-md">
          <div className="mb-4">
            <div className="w-[400px] h-[2px] flex-shrink-0 rounded-[10px] bg-[#D9D9D9]">
              <div className="h-full w-2/3 rounded-[10px] bg-[#A305A6]"></div>
            </div>
            <div className="flex items-center">
              <Link to="/register-step1" className="mr-4">
                <img src="/images/arrowIcon.svg" alt="Back" />
              </Link>
              <span className="text-[#B3B3B3] font-['Noto_Sans'] text-[16px] font-normal leading-normal">
                Крок 2 з 3
              </span>
            </div>

          </div>
          <form className="w-full">
            <div>
              <div className="mb-[32px]">
                <label className="text-white font-['Noto_Sans'] text-[16px] font-bold leading-normal mb-2 block" htmlFor="password">
                  Пароль
                </label>
                <div className="relative">
                  <div className="flex items-center w-[400px] p-[16px_10px] pr-[40px] rounded-[8px] border border-[#B3B3B3] focus-within:ring-2 focus-within:ring-[#A305A6]">
                    <input
                      className="flex-1 text-[#B3B3B3] font-['Noto_Sans'] text-[16px] font-normal leading-normal bg-transparent focus:outline-none"
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="ml-2"
                    >
                      <img
                        src={showPassword ? '/images/hideIcon.svg' : '/images/viewIcon.svg'}
                        alt={showPassword ? 'Сховати пароль' : 'Показати пароль'}
                        className="w-6 h-6"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mb-[32px]">
                <label className="text-white font-['Noto_Sans'] text-[16px] font-bold leading-normal mb-2 block" htmlFor="repeat-password">
                  Повторіть пароль
                </label>
                <div className="relative">
                  <div className="flex items-center w-[400px] p-[16px_10px] pr-[40px] rounded-[8px] border border-[#B3B3B3] focus-within:ring-2 focus-within:ring-[#A305A6]">
                    <input
                      className="flex-1 text-[#B3B3B3] font-['Noto_Sans'] text-[16px] font-normal leading-normal bg-transparent focus:outline-none"
                      id="repeat-password"
                      type={showRepeatPassword ? 'text' : 'password'}
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={toggleShowRepeatPassword}
                      className="ml-2"
                    >
                      <img
                        src={showRepeatPassword ? '/images/hideIcon.svg' : '/images/viewIcon.svg'}
                        alt={showRepeatPassword ? 'Сховати пароль' : 'Показати пароль'}
                        className="w-6 h-6"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-[32px]">
              <label className="text-white font-['Noto_Sans'] text-[16px] font-bold leading-normal mb-2 block">
                Перевірка пароля
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input type="radio" checked={hasLetter} readOnly className="w-5 h-5" />
                  <span className="text-[#B3B3B3] text-[16px]">1 літеру</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="radio" checked={hasNumber} readOnly className="w-5 h-5" />
                  <span className="text-[#B3B3B3] text-[16px]">1 число</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="radio" checked={isMinLength} readOnly className="w-5 h-5" />
                  <span className="text-[#B3B3B3] text-[16px]">8 символів</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                className="flex w-[400px] p-[16px_10px] justify-center items-center gap-[10px] rounded-[20px] bg-[rgba(163,5,166,0.50)] text-white font-['Noto_Sans'] text-[16px] font-normal leading-normal hover:bg-[rgba(163,5,166,0.7)]"
                type="button"
                disabled={!(isMinLength && hasLetter && hasNumber && password === repeatPassword)}
                onClick={handleNextClick}
              >
                <span className="text-[#FFF] font-['Noto Sans'] text-[16px] font-normal leading-normal">
                  Далі
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep2;