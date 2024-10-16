import { useState } from 'react';
import ReactFlagsSelect from "react-flags-select";
import { CountryList } from "../../../assets/data/countries.jsx";
import ls from 'local-storage';
import { CommonApis } from "../../../Utils.js";
import { ApiCalls } from '../../utils/ApiCalls.js';

const CountrySelect = () => {

    //country code selector
    const [selected, setSelected] = useState("SG");
    function loadSettings() {
        if (ls("settings") !== null) return;
        var whichApi = CommonApis.settings;
        ApiCalls(null, whichApi, "POST", {}, (res, api) => {
            var rdata = res.data;
            if (rdata.result === "FAIL") {
                console.log("Unable to load settings: ", res);
                return;
            }
            ls("settings", JSON.stringify(rdata.data));
        });
    }

    loadSettings();
    var genSet = "";
    if (ls("settings")) genSet = JSON.parse(ls("settings"));

    var countries = [];
    var localCountryID = [];
    if (genSet !== "") {
        for (var i = 0; i < genSet.country.length; i++) {
            countries.push(genSet.country[i].name);
            localCountryID.push(genSet.country[i].id_country);
        }
    }

    return <>
        <ReactFlagsSelect
            countries={[...CountryList.map((val, idx) => val.code)]}
            selected={selected}
            searchable={true}
            onSelect={(code) => {
                setSelected(code);
            }}
        />
    </>;

}

export default CountrySelect;


