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
  const allEpisodes = getAllEpisodes();                                         // Get all episodes and render on the page
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const episodeContainer = document.getElementById("root");

  const template = document.getElementById("episode-card-template");            // Get template element for an episode card

  episodeContainer.innerHTML = "";                                              // Clear any existing content in the container

  episodeList.forEach(episode => {                                              // Loop through each episode and create a card
    const episodeCards = template.content.cloneNode(true);                      // Clone the template content

    const episodeTitle = episodeCards.querySelector("h3");                      // Select elements inside the cloned template
    const seasonNumber = episodeCards.querySelector("[data-season]");
    const episodeNumber = episodeCards.querySelector("[data-episode]");
    const summaryText = episodeCards.querySelector("[data-summary]");


    episodeTitle.textContent = episode.name;                                     // Fill in episode data
    seasonNumber.textContent = `Season: ${episode.season}`;
    episodeNumber.textContent = `Episode: ${episode.number}`;
    summaryText.innerHTML = `Episode Summary: ${episode.summary}`;


    episodeContainer.appendChild(episodeCards);                                  // Append the filled card to container
  });
}

window.onload = setup;