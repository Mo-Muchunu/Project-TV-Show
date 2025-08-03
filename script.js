const state = {
  // Global state object to track all episodes, current search, and dropdown choice
  allEpisodes: [],
  searchTerm: "",
  selectedEpisodeId: "all",
  selectedShowId: null,
  episodeCache: new Map(), // ShowID -> episodes[]
  allShows: [], // For show dropdown
};

function displayLoadingMessage() {
  // Display loading message while data fetches
  const root = document.getElementById("root");
  root.innerHTML = "<p>Loading episodes, please wait...</p>";
}

function showErrorNotice(message) {
  // Show error message if fetch fails
  const root = document.getElementById("root");
  root.innerHTML = `<p style="color:red;">${message}</p>`;
}

// Fetch list of all shows and populate the show dropdown
async function setup() {
  try {
    displayLoadingMessage(); // Show loading message before fetch starts

    const response = await fetch("https://api.tvmaze.com/shows"); // Fetch episode data from TVMaze API
    if (!response.ok) {
      // Handle bad response
      throw new Error(
        `Failed to fetch episodes: ${response.status} ${response.statusText}`
      );
    }

    const shows = await response.json(); // Convert response to usable JSON array

    shows.sort((a, b) => {
      // Sort shows alphabetically, ignoring upper/lowercase
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });

    state.allShows = shows; // Store the sorted list for later use

    populateShowSelect(); // Populate the dropdown list
  } catch (error) {
    showErrorNotice("Failed to load shows list. Please try again later.");
    console.error("Fetch error:", error); // Log actual error
  }
}
// Fill the show dropdown menu
function populateShowSelect() {
  const showSelect = document.getElementById("show-select");
  showSelect.innerHTML = `<option value="">Select a show...</option>`;

  state.allShows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  showSelect.addEventListener("change", (e) => {
    const showId = e.target.value;
    if (!showId) return;

    state.selectedShowId = showId;
    state.selectedEpisodeId = "all";
    state.searchTerm = "";
    document.getElementById("search-input").value = "";
    fetchEpisodesForShow(showId);
  });
}

// Fetch and cache episodes for the selected show
async function fetchEpisodesForShow(showId) {
  if (state.episodeCache.has(showId)) {
    state.allEpisodes = state.episodeCache.get(showId);
    updateShowHeading(showId);
    searchBox();
    clearEpisodeSelect();
    episodeSelect();
    return;
  }

  try {
    displayLoadingMessage();
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch episodes: ${response.status} ${response.statusText}`
      );
    }

    const episodes = await response.json();
    state.episodeCache.set(showId, episodes);
    state.allEpisodes = episodes;
    updateShowHeading(showId);
    searchBox();
    clearEpisodeSelect();
    episodeSelect();
  } catch (error) {
    showErrorNotice("Could not load episodes.");
    console.error("Episode fetch error:", error);
  }
}

// Update main heading with current show name
function updateShowHeading(showId) {
  const show = state.allShows.find(
    (s) => s.id.toString() === showId.toString()
  );
  const heading = document.getElementById("main-heading");
  heading.innerHTML = `<h1>${show ? show.name : "TV Show"}</h1>`;
}

// Reset the episode dropdown before adding new options
function clearEpisodeSelect() {
  const select = document.getElementById("episode-select");
  select.innerHTML = `<option value="all">Show All Episodes</option>`;
}

// Set up search box
function searchBox() {
  const searchInput = document.getElementById("search-input");

  function operateSearch(event) {
    state.searchTerm = event.target.value.toLowerCase().trim();
    state.selectedEpisodeId = "all";
    render();
  }
  searchInput.addEventListener("input", operateSearch);
  searchInput.addEventListener("keyup", operateSearch);
}

function formatEpisodeCode(episode) {
  // Isolated this function to be used globally, avoiding duplication
  const season = episode.season.toString().padStart(2, "0"); // Was also used in episodeSelect and createEpisodeCard
  const number = episode.number.toString().padStart(2, "0");
  return `S${season}E${number}`;
}

// Dropdown for specific episode
function episodeSelect() {
  const select = document.getElementById("episode-select");

  state.allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    select.appendChild(option);
  });

  select.addEventListener("change", (event) => {
    // Attach event after dropdown is filled
    state.selectedEpisodeId = event.target.value;
    state.searchTerm = "";
    document.getElementById("search-input").value = "";
    render(); // Re-render based on selected episode
  });
  render(); // Initial render on load
}

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
        summaryMatch = episode.summary.toLowerCase().includes(state.searchTerm);
      }
      return nameMatch || summaryMatch;
    });
  }
  makePageForEpisodes(filteredEpisodes); // Render filtered list
  updateCountDisplay(filteredEpisodes.length); // Update matched episode count
}

// Print current number of episodes displayed
function updateCountDisplay(filteredCount) {
  const countDisplay = document.getElementById("search-count");
  if (filteredCount === 1) {
    countDisplay.textContent = "1 Episode"; // Singular count display
  } else {
    countDisplay.textContent = `${filteredCount} Episodes`;
  }
}

function makePageForEpisodes(episodeList) {
  const episodeContainer = document.getElementById("root");
  episodeContainer.innerHTML = "";

  const episodeCard = episodeList.map(createEpisodeCard);
  episodeContainer.append(...episodeCard);

  function createEpisodeCard(episode) {
    const episodeCard = document
      .getElementById("episode-card-template")
      .content.cloneNode(true);

    const title = episodeCard.querySelector("[data-title]");
    title.textContent = episode.name;

    const episodeCode = formatEpisodeCode(episode);
    const episodeNumber = episodeCard.querySelector("[data-episode-number]");

    const episodeLink = document.createElement("a");
    episodeLink.href = episode.url;
    episodeLink.textContent = episodeCode; // Combining episode code and link for cleaner layout
    episodeLink.target = "_blank";
    episodeLink.rel = "noopener noreferrer";
    episodeNumber.textContent = "";

    episodeNumber.appendChild(episodeLink); // Append link to episode number element

    episodeCard.querySelector("[data-summary]").innerHTML =
      episode.summary || "<em>No summary available.</em>"; // Display message if API data missing

    const episodeImg = episodeCard.querySelector("[data-image]");
    if (episode.image && episode.image.medium) {
      episodeImg.src = episode.image.medium;
      episodeImg.alt = episode.name;
    } else {
      episodeImg.remove();
    }
    return episodeCard;
  }

  const dataAttribution = document.getElementById("footer"); // Data attribution in footer element for better structure
  dataAttribution.innerHTML = `TV Show Project   |   Mo Muchunu   |   Data originally from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>`;
  document.body.appendChild(dataAttribution);
}

window.onload = setup;
