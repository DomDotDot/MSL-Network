let player;
let currentServerId;
let currentPosterIndex = 0;
let posterInterval;


// Загрузка данных о серверах из JSON
function loadServerData() {
    return fetch('include/servers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .catch(e => {
            console.error('Произошла ошибка при загрузке или разборе JSON:', e);
        });
}

// Создание карточек серверов
function createServerCards(servers) {
    const serverList = document.getElementById('server-list');
    if (serverList) {
        servers.forEach(server => {
            const serverCard = document.createElement('div');
            serverCard.classList.add('server-card');
            serverCard.innerHTML = `
                <h3>${server.name}</h3>
                <p>${server.description}</p>
                <button class="details-btn" data-server-id="${server.id}">Подробнее</button>
            `;
            serverList.appendChild(serverCard);
        });

        // Добавление обработчиков для кнопок "Подробнее"
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const serverId = this.getAttribute('data-server-id');
                showServerDetails(serverId);
            });
        });
    }
}

// Показ деталей сервера
// Updated function to show server details
function showServerDetails(serverId) {
    currentServerId = serverId;
    const serverDetails = document.getElementById('server-details');
    serverDetails.style.display = 'block';

    loadServerData().then(data => {
        const server = data.servers.find(s => s.id == serverId);
        if (server) {
            updatePosterContent(server.posters, 0);
            document.querySelector('.server-description').innerHTML = `<h2>${server.name}</h2>${server.fullDescription}`;

            startPosterInterval(server.posters);
            
            // Загрузка YouTube видео
            if (player) {
                player.loadVideoById(server.trailer);
            } else {
                player = new YT.Player('youtube-player', {
                    height: '360',
                    width: '640',
                    videoId: server.trailer,
                });
            }

              // Display server tags
  const tagsContainer = document.querySelector('.server-tags');
  tagsContainer.innerHTML = ''; // Clear any existing tags
  server.tags.forEach(tag => {
    const tagButton = document.createElement('button');
    tagButton.classList.add('tag-button');
    tagButton.textContent = tag;
    tagsContainer.appendChild(tagButton);
  });

            // Создание секции преимуществ
            const featuresContainer = document.querySelector('.server-features');
            featuresContainer.innerHTML = '';
            server.features.forEach(feature => {
                const featureElement = document.createElement('div');
                featureElement.classList.add('feature');
                featureElement.innerHTML = `
                    <img src="${feature.image}" alt="${feature.name}">
                    <h3>${feature.name}</h3>
                    <p>${feature.description}</p>
                `;
                featuresContainer.appendChild(featureElement);
            });

            // Запуск автоматического переключения постеров
            startPosterInterval(server.posters);
        }
    });
}

// Updated function to update poster content with fade effect
function updatePosterContent(posters, index) {
    const posterContainer = document.querySelector('.poster-container');
    const posterText = document.querySelector('.poster-text');

    // Fade out
    posterContainer.style.opacity = 0;
    posterText.style.opacity = 0;

    setTimeout(() => {
        // Update content
        posterContainer.style.backgroundImage = `url(${posters[index].image})`;
        posterText.innerHTML = `<h2>${posters[index].title}</h2><p>${posters[index].text}</p>`;

        // Fade in
        posterContainer.style.opacity = 1;
        posterText.style.opacity = 1;

        // Update navigation
        updatePosterNavigation(posters, index);
    }, 500); // Half of the transition time
}


 // New function to update poster navigation
function updatePosterNavigation(posters, activeIndex) {
    const navigation = document.querySelector('.poster-navigation');
    navigation.innerHTML = '';
    posters.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.toggle('active', i === activeIndex);
        if (i === activeIndex) {
            dot.classList.add('animating');
        }
        dot.addEventListener('click', () => {
            updatePosterContent(posters, i);
            resetPosterInterval(posters);
        });
        navigation.appendChild(dot);
    });
}

// Updated function to start poster interval
function startPosterInterval(posters) {
    if (posterInterval) {
        clearInterval(posterInterval);
    }
    posterInterval = setInterval(() => {
        currentPosterIndex = (currentPosterIndex + 1) % posters.length;
        updatePosterContent(posters, currentPosterIndex);
    }, 10000); // Change poster every 10 seconds
}

// Сброс интервала постеров
function resetPosterInterval(posters) {
    clearInterval(posterInterval);
    startPosterInterval(posters);
}

// Обработчик для кнопок "Приобрести"
function handlePurchase() {
    // Здесь будет логика для перехода на страницу оплаты
    console.log('Переход на страницу оплаты');
}

// Инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    const background = document.querySelector('.background');
    if (background) {
   
    }

    // Копирование IP адреса
    const copyIpButton = document.getElementById('copy-ip');
    if (copyIpButton) {
        copyIpButton.addEventListener('click', function() {
            const ip = this.textContent.split(': ')[1];
            navigator.clipboard.writeText(ip).then(() => {
                this.textContent = 'IP скопирован!';
                setTimeout(() => {
                    this.textContent = `IP: ${ip}`;
                }, 2000);
            });
        });
    }

    // Плавная прокрутка к разделу "Наши сервера"
    const startButton = document.getElementById('start-btn');
    const serversSection = document.getElementById('servers');
    if (startButton && serversSection) {
        startButton.addEventListener('click', function() {
            serversSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Загрузка данных о серверах и создание карточек
    loadServerData().then(data => {
        if (data && data.servers) {
            createServerCards(data.servers);
        }
    });

    // Обработчики для кнопок "Приобрести"
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', handlePurchase);
    });
});

// Функция для закрытия детальной страницы сервера
function closeServerDetails() {
    const serverDetails = document.getElementById('server-details');
    serverDetails.style.display = 'none';
    if (posterInterval) {
        clearInterval(posterInterval);
    }
    if (player) {
        player.stopVideo();
    }
}

// Добавляем обработчик для закрытия детальной страницы (например, при нажатии Esc)
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeServerDetails();
    }
});

// Функция для инициализации YouTube API
function onYouTubeIframeAPIReady() {
    // YouTube API готов к использованию
    console.log('YouTube API готов');
}
        