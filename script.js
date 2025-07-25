/*
1. Add the medium-sized image for each episode
2. Combine season number and episode number into an **episode code**
     1. Each part should be zero-padded to two digits.
     2. Example: `S02E07` would be the code for the 7th episode of the 2nd season. `S2E7` would be incorrect.
3. Your page should state somewhere that the data has (originally) come from [TVMaze.com](https://tvmaze.com/), and link back to that site (or the specific episode on that site). See [tvmaze.com/api#licensing](https://www.tvmaze.com/api#licensing).
*/

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const episodeContainer = document.getElementById("root");
  document.getElementById("main-heading").innerHTML = `<h1>Game of Thrones</h1><p>Total Episodes: ${episodeList.length}</p>`;

  const template = document.getElementById("episode-card-template");

  episodeContainer.innerHTML = "";

  const episodeCardsFragment = document.createDocumentFragment();

  episodeList.forEach(episode => {
    const episodeCards = template.content.cloneNode(true);

    episodeCards.querySelector("[data-title]").textContent = episode.name;

    const season = episode.season.toString().padStart(2, "0");                                 // Convert episode and season numbers to strings and pad with leading zeros
    const number = episode.number.toString().padStart(2, "0");
    episodeCards.querySelector("[data-code]").textContent = `S${season}E${number}`;            // Select element with [data-code] attribute and set its text content to formatted season-episode code

    episodeCards.querySelector("[data-summary]").innerHTML = `Summary: ${episode.summary}`;

    const episodeLink = episodeCards.querySelector("[data-link]");
    episodeLink.href = episode.url;

    const episodeImg = episodeCards.querySelector("[data-image]");                              // Select image element inside cloned episode template
    if (episode.image && episode.image.medium) {                                                // Check if episode object has an image property AND contains a medium image version
      episodeImg.src = episode.image.medium;                                                    // Set the image source to the episode's medium image from episode data
      episodeImg.alt = episode.name;                                                            // Set the alt text to the episode name for accessibility
    } else {                                                                                    // Handle case where image doesn't exist or is missing
      episodeImg.remove();                                                                      // If no image found- remove the placeholder <img> element from the DOM
    }
    
    episodeCardsFragment.appendChild(episodeCards);
  });

  const dataAttribution = document.createElement("p");                                           // Adding element to give credit to external data source: clickable link at top of page
  dataAttribution.innerHTML = 'Data originally from <a href="https://tvmaze.com/" target="_blank">TVMaze.com</a>';
  document.getElementById("root").appendChild(dataAttribution);

  episodeContainer.appendChild(episodeCardsFragment);
}

window.onload = setup;