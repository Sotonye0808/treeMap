// Define body
const body = d3.select('body');
const svg = d3.select('svg');

// Define the div for the tooltip
const tooltip = body
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tooltip')
    .style('opacity', 0);

const treemap = d3.treemap()
    .size([800, 500])
    .padding(1);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const KICKSTARTER_FILE = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json';
const MOVIE_FILE = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';
const VIDEO_GAME_FILE = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json';

Promise.all([d3.json(KICKSTARTER_FILE), d3.json(MOVIE_FILE), d3.json(VIDEO_GAME_FILE)])
    .then(data => {
        const datasets = ["Kickstarter Pledges", "Movie Sales", "Video Game Sales"];
        for (let i = 0; i < data.length; i++) {
            createTreemap(data[i], datasets[i]);
        }
    })
    .catch(err => console.log(err));

function createTreemap(data, dataset) {
    const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    treemap(root);

    svg.selectAll("g").remove(); // Clear previous treemap

    const cell = svg.selectAll("g")
        .data(root.leaves())
        .enter().append("g")
        .attr("class", "tile")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
        .attr("fill", d => {
            while (d.depth > 1) d = d.parent;
            return color(d.data.name);
        })
        .attr("data-name", d => d.data.name)
        .attr("data-category", d => d.data.category)
        .attr("data-value", d => d.data.value)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`)
                .attr("data-value", d.data.value)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(200).style("opacity", 0);
        });

    cell.append("text")
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter().append("tspan")
        .attr("x", 4)
        .attr("y", (d, i) => 13 + i * 10)
        .text(d => d);

    const categories = root.leaves().map(nodes => nodes.data.category);
    const uniqueCategories = Array.from(new Set(categories));

    const legend = d3.select("#legend");
    legend.html("");
    const legendItems = legend.selectAll(".legend-item")
        .data(uniqueCategories)
        .enter().append("div")
        .attr("class", "legend-item");

    legendItems.append("span")
        .attr("class", "legend-color")
        .style("background-color", d => color(d));

    legendItems.append("span")
        .attr("class", "legend-text")
        .text(d => d);

    svg.append("text")
        .attr("x", 10)
        .attr("y", 30)
        .text(dataset)
        .style("font-size", "1.2em");
}
