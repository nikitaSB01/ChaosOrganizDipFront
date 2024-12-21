// Подключение элементов интерфейса
const chatInput = document.querySelector(".text-input"); // Поле ввода текста
const chatTape = document.querySelector(".container__chat-tape"); // Лента чата

// Создаём подключение к WebSocket серверу
const socket = new WebSocket("ws://localhost:3001"); // Замените URL на адрес вашего сервера

// Флаг для исключения повторного отображения отправленных сообщений
let isOwnMessage = false;

//! Функция для отображения сообщения в чате

function addMessageToChat(content) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", "self-message"); // Все сообщения справа

  // Проверяем, есть ли ссылки в тексте
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const contentWithLinks = content.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });

  messageElement.innerHTML = contentWithLinks; // Используем innerHTML для рендеринга ссылок
  chatTape.appendChild(messageElement); // Добавляем в ленту чата
  chatTape.scrollTop = chatTape.scrollHeight; // Прокручиваем вниз
}

//! Обработчик отправки сообщения

function handleSendMessage() {
  const message = chatInput.value.trim();

  if (!message) return;

  addMessageToChat(message, true); // Отображаем как своё

  if (socket && socket.readyState === WebSocket.OPEN) {
    isOwnMessage = true;
    const messageData = {
      type: "text",
      content: message,
      isSelf: true, // Указываем, что сообщение отправлено вами
    };
    console.log("Sending message to server:", messageData);
    socket.send(JSON.stringify(messageData));
  }

  chatInput.value = "";
}

// Добавляем обработчик нажатия Enter в поле ввода
chatInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSendMessage();
  }
});

//! Обработчик событий WebSocket
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

//! Функция для загрузки сообщений при ленивой подгрузке

async function loadMessages(offset = 0, limit = 10) {
  console.log(
    "Sending GET request to /messages with offset and limit:",
    offset,
    limit
  );
  try {
    const response = await fetch(
      `http://localhost:3000/messages?offset=${offset}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error("Failed to load messages");
    }

    const messages = await response.json();
    console.log("Loaded messages from server in order:", messages);

    // Добавляем сообщения в том порядке, в котором они пришли
    messages.forEach((message) => {
      console.log("Adding message to chat:", message);
      addMessageToChat(message.content); // Добавляем в конец чата
    });
  } catch (error) {
    console.error("Error loading messages:", error);
  }
}

// Загрузка последних 10 сообщений при загрузке страницы
window.addEventListener("DOMContentLoaded", () => {
  loadMessages();
});
