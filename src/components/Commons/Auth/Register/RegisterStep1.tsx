import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegistrationContext } from './RegistrationContext';

const RegisterStep1 = () => {
  const navigate = useNavigate();
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('RegistrationContext must be used within a RegistrationProvider');
  }
  const { registrationData, setRegistrationData } = context;
  const [email, setEmail] = useState(registrationData.email);

  const handleNext = () => {
    if (email) {
      setRegistrationData({ ...registrationData, email });
      navigate('/register-step2');
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
        <h2 className="text-3xl font-bold mb-[48px]">Реєстрація</h2>
        <div className="w-full max-w-md">
          <div className="mb-4">
            <div className="w-[400px] h-[2px] flex-shrink-0 rounded-[10px] bg-[#D9D9D9]">
              <div className="h-full w-1/3 rounded-[10px] bg-[#A305A6]"></div>
            </div>
            <span className="text-[#B3B3B3] font-['Noto_Sans'] text-[16px] font-normal leading-normal">
              Крок 1 з 3
            </span>
          </div>

          <form className="w-full">
            <div className="mb-4">
              <label className="text-white font-['Noto_Sans'] text-[16px] font-bold leading-normal mb-2 block" htmlFor="email">
                Адреса електронної пошти
              </label>
              <input
                className="flex w-[400px] p-[16px_10px] items-center gap-[10px] rounded-[8px] border border-[#B3B3B3] text-[#B3B3B3] font-['Noto_Sans'] text-[16px] font-normal leading-normal focus:outline-none focus:ring-2 focus:ring-[#A305A6] placeholder-[#B3B3B3]"
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between mb-[48px]">
              <button
                className="flex w-[400px] p-[16px_10px] justify-center items-center gap-[10px] rounded-[20px] bg-[rgba(163,5,166,0.50)] text-white font-['Noto_Sans'] text-[16px] font-normal leading-normal hover:bg-[rgba(163,5,166,0.7)]"
                type="button"
                onClick={handleNext}
              >
                <span className="text-[#FFF] font-['Noto Sans'] text-[16px] font-normal leading-normal">
                  Далі
                </span>
              </button>
            </div>
          </form>

          <div className="flex items-center justify-left mb-[40px]">
            <img src="/images/Line.svg" alt="Line" className="w-[170px] h-[2px] flex-shrink-0 rounded-[10px]" />
            <span className="text-white font-['Noto_Sans'] text-[14px] font-normal mx-4">або</span>
            <img src="/images/Line.svg" alt="Line" className="w-[170px] h-[2px] flex-shrink-0 rounded-[10px]" />
          </div>

          <div className="flex flex-col items-start gap-8 self-stretch mb-[40px]">
            <button
              className="flex p-4 flex-row items-center gap-4 w-[400px] rounded-[20px] border border-[#B3B3B3]"
              type="button"
            >
              <img src="/images/googleLogo.svg" alt="Google" className="w-6 h-6" />
              <span className="text-[#B3B3B3] font-['Noto_Sans'] text-[16px] font-bold leading-normal">
                Зареєструватися через Google
              </span>
            </button>

            <button
              className="flex p-4 flex-row items-center gap-4 w-[400px] rounded-[20px] border border-[#B3B3B3] hover:text-white"
              type="button"
            >
              <img src="/images/facebookLogo.svg" alt="Facebook" className="w-6 h-6" />
              <span className="text-[#B3B3B3] font-['Noto_Sans'] text-[16px] font-bold leading-normal">
                Зареєструватися через Facebook
              </span>
            </button>

            <button
              className="flex p-4 flex-row items-center gap-4 w-[400px] rounded-[20px] border border-[#B3B3B3] hover:text-white"
              type="button"
            >
              <img src="/images/AppleLogo.svg" alt="Apple" className="w-6 h-6" />
              <span className="text-[#B3B3B3] font-['Noto_Sans'] text-[16px] font-bold leading-normal">
                Зареєструватися через Apple
              </span>
            </button>
          </div>

          <div className="text-center">
            <span className="text-[#B3B3B3] font-['Noto_Sans'] text-[16px] font-normal leading-normal">
              Уже маєте акаунт?
            </span>
            <Link
              to="/login"
              className="text-white font-['Noto_Sans'] text-[16px] font-bold leading-normal underline decoration-solid decoration-[0.64px] underline-offset-auto ml-2 hover:text-[#7A057E]"
            >
              Увійти в SoundScape
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep1;