import React, {useContext} from "react";
import {AppContext} from "../Context";


const OverlayItem = ( bbox ) => {
    console.log(id)
    const { id, label, xtop, ytop, width, height } = bbox
    const { chBbox } = useContext(AppContext);
    const [ chosenBbox, setChosenBbox ] = chBbox
    const color = (label === 1) ? 'rgba(18,120,9, 0.3)' : 'rgba(204,41,90, 0.3)';
    const bordercolor = (label === 1) ? 'rgb(18,120,9)' : 'rgb(204,41,90)';
    const overlaystyle = {
        position: 'absolute',
        backgroundColor: color,
        top: `${ytop}px`,
        left: `${xtop}px`,
        width: `${width}px`,
        height: `${height}px`,
        borderWidth: '2px',
        borderStyle: (chosenBbox === id) ? 'solid': 'none',
        borderColor: bordercolor,
    }

    return (
        <div
            className='mask'
            key={id}
            onMouseEnter={() => setChosenBbox(id)}
            onMouseLeave={() => setChosenBbox(-1)}
            style={overlaystyle}
            >
        </div>
        );
}

const Overlay = ( bboxes ) => {
    return (
        <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
        }}
        >
            {bboxes.bboxes.map((bbox) => {
                return OverlayItem(
                    bbox
                );
            })}
        </div>
    );
}

export default Overlay;