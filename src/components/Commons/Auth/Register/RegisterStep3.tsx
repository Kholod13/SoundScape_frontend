import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RegistrationContext } from './RegistrationContext';

const RegisterStep3 = () => {
  const navigate = useNavigate();
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('RegistrationContext must be used within a RegistrationProvider');
  }
  const { registrationData } = context;
  const [name, setName] = useState(registrationData.name || '');
  const [day, setDay] = useState(registrationData.birthDay || '');
  const [month, setMonth] = useState(registrationData.birthMonth || '');
  const [year, setYear] = useState(registrationData.birthYear || '');
  const [gender, setGender] = useState(registrationData.gender || '');
  const [agree, setAgree] = useState(false);

  const handleRegisterClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      alert('Ви повинні погодитися з умовами');
      return;
    }

    const userData = {
      Username: name,
      Email: registrationData.email,
      Password: registrationData.password,
      BirthDay: parseInt(day.toString()),
      BirthMonth: parseInt(month.toString()),
      BirthYear: parseInt(year.toString()),
      Gender: gender,
    };

    try {
      const response = await fetch('https://localhost:7179/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Registration successful:', data);
        navigate('/main');
      } else {
        //const errorData = await response.json();
        navigate('/main');
        //console.error('Registration error:', errorData);
        //alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      navigate('/main');
      //alert('An error occurred while registering. Please try again.');
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
              <div className="h-full w-3/3 rounded-[10px] bg-[#A305A6]"></div>
            </div>
            <div className="flex items-center mb-4">
              <Link to="/register-step2" className="mr-4">
                <img src="/images/arrowIcon.svg" alt="Back" />
              </Link>
              <span className="text-[#B3B3B3] font-['Noto_Sans'] text-[16px] font-normal leading-normal">
                Крок 3 з 3
              </span>
            </div>
          </div>

          <form className="w-full" onSubmit={handleRegisterClick}>
            <div className="mb-4">
              <label className="text-white font-['Noto_Sans'] text-[16px] font-bold mb-2" htmlFor="name">Ім'я</label>
              <div className="flex items-center w-[400px] p-[16px_10px] gap-2 rounded-[8px] border border-[#B3B3B3]">
                <input
                  type="text"
                  id="name"
                  className="flex-1 bg-transparent text-[#B3B3B3] font-['Noto_Sans'] text-[16px] focus:outline-none"
                  placeholder="Введіть ваше ім'я"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="text-white font-['Noto_Sans'] text-[16px] font-bold mb-2" htmlFor="day">День</label>
                <input
                  type="number"
                  id="day"
                  className="w-full p-3 rounded-[8px] border border-[#B3B3B3] focus-within:ring-2 focus-within:ring-[#A305A6]"
                  placeholder="ДД"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-white font-['Noto_Sans'] text-[16px] font-bold mb-2" htmlFor="month">Місяць</label>
                <select
                  id="month"
                  className="w-full p-3 rounded-[8px] border border-[#B3B3B3] focus-within:ring-2 focus-within:ring-[#A305A6]"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="">Оберіть місяць</option>
                  <option value="01">Січень</option>
                  <option value="02">Лютий</option>
                  <option value="03">Березень</option>
                  <option value="04">Квітень</option>
                  <option value="05">Травень</option>
                  <option value="06">Червень</option>
                  <option value="07">Липень</option>
                  <option value="08">Серпень</option>
                  <option value="09">Вересень</option>
                  <option value="10">Жовтень</option>
                  <option value="11">Листопад</option>
                  <option value="12">Грудень</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-white font-['Noto_Sans'] text-[16px] font-bold mb-2" htmlFor="year">Рік</label>
                <input
                  type="number"
                  id="year"
                  className="w-full p-3 rounded-[8px] border border-[#B3B3B3] focus-within:ring-2 focus-within:ring-[#A305A6]"
                  placeholder="YYYY"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-white font-['Noto_Sans'] text-[16px] font-bold mb-2">Стать</label>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input type="radio" id="male" name="gender" className="mr-2" value="Male" checked={gender === 'Male'} onChange={(e) => setGender(e.target.value)} />
                  <label htmlFor="male" className="text-white font-['Noto_Sans'] text-[16px]">Чоловік</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="female" name="gender" className="mr-2" value="Female" checked={gender === 'Female'} onChange={(e) => setGender(e.target.value)} />
                  <label htmlFor="female" className="text-white font-['Noto_Sans'] text-[16px]">Жіноча</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="nonbinary" name="gender" className="mr-2" value="Nonbinary" checked={gender === 'Nonbinary'} onChange={(e) => setGender(e.target.value)} />
                  <label htmlFor="nonbinary" className="text-white font-['Noto_Sans'] text-[16px]">Небінарна</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="other" name="gender" className="mr-2" value="Other" checked={gender === 'Other'} onChange={(e) => setGender(e.target.value)} />
                  <label htmlFor="other" className="text-white font-['Noto_Sans'] text-[16px]">Інше</label>
                </div>
              </div>
              <div className="flex items-center mt-2">
                <input type="radio" id="dontWant" name="gender" className="mr-2" value="Prefer not to say" checked={gender === 'Prefer not to say'} onChange={(e) => setGender(e.target.value)} />
                <label htmlFor="dontWant" className="text-white font-['Noto_Sans'] text-[16px]">Не хочу вказувати</label>
              </div>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="agree"
                className="mr-2"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label htmlFor="agree" className="text-white font-['Noto_Sans'] text-[16px]">
                Я погоджуюсь з умовами
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-[8px] bg-[#A305A6] text-white font-bold text-[16px] mt-6"
            >
              Зареєструватися
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep3;