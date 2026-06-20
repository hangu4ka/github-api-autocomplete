"use strict";

// `https://api.github.com/search/repositories?q=${query}&per_page=5`

async function getRepos(query) {
  try {
    let response = await fetch(
      `https://api.github.com/search/repositories?q=${query}&per_page=5`,
    );
    if (!response.ok) {
      throw new Error("Ошибка HTTP: " + response.status);
    }
    let data = await response.json();
    return data.items;
  } catch (error) {
    console.error("Не удалось получить данные: " + error.message);
    // при ошибке вернет пустой массив, чтобы код не сломался
    return [];
  }
}
const autocompleteList = document.querySelector(".autocomplete-list");
const repoListAppended = document.querySelector(".repo-list-appended");

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(fn(...args)), delay);
    });
  };
}

const debouncedFetch = debounce(getRepos, 500);

let result;
const searchInput = document.getElementById("search-input");
searchInput.addEventListener("input", async () => {
  result = await debouncedFetch(searchInput.value);
  autocompleteList.replaceChildren();
  const listElements = result.map((repo) => {
    const li = document.createElement("li");
    li.textContent = repo.name;
    return li;
  });
  autocompleteList.append(...listElements);
});

autocompleteList.addEventListener("click", (event) => {
  const repoListAppended = document.querySelector(".repo-list-appended");
  const repo = result.find((repo) => repo.name === event.target.textContent);
  searchInput.value = "";
  autocompleteList.replaceChildren(); //если нужно очистить автокомплит после выбора
  const li = document.createElement("li");
  li.innerHTML = ` 
  <div class="repo-info">
    <span>Name: ${repo.name}</span>
    <span>Owner: ${repo.owner.login}</span>
    <span>Stars: ${repo.stargazers_count}</span>
    </div>
    <button class="delete-btn">✕</button>`;
  const button = li.querySelector("button");
  button.addEventListener("click", () => {
    button.parentElement.remove();
  });
  repoListAppended.append(li);
});
