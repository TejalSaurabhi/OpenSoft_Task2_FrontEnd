const BASE_URL = 'https://orca-app-4olxq.ondigitalocean.app/';
let currentCategory = 'general';
let currentPage = 1;
let isLoading = false;
let isFavoritesView = false;

//Fetch news with infinite scroll
async function fetchNews(category = 'general', page = 1, append = false) {
  console.log("✅ fetchNews() function is being called!");
  if (isLoading || isFavoritesView) return;
  isLoading = true;
  showSpinner();

  try {
    const response = await fetch(`${BASE_URL}/news?category=${category}&page=${page}`);
    const data = await response.json();
    hideSpinner();
    isLoading = false;

    console.log('Full API response:', data);
    console.log('Fetched articles:', data.articles);

    if (data.articles) {
      displayNews(data.articles, append);
    } else {
      console.error('No articles found in response.');
      if (!append) displayNews([]);
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    hideSpinner();
    isLoading = false;
    if (!append) displayNews([]);
  }
}

//Show/Hide spinner
function showSpinner() {
  document.getElementById('spinner').style.display = 'block';
}
function hideSpinner() {
  document.getElementById('spinner').style.display = 'none';
}

//Display news or favorites articles in the main container
function displayNews(articles = [], append = false) {
  const newsContainer = document.getElementById('news-container');
  if (!append) newsContainer.innerHTML = '';

  if (articles.length === 0 && !append) {
    newsContainer.innerHTML = '<p>No articles found.</p>';
    return;
  }

  articles.forEach(article => {
    const publishedDate = new Date(article.publishedAt);
    const timeAgo = calculateTimeAgo(publishedDate);
    const randomReadTime = Math.floor(Math.random() * 7) + 1;
    const randomViews = Math.floor(Math.random() * (17000 - 700 + 1)) + 700;
    const randomComments = Math.floor(randomViews / 100);

    const card = document.createElement('article');
    card.className = 'news-card';

    card.innerHTML = `
      <img class="card-image" src="${article.urlToImage || 'https://via.placeholder.com/400'}" alt="News Image" />
      <div class="card-body">
        <span class="date-label">${timeAgo}</span>
        <h3>${article.title || 'No Title Available'}</h3>
        <p>${article.description || 'No description available.'}</p>
      </div>
      <div class="action-container">
        <button class="favorite-btn">Favorite</button>
        <button class="share-btn">Share</button>
      </div>
      <div class="card-footer">
        <div><strong>${randomReadTime}m</strong><br />READ</div>
        <div><strong>${randomViews}</strong><br />VIEWS</div>
        <div><strong>${randomComments}</strong><br />COMMENTS</div>
      </div>
    `;
    newsContainer.appendChild(card);

    // Attach favorite button listener
    const favoriteBtn = card.querySelector('.favorite-btn');
    updateFavoriteButton(favoriteBtn, article);
    favoriteBtn.addEventListener('click', () => {
      toggleFavorite(article);
      updateFavoriteButton(favoriteBtn, article);
      //If in favorites view, refresh the view after change
      if (isFavoritesView) displayFavorites();
    });

    const shareBtn = card.querySelector('.share-btn');
    shareBtn.addEventListener('click', () => {
      shareArticle(article);
    });
  });
}

//Calculate "x days/weeks ago" from published date
function calculateTimeAgo(publishedDate) {
  const now = new Date();
  const diffInMs = now - publishedDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 1) return 'Today';
  if (diffInDays === 1) return '1 day ago';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  const weeks = Math.floor(diffInDays / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

//Favorites & local storage functions
function getFavorites() {
  return JSON.parse(localStorage.getItem('favorites')) || [];
}
function setFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}
function toggleFavorite(article) {
  const favorites = getFavorites();
  const index = favorites.findIndex(fav => fav.url === article.url);
  if (index === -1) {
    favorites.push(article);
  } else {
    favorites.splice(index, 1);
  }
  setFavorites(favorites);
}
function isFavorited(article) {
  return getFavorites().some(fav => fav.url === article.url);
}

//Update favorite button using class toggling
function updateFavoriteButton(button, article) {
  if (isFavorited(article)) {
    button.textContent = 'Remove Favorite';
    button.classList.add('favorited');
  } else {
    button.textContent = 'Add to Favorites';
    button.classList.remove('favorited');
  }
}

//Share article functionality
function shareArticle(article) {
  if (navigator.share) {
    navigator.share({
      title: article.title,
      text: article.description,
      url: article.url,
    })
    .then(() => console.log('Article shared successfully'))
    .catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Error sharing article', error);
      }
    });
  } else {
    copyToClipboard(article.url);
    alert('Article URL copied to clipboard!');
  }
}
function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

//Display Favorites in the main container
function displayFavorites() {
  const favorites = getFavorites();
  const newsContainer = document.getElementById('news-container');
  newsContainer.innerHTML = '';

  if (favorites.length === 0) {
    newsContainer.innerHTML = '<p>No favorite articles.</p>';
    return;
  }

  favorites.forEach(article => {
    const publishedDate = new Date(article.publishedAt);
    const timeAgo = calculateTimeAgo(publishedDate);
    const randomReadTime = Math.floor(Math.random() * 7) + 1;
    const randomViews = Math.floor(Math.random() * (17000 - 700 + 1)) + 700;
    const randomComments = Math.floor(randomViews / 100);

    const card = document.createElement('article');
    card.className = 'news-card';

    card.innerHTML = `
      <img class="card-image" src="${article.urlToImage || 'https://via.placeholder.com/400'}" alt="News Image" />
      <div class="card-body">
        <span class="date-label">${timeAgo}</span>
        <h3>${article.title || 'No Title Available'}</h3>
        <p>${article.description || 'No description available.'}</p>
      </div>
      <div class="action-container">
        <button class="favorite-btn">Remove Favorite</button>
        <button class="share-btn">Share</button>
      </div>
      <div class="card-footer">
        <div><strong>${randomReadTime}m</strong><br />READ</div>
        <div><strong>${randomViews}</strong><br />VIEWS</div>
        <div><strong>${randomComments}</strong><br />COMMENTS</div>
      </div>
    `;
    newsContainer.appendChild(card);

    const favoriteBtn = card.querySelector('.favorite-btn');
    updateFavoriteButton(favoriteBtn, article);
    favoriteBtn.addEventListener('click', () => {
      toggleFavorite(article);
      updateFavoriteButton(favoriteBtn, article);
      displayFavorites();
    });

    const shareBtn = card.querySelector('.share-btn');
    shareBtn.addEventListener('click', () => {
      shareArticle(article);
    });
  });
}

//Infinite scroll
window.addEventListener('scroll', () => {
  if (!isFavoritesView && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading) {
    currentPage++;
    fetchNews(currentCategory, currentPage, true);
  }
});

//Toggle favorites view
document.getElementById('toggleFavoritesBtn').addEventListener('click', () => {
  isFavoritesView = !isFavoritesView;
  const toggleBtn = document.getElementById('toggleFavoritesBtn');
  const controls = document.getElementById('controls'); // Category filter container

  if (isFavoritesView) {
    toggleBtn.textContent = 'View All News';
    if (controls) controls.style.display = 'none';
    displayFavorites();
  } else {
    toggleBtn.textContent = 'View Favorites';
    if (controls) controls.style.display = 'block';
    currentPage = 1;
    fetchNews(currentCategory, currentPage, false);
  }
});

//Category change listener
document.getElementById('categorySelect').addEventListener('change', (e) => {
  currentCategory = e.target.value;
  currentPage = 1;
  if (!isFavoritesView) {
    fetchNews(currentCategory, currentPage, false);
  }
});

//Initial fetch
if (!isFavoritesView) {
  fetchNews(currentCategory, currentPage, false);
}
