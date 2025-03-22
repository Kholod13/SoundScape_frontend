import React, {useState} from "react";
import './settings.css';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';

const SettingsPage: React.FC = () => {
   const [seconds, setSeconds] = useState<number>(0);
   const navigate = useNavigate();
   const authContext = useAuth();
   const logout = authContext ? authContext.logout : () => { };

   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     const value = Number(event.target.value);
     setSeconds(value);
   };

   const goBack = () => {
      navigate(-1);
    };
    const handleLogout = () => {
      logout();
      navigate('/login');
   };

    return (
        <div className="container">
            <div className="button-back">
               <button className="button-back" id="buttonBack" onClick={goBack}>
                  <img src="/public/images/arrow-back.svg" alt="back" />
               </button>
            </div>
            <h1 className="title-main">Налаштування</h1>
            <div className="items">
               <div className="item">
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Акаунт</h3>
                        <p className="description">Змінити способи входу</p>
                     </div>
                     <div className="controler">
                        <button className="edit-account" id="editAccount" onClick={handleLogout}>Змінити</button>
                     </div>
                  </div>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Мова</h3>
                        <p className="description">Виберіть мову. Щоб зміни почали діяти, перезапустіть додаток.</p>
                     </div>
                     <div className="controler">
                        <select id="language-change" name="language">
                        <option value="ukrainian">Українська(Ukrainian)</option>
                        <option value="english">Англійська(English)</option>
                        </select>
                     </div>
                  </div>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Відображення</h3>
                        <p className="description">Показувати панель "Відтворюється" після натискання кнопки "Відтворити"</p>
                     </div>
                     <div className="controler">
                        <label className="switch">
                           <input type="checkbox" id="show-panel" />
                           <span className="slider"></span>
                        </label>
                     </div>
                  </div>
               </div>
               <div className="item">
                  <h2 className="title">Переходи між треками</h2>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Без пауз</h3>
                        <p className="description">Усунення всіх можливих пауз між треками.</p>
                     </div>
                     <div className="controler">
                        <label className="switch">
                           <input type="checkbox" id="without-pause" />
                           <span className="slider"></span>
                        </label>
                     </div>
                  </div>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Автомікс</h3>
                        <p className="description">Увімкнення плавного переходу між піснями в певних плейлістах.</p>
                     </div>
                     <div className="controler">
                        <label className="switch">
                           <input type="checkbox" id="automix" />
                           <span className="slider"></span>
                        </label>
                     </div>
                  </div>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Плавний перехід</h3>
                        <p className="description">Налаштуйте тривалість затихання, вступних тонів і накладання для переходів між треками.</p>
                     </div>
                     <div className="controler">
                        <div style={{ width: "400px", margin: "20px auto", textAlign: "center" }}>
                           <div style={{
                              width: "100%",
                              backgroundColor: "#ccc",
                              borderRadius: "5px",
                              overflow: "hidden",
                              height: "10px",
                              marginBottom: "0px",
                              display: "none",
                           }}>
                           <div style={{
                              height: "100%",
                              width: `${(seconds / 12) * 100}%`,
                              backgroundColor: "#4caf50",
                              transition: "width 0.2s",
                           }}>
                           </div>
                        </div>
                        <input
                           className="range"
                           type="range"
                           min="0"
                           max="12"
                           value={seconds}
                           onChange={handleChange}
                           style={{ width: "100%" }}
                           />
                        <p>{seconds} сек</p>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="item">
                  <h2 className="title">Керування прослуховуванням</h2>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Автовідтворення</h3>
                        <p className="description">Відтворення схожого контенту після закінчення прослуховування треків.</p>
                     </div>
                     <div className="controler">
                        <label className="switch">
                           <input type="checkbox" id="automix" />
                           <span className="slider"></span>
                        </label>
                     </div>
                  </div>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Монозвук</h3>
                        <p className="description">Лівий і правий динаміки відтворюють одну аудіодоріжку.</p>
                     </div>
                     <div className="controler">
                     <label className="switch">
                           <input type="checkbox" id="automix" />
                           <span className="slider"></span>
                        </label>
                     </div>
                  </div>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Доступ до музики, що відтворюється на пристрої</h3>
                        <p className="description">Інші додатки матимуть доступ для відображення прослуховуваної на пристрої музики.</p>
                     </div>
                     <div className="controler">
                        <label className="switch">
                           <input type="checkbox" id="automix" />
                           <span className="slider"></span>
                        </label>
                     </div>
                  </div>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Приховання пауз</h3>
                        <p className="description">Пропуск пауз в епізодах подкастів.</p>
                     </div>
                     <div className="controler">
                        <label className="switch">
                           <input type="checkbox" id="automix" />
                           <span className="slider"></span>
                        </label>
                     </div>
                  </div>
               </div>
               <div className="item">
                  <h2 className="title">Регулювання гучності</h2>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Регулювання гучності</h3>
                        <p className="description">Однаковий рівень гучності для всіх треків.</p>
                     </div>
                     <div className="controler">
                        <label className="switch">
                           <input type="checkbox" id="automix" />
                           <span className="slider"></span>
                        </label>
                     </div>
                  </div>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Контроль гучності для подкастів</h3>
                        <p className="description">Автоматичне регулювання рівня гучності подкастів для чистого та збалансованого звучання.</p>
                     </div>
                     <div className="controler">
                        <label className="switch">
                           <input type="checkbox" id="automix" />
                           <span className="slider"></span>
                        </label>
                     </div>
                  </div>
               </div>
               <div className="item">
                  <h2 className="title">Прослухане вами</h2>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Нещодавно прослухані виконавці</h3>
                        <p className="description">У вашому профілі користувачі можуть переглянути нещодавно прослуханих вами виконавців.</p>
                     </div>
                     <div className="controler">
                        <label className="switch">
                           <input type="checkbox" id="automix" />
                           <span className="slider"></span>
                        </label>
                     </div>
                  </div>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Прослухане вами</h3>
                        <p className="description">Ваші підписники можуть переглянути, що ви слухаєте, у режимі реального часу.</p>
                     </div>
                     <div className="controler">
                        <label className="switch">
                           <input type="checkbox" id="automix" />
                           <span className="slider"></span>
                        </label>
                     </div>
                  </div>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Приватний сеанс</h3>
                        <p className="description">Тимчасово приховайте прослухане вами від підписників.</p>
                     </div>
                     <div className="controler">
                        <label className="switch">
                           <input type="checkbox" id="automix" />
                           <span className="slider"></span>
                        </label>
                     </div>
                  </div>
               </div>
               <div className="item">
                  <h2 className="title">Видимість профілю</h2>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Підписники й підписки</h3>
                        <p className="description">У вашому профілі користувачі можуть переглянути ваших підписників і ваші підписки.</p>
                     </div>
                     <div className="controler">
                        <label className="switch">
                           <input type="checkbox" id="automix" />
                           <span className="slider"></span>
                        </label>
                     </div>
                  </div>
                  <div className="row">
                     <div className="info">
                        <h3 className="sub-title">Заблоковані користувачі</h3>
                        <p className="description">Ви можете блокувати перегляд профілю окремими користувачами.</p>
                     </div>
                  </div>
               </div>
            </div>
        </div>
    );
};

export default SettingsPage;