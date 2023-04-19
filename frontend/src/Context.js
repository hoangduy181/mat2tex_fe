import React, { useState } from "react";

export const AppContext = React.createContext(null);

export default ({children}) => {
    const [phase, setPhase] = useState('predict');
    const [imageUrl, setImageUrl] = useState({
        width: 1447,
        height: 2048,
        url: "https:\/\/i.ibb.co\/9HDh13D\/0001101-page09-jpg-rf-e0d0d3cf98a05edcc11fabf9a0f74f1b.jpg"
    });
    const [bboxes, setBboxes] = useState([]);
    const [chosenBbox, setChosenBbox] = useState(-1)

    const globalVariables = {
        appPhase: [phase, setPhase],
        imageDisplay: [imageUrl, setImageUrl],
        result: [bboxes, setBboxes],
        chBbox: [chosenBbox, setChosenBbox]
    }

    return (
        <AppContext.Provider value={globalVariables}>
            {children}
        </AppContext.Provider>
    );
};
