import React, { useState } from "react";

export const AppContext = React.createContext(null);

export default ({children}) => {
    const [phase, setPhase] = useState('upload'); // upload / preview / predict / edit / review
    const [imageUrl, setImageUrl] = useState({
        width: 1447,
        height: 2048,
        url: "https://i.ibb.co/rtg9LGm/0110261-page09.jpg",
        delurl: "",
    });
    const [bboxes, setBboxes] = useState([]);
    const [chosenAnno, setChosenAnno] = useState(-1); // chosen annotation (use for delete)
    const [codes, setCodes] = useState([]);
    const [chosenBbox, setChosenBbox] = useState(-1) // chosen bbox
    const [isLoading, setIsLoading] = useState(false);

    const globalVariables = {
        appPhase: [phase, setPhase],
        imageDisplay: [imageUrl, setImageUrl],
        chBbox: [chosenBbox, setChosenBbox],
        chAnno: [chosenAnno, setChosenAnno],
        prediction: [bboxes, setBboxes],
        result: [codes, setCodes],
        loading: [isLoading, setIsLoading]
    }

    return (
        <AppContext.Provider value={globalVariables}>
            {children}
        </AppContext.Provider>
    );
};
