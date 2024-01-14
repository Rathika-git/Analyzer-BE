const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.send('Hello, this is your server!');
});



app.use(cors());
app.use(express.static(path.join(__dirname, 'uploads')));

const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(cors({
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Welcome endpoint
app.get('/api/', (req, res) => {
  console.log('Request received at /api/');
  res.send('Welcome to the API!');
});

// Define API endpoints for each data type
app.get('/api/states', async (req, res) => {
  try {
    // Read states.json
    const statesData = JSON.parse(await fs.readFile(path.join(__dirname, './exceltojson/states.json'), 'utf8'));
    const states = statesData.map(state => state["State Name"]);

    console.log('Sending states data:', states);
    res.json(states);
  } catch (error) {
    console.error('Error reading states.json:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/cities/:state', async (req, res) => {
  const requestedState = req.params.state.trim();
  try {
    // Read cities.json
    const citiesData = JSON.parse(await fs.readFile(path.join(__dirname, './exceltojson/cities.json'), 'utf8'));
    console.log('Cities Data:', citiesData);

    // Extract city names based on the selected state
    const cities = citiesData
      .filter(city => city && city["State Name"] && city["State Name"].trim() === requestedState)
      .map(city => city["City Name"]);

    console.log(`Sending cities data for state ${requestedState}:`, cities);
    res.json(cities);
  } catch (error) {
    console.error('Error reading cities.json:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/branches/:cityId', async (req, res) => {
  const requestedCityId = req.params.cityId.trim(); 
  console.log('Requested City ID:', requestedCityId); 

  try {
    // Read branches.json
    const branchesData = JSON.parse(await fs.readFile(path.join(__dirname, './exceltojson/branches.json'), 'utf8'));
    const cityData = JSON.parse(await fs.readFile(path.join(__dirname, './exceltojson/cities.json'), 'utf8'));
    const retriveCityId = cityData.find(item => item["City Name"] === requestedCityId)
    console.log(retriveCityId)
   const cityBranches = branchesData
      .filter(branch => branch["City ID"] === retriveCityId['City ID']);

    // Log requested city ID and branches for the requested city ID
    console.log(`Requested City ID: ${requestedCityId}`);
    console.log(`Branches for city ${requestedCityId}`, cityBranches);

    res.json(cityBranches);
  } catch (error) {
    console.error('Error reading branches.json:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/monthly-loans', async (req, res) => {
  try {
    // Read monthlyloans.json
    const monthlyLoansData = JSON.parse(await fs.readFile(path.join(__dirname, './exceltojson/monthlyloans.json'), 'utf8'));

    console.log('Sending monthly loans data:', monthlyLoansData);
    res.json(monthlyLoansData);
  } catch (error) {
    console.error('Error reading monthlyloans.json:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/interest-rates', async (req, res) => {
  try {
    // Read interestrate.json
    const interestRatesData = JSON.parse(
      await fs.readFile(path.join(__dirname, './exceltojson/interestrate.json'), 'utf8')
    );

    console.log('Sending interest rates data:', interestRatesData);
    res.json(interestRatesData);
  } catch (error) {
    console.error('Error reading interestrate.json:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/loansperday/:city', async (req, res) => {
  const requestedCity = req.params.city;

  try {
    // Read loansperday.json asynchronously
    const fileContent = await fs.readFile(path.join(__dirname, './exceltojson/loansperday.json'), 'utf8');
    const loansPerDayData = JSON.parse(fileContent);

    // Log available cities for debugging
    const availableCities = loansPerDayData.map(data => data['City ID']);
    
    // Extract loans per day based on the selected city
    const cityLoansPerDay = loansPerDayData.find(data => data['City ID'] === requestedCity);
    
    console.log('Available cities:>>>>>>', cityLoansPerDay);
    if (cityLoansPerDay) {
      console.log(`Sending loans per day data for city ${requestedCity}:`, cityLoansPerDay);
      res.json(cityLoansPerDay);
    } else {
      console.log(`City ${requestedCity} not found in the data.`);
      res.status(404).send('City not found');
    }
  } catch (error) {
    console.error('Error reading loansperday.json:', error.message);
    res.status(500).send('Internal Server Error');
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
app.get('*', (req, res) => {
  res.status(404).send('Not Found');
});