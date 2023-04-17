import React from "react";



const OverlayItem = (
    label,
    id,
    xtop,
    ytop,
    width,
    height,
) => {
    const color = (label === 1) ? 'rgba(18,120,9, 0.6)' : 'rgba(204,41,90, 0.6)';

    const overlaystyle = {
        position: 'absolute',
        backgroundColor: color,
        top: `${ytop}px`,
        left: `${xtop}px`,
        width: `${width}px`,
        height: `${height}px`,
    }

    console.log(overlaystyle)
    return (
        <div
            className='mask'
            key={id}
            style={overlaystyle}>
        </div>
        );
}

const Overlay = ( bboxes ) => {
    console.log(bboxes)
    return (
        <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
        }}
        >
            {bboxes.bboxes.map(bbox => {
                return OverlayItem(
                    bbox.id,
                    bbox.label,
                    bbox.xtop,
                    bbox.ytop,
                    bbox.width,
                    bbox.height,
                );
            })}
        </div>
    );
}

export default Overlay;