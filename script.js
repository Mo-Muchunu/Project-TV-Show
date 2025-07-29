// Global state to store all episodes and the current search term
const state = {
  allEpisodes: [],
  searchTerm: "",
  selectedEpisodeId: "all",
};

function setup() {
  state.allEpisodes = getAllEpisodes();
  searchBox();
  episodeSelect();
  render();
}
// This function sets up the search box.
// When the user types, it updates the search term and re-renders the filtered episode list.
function searchBox() {
  const searchInput = document.getElementById("search-input");

  function operateSearch(event) {
    state.searchTerm = event.target.value.toLowerCase().trim();
    state.selectedEpisodeId = "all"; // Reset dropdown selection when searching
    document.getElementById("episode-select").value = "all";
    render();
  }

  searchInput.addEventListener("input", operateSearch);
  searchInput.addEventListener("keyup", operateSearch);
}

// This function creates a dropdown to select a specific episode
function episodeSelect() {
  const select = document.getElementById("episode-select");

  state.allEpisodes.forEach((episode) => {
    const season = episode.season.toString().padStart(2, "0");
    const number = episode.number.toString().padStart(2, "0");
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `S${season}E${number} - ${episode.name}`;
    select.appendChild(option);
  });

  select.addEventListener("change", (event) => {
    state.selectedEpisodeId = event.target.value;
    state.searchTerm = ""; // Clear search
    document.getElementById("search-input").value = "";
    render();
  });
}

// This function filters and displays episodes by name or summary (case-insensitive)
function render() {
  let filteredEpisodes;

  if (state.selectedEpisodeId !== "all") {
    filteredEpisodes = state.allEpisodes.filter(
      (ep) => ep.id.toString() === state.selectedEpisodeId
    );
  } else {
    filteredEpisodes = state.allEpisodes.filter((episode) => {
      const nameMatch = episode.name.toLowerCase().includes(state.searchTerm);
      let summaryMatch = false;
      if (episode.summary) {
        const lowerSummary = episode.summary.toLowerCase();
        summaryMatch = lowerSummary.includes(state.searchTerm);
      }

      return nameMatch || summaryMatch;
    });
  }
  // Create and display the filtered episode cards
  makePageForEpisodes(filteredEpisodes);

  // Show how many episodes matched the search
  updateCountDisplay(filteredEpisodes.length, state.allEpisodes.length);
}

// Display how many episodes are currently shown
function updateCountDisplay(filteredCount, totalCount) {
  const countDisplay = document.getElementById("search-count");
  countDisplay.textContent = `Displaying ${filteredCount} of ${totalCount} episodes`;
}

function makePageForEpisodes(episodeList) {
  const episodeContainer = document.getElementById("root");
  episodeContainer.innerHTML = "";

  document.getElementById(
    "main-heading"
  ).innerHTML = `<h1>Game of Thrones</h1>`; // Removed episode count from heading for cleaner styling

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
  episodeCard.querySelector(
    "[data-title]"
  ).textContent = `${episode.name} – S${season}E${number}`; // Combined title and episode code into a single line to simplify layout and improve readability

  episodeCard.querySelector("[data-summary]").innerHTML = episode.summary; // Removed "Summary:" label prefix to keep content presentation minimal

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
