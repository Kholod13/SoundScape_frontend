
const Footer = () => {
  return (
    <footer className="w-full bg-black text-white p-8">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h2 className="font-bold mb-4">Компанія</h2>
          <ul>
            <li className="mb-2"><a href="#">Про нас</a></li>
            <li><a href="#">Вакансії</a></li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold mb-4">Спільноти</h2>
          <ul>
            <li className="mb-2"><a href="#">Для виконавців</a></li>
            <li className="mb-2"><a href="#">Для розробників</a></li>
            <li className="mb-2"><a href="#">Для інвесторів</a></li>
            <li><a href="#">Для рекламодавців</a></li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold mb-4">Корисні посилання</h2>
          <ul>
            <li className="mb-2"><a href="#">Підтримка</a></li>
            <li><a href="#">Мобільний додаток</a></li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold mb-4">Підписки</h2>
          <ul>
            <li className="mb-2"><a href="#">Premium Individual</a></li>
            <li className="mb-2"><a href="#">Premium Duo</a></li>
            <li className="mb-2"><a href="#">Premium Family</a></li>
            <li><a href="#">Premium Student</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;