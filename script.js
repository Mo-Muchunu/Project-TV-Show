/*
--------- All episodes must be shown
2. For each episode, _at least_ following must be displayed:
   ------ The name of the episode
   ------ The season number
   ------ The episode number
   4. The medium-sized image for the episode
   ------ The summary text of the episode
3. Combine season number and episode number into an **episode code**:
   1. Each part should be zero-padded to two digits.
   2. Example: `S02E07` would be the code for the 7th episode of the 2nd season. `S2E7` would be incorrect.
4. Your page should state somewhere that the data has (originally) come from [TVMaze.com](https://tvmaze.com/), and link back to that site (or the specific episode on that site). See [tvmaze.com/api#licensing](https://www.tvmaze.com/api#licensing).
*/

// Refactoring to use template 

function setup() {
  const allEpisodes = getAllEpisodes();                                                         // Get episode data
  makePageForEpisodes(allEpisodes);                                                             // Render all episode
}

function makePageForEpisodes(episodeList) {
  const episodeContainer = document.getElementById("root");
  document.getElementById("status-message").innerHTML = `<h1>Game of Thrones</h1><p>Total Episodes: ${episodeList.length}</p>`;

  const template = document.getElementById("episode-card-template");                            // Get template element for an episode card

  episodeContainer.innerHTML = "";                                                              // Clear any existing content in the container

  const episodeCardsFragment = document.createDocumentFragment();                               // Improve DOM performance by appending in one operation when rendering multiple times

  episodeList.forEach(episode => {                                                              // Loop through each episode and create a card
    const episodeCards = template.content.cloneNode(true);                                      // Clone the template content

    episodeCards.querySelector("[data-title]").textContent = episode.name;                      // Using custom data attributes clarity and flexibility without relying on tag names 
    episodeCards.querySelector("[data-season]").textContent = `Season: ${episode.season}`;
    episodeCards.querySelector("[data-episode]").textContent = `Episode: ${episode.number}`;
    episodeCards.querySelector("[data-summary]").innerHTML = episode.summary;

    episodeCardsFragment.appendChild(episodeCards);                                              //  Add each card to the fragment
  });

  episodeContainer.appendChild(episodeCardsFragment);                                            // Add all cards at once for better performance
}

window.onload = setup;