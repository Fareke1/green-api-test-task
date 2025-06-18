// Получаем ссылки на элементы HTML по их ID
const idInstanceInput = document.getElementById('idInstance');
const apiTokenInstanceInput = document.getElementById('apiTokenInstance');
const apiResponseTextarea = document.getElementById('apiResponse');

// Получаем ссылки на кнопки
const getSettingsBtn = document.getElementById('getSettingsBtn');
const getStateInstanceBtn = document.getElementById('getStateInstanceBtn');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const sendFileByUrlBtn = document.getElementById('sendFileByUrlBtn');

// Получаем ссылки на поля ввода для отправки сообщений/файлов
const chatIdSendMessageInput = document.getElementById('chatIdSendMessage');
const messageTextInput = document.getElementById('messageText');
const chatIdSendFileInput = document.getElementById('chatIdSendFile');
const fileUrlInput = document.getElementById('fileUrl');


// Функция для вывода ответа API в текстовое поле на странице
function displayResponse(data) {
    // Преобразуем объект/массив в красивую JSON-строку с отступами (2 пробела)
    // Это делает вывод более читаемым
    apiResponseTextarea.value = JSON.stringify(data, null, 2);
}

// Главная функция для отправки запросов к Green-API
// Принимает:
// - method: название метода API (например, 'getSettings', 'sendMessage')
// - body: объект с данными для отправки (для POST-запросов, по умолчанию пустой)
async function callGreenApi(method, body = {}) {
    const idInstance = idInstanceInput.value;
    const apiTokenInstance = apiTokenInstanceInput.value;

    // Проверяем, введены ли idInstance и apiTokenInstance
    if (!idInstance || !apiTokenInstance) {
        displayResponse({ error: "Пожалуйста, введите idInstance и apiTokenInstance для выполнения запроса." });
        return; // Прекращаем выполнение, если данные отсутствуют
    }

    // Формируем полный URL для запроса к API
    // Пример: https://api.green-api.com/waInstance1234/getSettings/myApiToken
    const url = `https://api.green-api.com/waInstance${idInstance}/${method}/${apiTokenInstance}`;

    try {
        let options = {}; // Объект для настроек fetch-запроса

        // Определяем тип HTTP-метода (GET или POST) в зависимости от вызываемого метода Green-API
        if (method === 'getSettings' || method === 'getStateInstance') {
            // Для методов получения информации (getSettings, getStateInstance) используем GET-запрос
            options = {
                method: 'GET',
                // Для GET-запросов тело (body) не отправляется, и Content-Type обычно не нужен
            };
        } else {
            // Для методов, которые отправляют данные (sendMessage, sendFileByUrl), используем POST-запрос
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Указываем, что отправляем JSON
                },
                body: JSON.stringify(body) // Преобразуем JavaScript-объект в JSON-строку
            };
        }

        // Отправляем HTTP-запрос к API
        const response = await fetch(url, options);

        // Проверяем, был ли ответ сервера успешным (статус в диапазоне 200-299)
        if (!response.ok) {
            // Если ответ неуспешный (например, 400, 401, 404, 500), пытаемся получить детали ошибки
            const errorData = await response.json().catch(() => ({ message: response.statusText || "Неизвестная ошибка" }));
            displayResponse({
                status: response.status, // HTTP-статус код
                statusText: response.statusText, // Текстовое описание статуса
                error: `API Error: ${response.status}`, // Краткое описание ошибки
                details: errorData // Детали ошибки, полученные с сервера
            });
            console.error("API Call Error - Response not OK:", response.status, errorData);
            return; // Прекращаем выполнение функции после вывода ошибки
        }

        // Если ответ успешный, парсим его как JSON
        const data = await response.json();

        // Выводим полученные данные на страницу
        displayResponse(data);

    } catch (error) {
        // Ловим любые ошибки, которые могли произойти во время выполнения fetch-запроса (например, проблемы с сетью)
        displayResponse({ error: "Произошла ошибка при вызове API", details: error.message || "Проверьте ваше интернет-соединение или правильность URL." });
        console.error("API Call Error (Catch Block):", error);
    }
}

// --- Обработчики событий для кнопок ---

// 1. getSettings: Получение настроек инстанса
getSettingsBtn.addEventListener('click', () => {
    callGreenApi('getSettings'); // Для getSettings тело запроса не требуется
});

// 2. getStateInstance: Получение статуса инстанса (авторизован/не авторизован)
getStateInstanceBtn.addEventListener('click', () => {
    callGreenApi('getStateInstance'); // Для getStateInstance тело запроса не требуется
});

// 3. sendMessage: Отправка текстового сообщения
sendMessageBtn.addEventListener('click', () => {
    // Получаем номер получателя и текст сообщения из полей ввода
    const chatId = chatIdSendMessageInput.value;
    const message = messageTextInput.value;

    // Проверяем, что поля заполнены
    if (!chatId || !message) {
        displayResponse({ error: "Для отправки сообщения нужны номер получателя и текст сообщения." });
        return;
    }

    // Формируем тело запроса для sendMessage.
    // Важно: номер должен быть в формате '7XXXXXXXXXX@c.us'
    const body = {
        chatId: `${chatId}@c.us`, // Добавляем суффикс @c.us
        message: message
    };
    callGreenApi('sendMessage', body);
});

// 4. sendFileByUrl: Отправка файла по URL
sendFileByUrlBtn.addEventListener('click', () => {
    // Получаем номер получателя и URL файла из полей ввода
    const chatId = chatIdSendFileInput.value;
    const fileUrl = fileUrlInput.value;

    // Проверяем, что поля заполнены
    if (!chatId || !fileUrl) {
        displayResponse({ error: "Для отправки файла нужны номер получателя и URL файла." });
        return;
    }

    // Формируем тело запроса для sendFileByUrl.
    // Важно: номер должен быть в формате '7XXXXXXXXXX@c.us'
    // Имя файла берется из URL
    const body = {
        chatId: `${chatId}@c.us`, // Добавляем суффикс @c.us
        urlFile: fileUrl,
        fileName: fileUrl.substring(fileUrl.lastIndexOf('/') + 1) // Извлекаем имя файла из URL
    };
    callGreenApi('sendFileByUrl', body);
});