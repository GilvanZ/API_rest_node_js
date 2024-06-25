const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Function to save Pokémon data to a CSV file
const savePokemonDataToCSV = (pokemonData) => {
    const filePath = path.join(__dirname, 'pokemon_data.csv');
    const csvHeader = 'ID,Name\n';
    const csvRows = pokemonData.map(pokemon => `${pokemon.id},${pokemon.name}`).join('\n');
    const csvContent = csvHeader + csvRows;

    fs.writeFileSync(filePath, csvContent, 'utf8');
};

// Endpoint to get details of a Pokémon by name and save to CSV
app.get('/pokemon/:name', async (req, res) => {
    const pokemonName = req.params.name.toLowerCase();
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const pokemonData = {
            id: response.data.id,
            name: response.data.name
        };
        
        savePokemonDataToCSV([pokemonData]);

        res.send(pokemonData);
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while fetching Pokémon data' });
    }
});

// Endpoint to get a list of all Pokémon names and IDs and save to CSV
app.get('/pokemon', async (req, res) => {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const pokemonList = response.data.results;

        const pokemonData = await Promise.all(pokemonList.map(async (pokemon) => {
            const pokemonDetail = await axios.get(pokemon.url);
            return {
                id: pokemonDetail.data.id,
                name: pokemon.name
            };
        }));

        savePokemonDataToCSV(pokemonData);

        res.send(pokemonData);
    } catch (error) {
        res.status(500).send({ error: 'An error occurred while fetching the list of Pokémon' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
