import axios from "axios";
const baseUrl = "https://studies.cs.helsinki.fi/restcountries/api/all";

const getAll = async (searchName = "") => {
  try {
    const { data } = await axios.get(baseUrl);
    console.log(data);

    return data.filter((country) =>
      country.name.common.toLowerCase().includes(searchName.toLowerCase()),
    );
  } catch (error) {
    console.log("Failed to fetch countries", error);
    return [];
  }
};

const getWeather = async ({ lat, lon }) => {
  try {
    const apiKey = import.meta.env.VITE_API_KEY;
    const { data } = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`,
    );
    console.log(data);
  } catch (error) {
    console.log("Failed to fetch weather data", error);
    return [];
  }
};

export default { getAll, getWeather };
