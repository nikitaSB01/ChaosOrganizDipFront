// Подключение элементов интерфейса
const chatInput = document.querySelector(".text-input"); // Поле ввода текста
const chatTape = document.querySelector(".container__chat-tape"); // Лента чата

// Создаём подключение к WebSocket серверу
const socket = new WebSocket("ws://localhost:3001"); // Замените URL на адрес вашего сервера

// Флаг для исключения повторного отображения отправленных сообщений
let isOwnMessage = false;

//! Функция для отображения сообщения в чате

function addMessageToChat(content, mimetype) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("chat-message", "self-message");

  if (
    mimetype &&
    typeof mimetype === "string" &&
    mimetype.startsWith("image/")
  ) {
    // Если сообщение — это изображение
    messageElement.innerHTML = `<img src="${content}" alt="Uploaded image" class="chat-image" />`;
  } else if (mimetype && typeof mimetype === "string") {
    // Если это другой файл, создаём ссылку на скачивание
    messageElement.innerHTML = `<a href="${content}" download>Скачать файл</a>`;
  } else {
    // Если это текст
    messageElement.textContent = content;
  }

  chatTape.appendChild(messageElement);
  chatTape.scrollTop = chatTape.scrollHeight; // Прокрутка вниз
}

//! Обработчик отправки сообщения

function handleSendMessage() {
  const message = chatInput.value.trim();

  if (!message) return;

  addMessageToChat(message); // Передаём только текст

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
  try {
    const response = await fetch(
      `http://localhost:3000/messages?offset=${offset}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error("Failed to load messages");
    }

    const messages = await response.json();
    console.log("Loaded messages from server:", messages);

    messages.forEach((message) => {
      addMessageToChat(message.content, message.mimetype); // Передаём mimetype
    });
  } catch (error) {
    console.error("Error loading messages:", error);
  }
}

// Загрузка последних 10 сообщений при загрузке страницы
window.addEventListener("DOMContentLoaded", () => {
  loadMessages();
});

//! Загрузка файлов (изображения, видео, аудио)

const fileUploadButton = document.getElementById("file-upload-btn");
const fileInput = document.getElementById("file-input");

// При нажатии на кнопку имитируем клик по input
fileUploadButton.addEventListener("click", () => {
  fileInput.click();
});

// Обработчик выбора файлов
fileInput.addEventListener("change", (event) => {
  const files = Array.from(event.target.files);
  files.forEach(uploadFile);
});

// Функция загрузки файла
async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload file");
    }

    const uploadedFile = await response.json();
    console.log("Uploaded file:", uploadedFile);

    addMessageToChat(uploadedFile.content, uploadedFile.mimetype); // Передаём mimetype
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}
