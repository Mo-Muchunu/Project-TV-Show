// Refactor code to use map() and (...spread) to improve card creation logic and ensure reusability 
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const episodeContainer = document.getElementById("root");
  episodeContainer.innerHTML = "";

  document.getElementById("main-heading").innerHTML =
    `<h1>Game of Thrones</h1><p>Total Episodes: ${episodeList.length}</p>`;                 // Set heading and episode count 

  // Map each episode to a DOM element
  const episodeCard = episodeList.map(createEpisodeCard);                                   // Transform array of episode data into array of DOM nodes

  // Append all cards in one go for performance- replacing Document Fragment
  episodeContainer.append(...episodeCard);                                                  // Spread array into individual elements for appending

  const dataAttribution = document.createElement("p");
  dataAttribution.innerHTML =
    'Data originally from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>';
  episodeContainer.appendChild(dataAttribution);                                            // Append to page
}

// Reusable function to build an episode card from template
function createEpisodeCard(episode) {
  const template = document.getElementById("episode-card-template");
  const episodeCard = template.content.cloneNode(true);                                     // Clone the template content

  episodeCard.querySelector("[data-title]").textContent = episode.name;

  const season = episode.season.toString().padStart(2, "0");
  const number = episode.number.toString().padStart(2, "0");
  episodeCard.querySelector("[data-code]").textContent = `S${season}E${number}`;

  episodeCard.querySelector("[data-summary]").innerHTML = `Summary: ${episode.summary}`;

  const episodeLink = episodeCard.querySelector("[data-link]");
  episodeLink.href = episode.url;

  const episodeImg = episodeCard.querySelector("[data-image]");
  if (episode.image && episode.image.medium) {
    episodeImg.src = episode.image.medium;
    episodeImg.alt = episode.name;
  } else {
    episodeImg.remove();
  }

  return episodeCard;                                                                       // Return DOM node for episode
}

window.onload = setup;