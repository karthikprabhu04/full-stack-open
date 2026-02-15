import axios from "axios";
const baseUrl = "https://studies.cs.helsinki.fi/restcountries/api/all";

const getAll = async (searchName = "") => {
  try {
    const {data} = await axios.get(baseUrl);
    console.log(data)

    return data.filter(country =>
      country.name.common
      .toLowerCase()
      .includes(searchName.toLowerCase())
    )
  } catch (error) {
    console.log("Failed to fetch countries", error);
    return [];
  }
};

export default { getAll };
