const state = {
  allEpisodes: [],
  searchTerm: "",
  selectedEpisodeId: "all",
  selectedShowId: null,
  episodeCache: new Map(),
  showCache: [],
  view: "shows",                                                                    // UI mode "shows" page view
};

function displayLoadingMessage() {
  const root = document.getElementById("root");
  root.innerHTML = "<p class='loading'>Loading, please wait...</p>";                // Added class for styling
}

function showErrorNotice(message) {
  const root = document.getElementById("root");
  root.innerHTML = `<p style="color:red;">${message}</p>`;
}

async function setup() {
  try {
    displayLoadingMessage();
    const response = await fetch("https://api.tvmaze.com/shows");
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
    }
    const shows = await response.json();

    shows.sort((a, b) => a.name.localeCompare(b.name));
    state.showCache = shows;
    renderShows();
    updateShowHeading();                                                            // Set heading to "TV Shows" on initial load
  } catch (error) {
    console.error("Fetch error:", error);
    showErrorNotice("Failed to load shows list. Please try again later.");
  }
}

function formatEpisodeCode(episode) {
  const season = episode.season.toString().padStart(2, "0");
  const episodeNumber = episode.number.toString().padStart(2, "0");
  return `S${season}E${episodeNumber}`;
}


document.getElementById("show-search").addEventListener("input", (e) => {
  state.searchTerm = e.target.value.toLowerCase().trim();
  renderShows();
});

function updateShowHeading(showId) {
  const heading = document.getElementById("page-heading");                          // Changed to more descriptive id
  if (!showId) {
    heading.innerHTML = `<h1>TV Shows</h1>`;
    return;
  }

  const show = state.showCache.find(
    (s) => s.id.toString() === showId.toString()
  );
  heading.innerHTML = `<h1>${show ? show.name : "TV Shows"}</h1>`;
}

function updateShowCount(filteredShows, totalCount = state.showCache.length) {
  const showsDisplayed = document.getElementById("show-count");
  showsDisplayed.textContent = `${filteredShows.length} of ${totalCount} Shows`;    // Wording tweak
}

function updateEpisodeCount(filteredEpisodes = state.allEpisodes.length) {
  const episodesFound = document.getElementById("search-count");
  episodesFound.textContent = `${filteredEpisodes.length} episode${filteredEpisodes.length !== 1 ? "s" : ""}`;
}

function renderShows() {
  state.view = "shows";
  document.getElementById("controls").style.display = "none";                       // Hide episode search in shows view
  document.getElementById("back-to-shows").style.display = "none";                  // Hide back button in shows view
  document.getElementById("show-filter-bar").style.display = "flex";                // Display show-search bar when shows view re-renders

  const root = document.getElementById("root");
  root.innerHTML = "";

  const filteredShows = state.showCache.filter((show) => {
    const showTitle = show.name?.toLowerCase() || "";
    const summary = show.summary?.toLowerCase() || "";
    const genres = show.genres?.join(" ").toLowerCase() || "";
    return (
      showTitle.includes(state.searchTerm) ||
      summary.includes(state.searchTerm) ||
      genres.includes(state.searchTerm)
    );
  });
  updateShowCount(filteredShows);

  filteredShows.forEach((show) => {
    const showCard = document.createElement("div");
    showCard.className = "show-card";
    showCard.innerHTML = `
      <h2>${show.name}</h2>
      <img src="${show.image?.medium || ""}" alt="${show.name}" />
      
      <p>${show.summary || "<em>No summary</em>"}</p>
      <ul>
        <li><strong>Genres:</strong> ${show.genres.join(", ")}</li>
        <li><strong>Status:</strong> ${show.status}</li>
        <li><strong>Rating:</strong> ${show.rating.average || "N/A"}</li>
        <li><strong>Runtime:</strong> ${show.runtime || "?"} min</li>
      </ul>
    `;
    showCard.addEventListener("click", () => fetchEpisodesForShow(show.id));
    root.appendChild(showCard);
  });
}

async function fetchEpisodesForShow(showId) {
  state.selectedShowId = showId;
  state.selectedEpisodeId = "all";
  state.searchTerm = "";
  document.getElementById("search-input").value = "";

  document.getElementById("controls").style.display = "flex";                       // Display episode search in episodes view
  document.getElementById("back-to-shows").style.display = "inline";                // Show back button only in episodes view
  document.getElementById("show-filter-bar").style.display = "none";                // Hide show search in episodes view

  if (state.episodeCache.has(showId)) {
    state.allEpisodes = state.episodeCache.get(showId);
    updateShowHeading(showId);
    renderEpisodes();
    return;
  }
  try {
    displayLoadingMessage();
    const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!response.ok) throw new Error(
      `Failed to fetch episodes: ${response.status} ${response.statusText}`);
    const episodes = await response.json();
    state.episodeCache.set(showId, episodes);
    state.allEpisodes = episodes;
    updateShowHeading(showId);
    renderEpisodes();
  } catch (error) {
    console.error("Fetch error", error);
    showErrorNotice("Could not load episodes.");
  }
}

function renderEpisodes() {
  state.view = "episodes";
  const select = document.getElementById("episode-select");
  select.innerHTML = `<option value="all">Show All Episodes</option>`;

  state.allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    select.appendChild(option);
  });

  document.getElementById("episode-select").onchange = (e) => {
    state.selectedEpisodeId = e.target.value;
    state.searchTerm = "";
    document.getElementById("search-input").value = "";
    renderEpisodesList();
  };

  const input = document.getElementById("search-input");
  input.oninput = (e) => {
    state.searchTerm = e.target.value.toLowerCase().trim();
    state.selectedEpisodeId = "all";
    renderEpisodesList();
  };
  renderEpisodesList();
}

function renderEpisodesList() {
  const episodeContainer = document.getElementById("root");
  episodeContainer.innerHTML = "";

  let filteredEpisodes = state.allEpisodes;
  if (state.selectedEpisodeId !== "all") {
    filteredEpisodes = filteredEpisodes.filter((episode) => episode.id == state.selectedEpisodeId);
  } else {
    filteredEpisodes = filteredEpisodes.filter((episode) => {
      const episodeTitle = episode.name?.toLowerCase() || "";
      const summary = episode.summary?.toLowerCase() || "";
      return (
        episodeTitle.includes(state.searchTerm) || summary.includes(state.searchTerm)
      );
    });
  }

  filteredEpisodes.forEach((episode) => {
    const episodeCard = document.getElementById("episode-card-template").content.cloneNode(true);
    episodeCard.querySelector("[data-title]").textContent = episode.name;

    const episodeCode = formatEpisodeCode(episode);
    const episodeNumber = episodeCard.querySelector("[data-episode-number]");

    const episodeLink = document.createElement("a");
    episodeLink.href = episode.url;
    episodeLink.textContent = episodeCode;
    episodeLink.target = "_blank";
    episodeLink.rel = "noopener noreferrer";
    episodeNumber.textContent = "";

    episodeNumber.appendChild(episodeLink);

    episodeCard.querySelector("[data-summary]").innerHTML = episode.summary || "<em>No summary</em>";

    const img = episodeCard.querySelector("[data-image]");
    if (episode.image?.medium) {
      img.src = episode.image.medium;
      img.alt = episode.name;
    } else {
      img.remove();
    }
    root.appendChild(episodeCard);
  });
  updateEpisodeCount(filteredEpisodes);
}

// Back-button
document.getElementById("back-to-shows").addEventListener("click", () => {
  state.view = "shows";
  renderShows();
  document.getElementById("back-to-shows").style.display = "none";                  // Hide back button in shows view 
  document.getElementById("controls").style.display = "none";                       // Hide episode search too
  updateShowHeading();
});

const dataAttribution = document.getElementById("footer");
dataAttribution.innerHTML = `TV Show Project   |   Mo Muchunu   |   Data originally from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>`;
document.body.appendChild(dataAttribution);

window.onload = setup;
