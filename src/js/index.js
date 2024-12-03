document.addEventListener("DOMContentLoaded", function () {
  const refreshButton = document.getElementById("refreshButton");
  const newsContainer = document.getElementById("newsContainer");
  const errorContainer = document.getElementById("errorContainer");

  let isLoading = false; // Флаг загрузки

  async function loadNews() {
    if (isLoading) return; // Если данные уже загружаются, не повторяем запрос

    console.log("Запрос к /news отправлен");

    isLoading = true; // Устанавливаем флаг загрузки

    // Очистка содержимого контейнера новостей перед показом загрузки
    newsContainer.innerHTML = "";

    // Показываем имитацию контента в виде серых блоков
    newsContainer.innerHTML = `
      <div class="loading-item">
        <div class="loading-item-elem"></div>
        <div class="loading-item-el"></div>
      </div>
      <div class="loading-item">
        <div class="loading-item-elem"></div>
        <div class="loading-item-el"></div>
      </div>
      <div class="loading-item">
        <div class="loading-item-elem"></div>
        <div class="loading-item-el"></div>
      </div>
    `;
    errorContainer.style.display = "none"; // Скрываем ошибку

    try {
      const response = await fetch(
        "https://loadingstylingserver.onrender.com/news"
      );

      if (!response.ok) {
        throw new Error("Ошибка при получении данных");
      }

      const news = await response.json();
      console.log("Новости получены", news);

      // Очистка индикатора загрузки после получения данных
      newsContainer.innerHTML = "";

      if (news.length > 0) {
        newsContainer.innerHTML = news
          .map(
            (item) =>
              `<div class="news-item">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
              </div>`
          )
          .join("");
      } else {
        newsContainer.innerHTML = "<p>Нет новостей.</p>";
      }
    } catch (error) {
      console.log("Ошибка при загрузке новостей:", error);

      // Задержка на 2 секунды перед появлением ошибки (имитация загрузки)
      setTimeout(() => {
        // Очистка индикатора загрузки перед показом ошибки
        newsContainer.innerHTML = ""; // Скрыть индикатор загрузки

        // Показать сообщение об ошибке
        errorContainer.style.display = "block"; // Показать ошибку
      }, 2000); // 2 секунды задержки перед отображением ошибки
    } finally {
      isLoading = false; // Сбрасываем флаг загрузки
    }
  }

  // Кнопка для обновления данных
  refreshButton.addEventListener("click", loadNews);

  // Загружаем новости при загрузке страницы
  loadNews();
});

/// Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
      console.log("Service Worker зарегистрирован");
    } catch (e) {
      console.log("Ошибка регистрации Service Worker:", e);
    }
  });
}
