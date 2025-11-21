const recArr = [];
const repoFetch = createDebounced(getRepos, 500);

const searchElement = document.querySelector(".search");
const recommendElement = document.querySelector(".recommend");
const resultElement = document.querySelector(".result");

function createDebounced(fn, delay = 0) {
  let timerId;
  return function (...params) {
    clearTimeout(timerId);
    return new Promise((resolve, reject) => {
      timerId = setTimeout(() => {
        fn.apply(this, params).then(resolve).catch(reject);
      }, delay);
    });
  };
}

searchElement.addEventListener("input", handleSearchInput);
recommendElement.addEventListener("click", handleRecommendClick);
resultElement.addEventListener("click", handleResultClick);

async function handleSearchInput(e) {
  clearRecommendations();
  recArr.length = 0;
  
  try {
    const data = await repoFetch();
    if (data.items && data.items.length > 0) {
      displayRecommendations(data.items);
    }
  } catch (err) {
    console.error('Search failed:', err);
  }
}

function handleRecommendClick(e) {
  if (e.target.tagName !== 'H3') return;
  
  clearRecommendations();
  searchElement.value = "";
  
  const selectedRepo = recArr.find(item => item.name === e.target.textContent);
  if (!selectedRepo) return;

  addRepositoryCard(selectedRepo);
  recArr.length = 0;
}

function handleResultClick(e) {
  if (!e.target.classList.contains('x')) return;
  
  const itemToRemove = e.target.parentNode;
  resultElement.removeChild(itemToRemove);
  
  if (resultElement.children.length === 0) {
    resultElement.innerHTML = '';
  }
}

async function getRepos() {
  const query = document.querySelector("input").value.trim();
  
  if (!query) {
    recommendElement.innerHTML = '';
    recArr.length = 0;
    return { items: [] };
  }

  try {
    const apiResponse = await fetch(
      `https://api.github.com/search/repositories?q=${query}&per_page=5`
    );
    
    if (!apiResponse.ok) {
      throw new Error(`Request failed with status: ${apiResponse.status}`);
    }
    
    return await apiResponse.json();
  } catch (err) {
    console.error('API call error:', err);
    return { items: [] };
  }
}

function clearRecommendations() {
  const existingItems = document.querySelectorAll("h3");
  existingItems.forEach(element => element.remove());
}

function displayRecommendations(repositories) {
  let count = 0;
  for (const repository of repositories) {
    if (count >= 5) break;
    
    const recommendationItem = document.createElement("h3");
    recommendationItem.textContent = repository.name;
    recommendElement.append(recommendationItem);
    
    recArr.push({
      name: repository.name,
      owner: repository.owner.login,
      stars: repository.stargazers_count,
    });
    
    count++;
  }
}

function addRepositoryCard(repoData) {
  const cardElement = document.createElement("div");
  cardElement.className = "item";
  
  const infoContainer = document.createElement("div");
  
  const nameElement = createTextElement(`Name: ${repoData.name}`);
  const ownerElement = createTextElement(`Owner: ${repoData.owner}`);
  const starsElement = createTextElement(`Stars: ${repoData.stars}`);
  
  infoContainer.append(nameElement, ownerElement, starsElement);
  
  const deleteButton = document.createElement("button");
  deleteButton.className = "x";
  
  cardElement.append(infoContainer, deleteButton);
  resultElement.append(cardElement);
}

function createTextElement(text) {
  const element = document.createElement("p");
  element.textContent = text;
  return element;
}