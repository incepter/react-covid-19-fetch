import React from "react";
import "./styles.css";
import {
  BrowserRouter,
  Switch,
  Route,
  useParams,
  useHistory
} from "react-router-dom";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";

function useSimpleGetRequest(url, initialValue = null) {
  const [data, setData] = React.useState(initialValue);
  const [fetchState, setFetchState] = React.useState("fetching");
  React.useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(res => {
        if (res && res.error && res.error.message) {
          setData(res.error.message);
          setFetchState("error");
        } else {
          setData(res);
          setFetchState("success");
        }
      })
      .catch(e => {
        setFetchState("error");
        setData(e.toString());
      });
  }, [url]);
  return { fetchState, data };
}

function useCovidStats() {
  const params = useParams();
  const country = params.country;
  const url = `https://covid19.mathdro.id/api${
    country ? `/countries/${country}` : ""
  }`;

  return useSimpleGetRequest(url);
}

function CountryStats() {
  const { fetchState, data } = useCovidStats();
  const { data: countries } = useSimpleGetRequest(
    "https://covid19.mathdro.id/api/countries"
  );
  const countriesOptions = (countries && countries.countries) || [];
  const histoy = useHistory();

  return (
    <>
      <Autocomplete
        options={Object.entries(countriesOptions).map(([key, value]) => ({
          label: key,
          value: value
        }))}
        getOptionLabel={t => t.label}
        renderInput={params => (
          <TextField {...params} label="Combo box" variant="outlined" />
        )}
        onChange={(e, v) => {
          if (v && v.value) {
            histoy.push(v.value);
          }
        }}
      />
      {fetchState === "fetching" && "Loading ..."}
      {fetchState === "error" && `An error occurred: ${data}`}
      {fetchState === "success" && JSON.stringify(data)}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/:country">
          <CountryStats />
        </Route>
        <Route>
          <CountryStats />
        </Route>
      </Switch>
    </BrowserRouter>
  );
}
