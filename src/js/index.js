// Подключение элементов интерфейса
const chatInput = document.querySelector(".text-input"); // Поле ввода текста
const chatTape = document.querySelector(".container__chat-tape"); // Лента чата

// Создаём подключение к WebSocket серверу
const socket = new WebSocket("ws://localhost:3001"); // Замените URL на адрес вашего сервера

// Флаг для исключения повторного отображения отправленных сообщений
let isOwnMessage = false;

// Функция для отображения сообщения в чате
function addMessageToChat(content, isSelf = true) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message");
  messageElement.classList.add(isSelf ? "self-message" : "other-message"); // Стилизация по типу сообщения

  messageElement.textContent = content; // Текст сообщения
  chatTape.appendChild(messageElement); // Добавляем в ленту чата
  chatTape.scrollTop = chatTape.scrollHeight; // Прокручиваем вниз
}

// Обработчик отправки сообщения
function handleSendMessage() {
  const message = chatInput.value.trim(); // Получаем текст из поля ввода

  if (!message) return; // Если поле пустое, ничего не делаем

  // Добавляем сообщение в интерфейс как своё
  addMessageToChat(message, true);

  // Отправляем сообщение на сервер через WebSocket
  if (socket && socket.readyState === WebSocket.OPEN) {
    isOwnMessage = true; // Устанавливаем флаг
    const messageData = {
      type: "text",
      content: message,
    };
    socket.send(JSON.stringify(messageData));
  }

  chatInput.value = ""; // Очищаем поле ввода
}

// Добавляем обработчик нажатия Enter в поле ввода
chatInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSendMessage();
  }
});

// Обработчик событий WebSocket
socket.onopen = () => {
  console.log("WebSocket: Подключено");
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "text") {
    // Проверяем, является ли сообщение своим
    if (isOwnMessage) {
      isOwnMessage = false; // Сбрасываем флаг
    } else {
      addMessageToChat(data.content, false); // Добавляем сообщение от другого пользователя
    }
  }
};

socket.onclose = () => {
  console.log("WebSocket: Соединение закрыто");
};
