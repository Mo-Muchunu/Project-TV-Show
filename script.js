/*
You can edit ALL of the code here

For level 100, we are going to display information about every episode of a single TV show.

## Requirements

1. All episodes must be shown
2. For each episode, _at least_ following must be displayed:
   1. The name of the episode
   2. The season number
   3. The episode number
   4. The medium-sized image for the episode
   5. The summary text of the episode
3. Combine season number and episode number into an **episode code**:
   1. Each part should be zero-padded to two digits.
   2. Example: `S02E07` would be the code for the 7th episode of the 2nd season. `S2E7` would be incorrect.
4. Your page should state somewhere that the data has (originally) come from [TVMaze.com](https://tvmaze.com/), and link back to that site (or the specific episode on that site). See [tvmaze.com/api#licensing](https://www.tvmaze.com/api#licensing).
*/

//console.log("-------dragon eggs--------");

function setup() {
  const allEpisodes = getAllEpisodes();                      // Get all episodes and render them on page load
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const episodeContainer = document.getElementById("root");
  episodeContainer.innerHTML = `Game of Thrones <br> Total Episodes: ${episodeList.length}`;


  const episodeCards = document.createElement("section");     // Create section to hold episodes

  episodeList.forEach((episode) => {

    const episodeTitle = document.createElement("h3");        // Create and set episode data
    episodeTitle.textContent = episode.name;
    console.log(episode.name, "<----Episode Title");

    const seasonNumber = document.createElement("p");         // Lots of similar blocks of code
    seasonNumber.textContent = episode.season;                // need to refactor this logic to use a template instead
    console.log(episode.season, "<----Season Number");

    const episodeNumber = document.createElement("data");
    episodeNumber.textContent = episode.number;
    console.log(episode.number, "<----Episode Number");

    const summaryText = document.createElement("p");
    summaryText.innerHTML = episode.summary;                  // Using innerHTML to skip creating new tags because summary already  
    console.log(episode.summary, "<----Summary Text");        // has <p> tags and browser is inserting them when rendering page 

    episodeCards.appendChild(episodeTitle);                   // Add all elements to the episode card section
    episodeCards.appendChild(seasonNumber);
    episodeCards.appendChild(episodeNumber);
    episodeCards.appendChild(summaryText);

    document.body.appendChild(episodeCards);                  // Append the section to the document body
  })
};


window.onload = setup;
