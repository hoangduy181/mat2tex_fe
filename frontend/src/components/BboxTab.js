import React, { useContext } from "react";
import { AppContext } from "../Context";
const getColor =  (label) => {
    // return (label === 1) ? 'rgb(18,120,9)' : 'rgb(204,41,90)';
    return (label === 1) ? 'rgb(18,120,9)' : (label === 0 ) ? 'rgb(204,41,90)' : 'rgb(0,102,204)'
}


const BBTab = (bbox) => {
    const { chBbox } = useContext(AppContext);
    const [ chosenBbox, setChosenBbox ] = chBbox
    const tabname = ((bbox.label === 0) ? 'Isolated Expression' : (bbox.label === 1) ? 'Embedded Expression' : 'Expression' ) + ` ${bbox.id}`;
    return (
        <div
            onMouseEnter={() => {
                setChosenBbox(bbox.id)
                console.log(chosenBbox)
            }}
            onMouseLeave={() => setChosenBbox(-1)}
        >
            <p
                style={{
                    color: getColor(bbox.label),
                    fontWeight: (chosenBbox === bbox.id) ? 'bold' : 'normal'
                }}
            > {tabname} </p>
        </div>
    );
}

export default BBTab;