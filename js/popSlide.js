
let popularMovies = [];
let currentPopShow = 0;

async function getPopularMovie(n) {
    const movies = [];
    
    const page = Math.floor(n / 20) + 1;
    for (let i=1; i<page+1; i++) {
        try {
            const response = await axios.get(popularURL + i, {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                },
            });
            const pageMovies = response.data.results;
            movies.push(...pageMovies);
        } catch (e) {
            console.log("api 요청 에러");
            return;
        }
    }
    
    return movies.slice(0, n);
}

function updatePopCardContent() {
    const cards = document.querySelectorAll(".pop_card");

    cards.forEach((card, idx) => {
        const movie = popularMovies[currentPopShow + idx];

        card.dataset.id = movie.id; 
        card.querySelector("img").src = posterURL + movie.poster_path;
        card.querySelector(".movie_title").textContent = movie.title;
        card.querySelector(".movie_overview").textContent = movie.overview;
        card.querySelector(".movie_average").textContent = movie.vote_average;
        card.querySelector(".movie_popularity").textContent = movie.popularity;
        card.querySelector(".movie_releaseDate").textContent = movie.release_date;
        card.querySelector(".movie_originalLanguage").textContent = movie.original_language;
    });
}

document.querySelector(".pop_slide .next").addEventListener("click", (e) => {
    currentPopShow += 5;
    if (currentPopShow >= popularMovies.length) {
        currentPopShow = 0;
    }
    updatePopCardContent();
});
document.querySelector(".pop_slide .prev").addEventListener("click", (e) => {
    currentPopShow -= 5;
    if (currentPopShow <= 0) {
        currentPopShow = popularMovies.length-5;
    }
    updatePopCardContent();
});


getPopularMovie(30)
.then((data) => {
    popularMovies = data;
    updatePopCardContent();
});


