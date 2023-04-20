import React, {useContext} from "react";
import {AppContext} from "../Context";

const ResultTabs = () => {
    const { prediction, result, chBbox } = useContext(AppContext);
    const [bboxes] = prediction;
    const [codes] = result;
    const [chosenBbox, setChosenBbox] = chBbox;
    function getColor(label) {
        return (label === 1) ? 'rgb(18,120,9)' : 'rgb(204,41,90)';
    }

    console.log(bboxes)
    console.log(codes)

    const ResultTab = ({index}) => {
        const tabname = ((bboxes[index].label === 0) ? 'Isolated Expression' : 'Embedded Expression') + ` ${bboxes[index].id}`;
        return (
            <div>
                <p
                style={{
                    color: getColor(bboxes[index].label),
                    fontWeight: (chosenBbox === bboxes[index].id) ? 'bold' : 'normal'
                }}
                > {tabname} </p>
                { codes.length > 0 && (<p> {codes[index].code} </p>)}
            </div>
        )
    }

    const predictLen = bboxes.length
    const array = [ ...Array(predictLen).keys() ]
    return (
        [ ...Array(predictLen).keys() ].map((index) => (
                <ResultTab key={index} index={index} />
             ))
    )
}

export default ResultTabs;
