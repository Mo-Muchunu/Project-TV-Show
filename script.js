const state = {
  allEpisodes: [],
  searchTerm: "",
  selectedEpisodeId: "all",
  selectedShowId: null,
  episodeCache: new Map(),
  showCache: [],
  view: "shows",
};

// Cache root element for reuse globally
const root = document.getElementById("root");

function displayLoadingMessage() {
  root.innerHTML = "<p class='loading'>Loading, please wait...</p>";
}

function showErrorNotice(message) {
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
    populateShowSelect();                                                    // Fill the dropdown with all shows
    updateShowHeading();                                                     // Immediately refresh the heading when show changes
    renderShows();
  } catch (error) {
    console.error("Fetch error:", error);
    showErrorNotice("Failed to load shows list. Please try again later.");
  }
}

// Handle dropdown selection
function populateShowSelect() {
  const showSelect = document.getElementById("show-select");
  showSelect.innerHTML = "<option value=\"\">Select a show...</option>";

  state.showCache.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelect.appendChild(option);
  });

  showSelect.addEventListener("change", (e) => {
    const showId = e.target.value;
    if (!showId) {
      return;
    }
    state.selectedShowId = showId;
    state.selectedEpisodeId = "all";
    state.searchTerm = "";
    document.getElementById("episode-search").value = "";
    fetchEpisodesForShow(showId);
  });
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
  const heading = document.getElementById("page-heading");
  if (!showId) {
    heading.innerHTML = "<h1>TV Shows</h1>";
    return;
  }

  const show = state.showCache.find(
    (s) => s.id.toString() === showId.toString()
  );
  heading.innerHTML = `<h1>${show ? show.name : "TV Shows"}</h1>`;
}

function updateShowCount(filteredShows, totalCount = state.showCache.length) {
  const showsDisplayed = document.getElementById("show-count");
  showsDisplayed.textContent = `${filteredShows.length} of ${totalCount} Shows`;
}

function updateEpisodeCount(filteredEpisodes = state.allEpisodes.length) {
  const episodesFound = document.getElementById("search-count");
  episodesFound.textContent = `${filteredEpisodes.length} Episode${filteredEpisodes.length !== 1 ? "s" : ""}`;
}

function renderShows() {
  state.view = "shows";

  // Hide episode controls and display show controls
  document.getElementById("episode-controls").style.display = "none";
  document.getElementById("back-to-shows").style.display = "none";
  document.getElementById("show-controls").style.display = "flex";
  document.getElementById("refresh-shows").style.display = "inline-flex";

  // Refresh the shows list by clearing filters and re-rendering
  document.getElementById("refresh-shows").addEventListener("click", () => {
    state.searchTerm = "";
    document.getElementById("show-search").value = "";
    document.getElementById("show-select").value = "";
    renderShows();
  });

  root.className = "shows-view";                                             // Set root element class to use the shows page layout
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
    const showCard = document.createElement("section");
    const star = '<i class="fa-solid fa-star" style="color: gold;"></i>';    // Reusable gold star icon for show ratings
    showCard.className = "show-card";
    showCard.innerHTML = `
    <h2 class="show-title">${show.name}</h2>
    <div class="show-card-content">
      <div>
        <img src="${show.image?.medium || ""}" alt="${show.name || "No image available"}">
      </div>
      <div class="summary-and-details">
      <p>${show.summary || "<em>No summary</em>"}</p>
      <div class="show-details">
          <p class="rating"><strong>Rating:</strong> ${star}${show.rating?.average ?? "N/A"}</p>
          <p class="genres"><strong>Genres:</strong> ${show.genres.join(" | ")}</p>
          <p class="status"><strong>Status:</strong> ${show.status}</p>
          <p class="runtime"><strong>Runtime:</strong> ${show.runtime ?? "?"} min</p>
        </div>
      </div>
    </div>
    `;

    showCard.addEventListener("click", () => fetchEpisodesForShow(show.id));
    root.appendChild(showCard);
  });
}

async function fetchEpisodesForShow(showId) {
  state.selectedShowId = showId;
  state.selectedEpisodeId = "all";
  state.searchTerm = "";
  document.getElementById("episode-search").value = "";

  // Show episode filters + back button, hide show controls
  document.getElementById("episode-controls").style.display = "flex";
  document.getElementById("back-to-shows").style.display = "inline";
  document.getElementById("show-controls").style.display = "none";
  document.getElementById("refresh-shows").style.display = "none";

  if (state.episodeCache.has(showId)) {
    state.allEpisodes = state.episodeCache.get(showId);
    updateShowHeading(showId);
    renderEpisodes();
    return;
  }
  try {
    displayLoadingMessage();
    const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch episodes: ${response.status} ${response.statusText}`);
    }
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
  select.innerHTML = "<option value=\"all\">Show All Episodes</option>";

  state.allEpisodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${formatEpisodeCode(episode)} - ${episode.name}`;
    select.appendChild(option);
  });

  root.classList.remove("shows-view", "episodes-view");                      // Reset root element by clearing any previous view classes
  root.classList.add("episodes-view");                                       // Add episodes view class for layout
  root.innerHTML = "";                                                       // Clear out old shows before rendering episodes

  document.getElementById("episode-select").onchange = (e) => {
    state.selectedEpisodeId = e.target.value;
    state.searchTerm = "";
    document.getElementById("episode-search").value = "";
    renderEpisodesList();
  };

  const input = document.getElementById("episode-search");
  input.oninput = (e) => {
    state.searchTerm = e.target.value.toLowerCase().trim();
    state.selectedEpisodeId = "all";
    renderEpisodesList();
  };

  renderEpisodesList();
}

function renderEpisodesList() {
  root.innerHTML = "";

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

document.getElementById("back-to-shows").addEventListener("click", () => {
  state.view = "shows";
  renderShows();
  document.getElementById("back-to-shows").style.display = "none";
  updateShowHeading();
});

// Simplified footer text
const dataAttribution = document.getElementById("footer");
dataAttribution.classList.add("attribution");
dataAttribution.innerHTML = "Data originally from <a href=\"https://tvmaze.com/\" target=\"_blank\">TVMaze.com</a>";
document.body.appendChild(dataAttribution);

window.onload = setup;
