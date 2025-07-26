function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const episodeContainer = document.getElementById("root");
  episodeContainer.innerHTML = "";

  document.getElementById("main-heading").innerHTML =
    `<h1>Game of Thrones</h1>`;                                                                       // Removed episode count from heading for cleaner styling 

  const episodeCard = episodeList.map(createEpisodeCard);                                   

  episodeContainer.append(...episodeCard);                                                 

  const dataAttribution = document.createElement("p");
  dataAttribution.innerHTML =
    'Data originally from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>';
  episodeContainer.appendChild(dataAttribution);                                            
}

function createEpisodeCard(episode) {
  const template = document.getElementById("episode-card-template");
  const episodeCard = template.content.cloneNode(true);                                     

  const season = episode.season.toString().padStart(2, "0");
  const number = episode.number.toString().padStart(2, "0");
  episodeCard.querySelector("[data-title]").textContent = `${episode.name} – S${season}E${number}`;   // Combined title and episode code into a single line to simplify layout and improve readability


  episodeCard.querySelector("[data-summary]").innerHTML = episode.summary;                            // Removed "Summary:" label prefix to keep content presentation minimal

  const episodeImg = episodeCard.querySelector("[data-image]");
  if (episode.image && episode.image.medium) {
    episodeImg.src = episode.image.medium;
    episodeImg.alt = episode.name;
  } else {
    episodeImg.remove();
  }

  const episodeLink = episodeCard.querySelector("[data-link]");
  episodeLink.href = episode.url;
  
  return episodeCard;                                                                       
}

window.onload = setup;