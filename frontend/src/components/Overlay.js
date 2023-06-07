import React, {useContext} from "react";
import {AppContext} from "../Context";
import {Popover, Typography} from "antd";

const {Text, Paragraph} = Typography;

const OverlayItem = ( {bbox, phase} ) => {
    const { id, label, x, y, width, height } = bbox

    const { result, chBbox } = useContext(AppContext);
    const [ chosenBbox, setChosenBbox ] = chBbox
    const [codes] = result;

    const color = (label === 1) ? 'rgba(18,120,9, 0.3)' : (label === 0) ? 'rgba(204,41,90, 0.3)' : 'rgba(0,102,204,0.3)';
    const bordercolor = (label === 1) ? 'rgb(18,120,9)' : (label === 0 ) ? 'rgb(204,41,90)' : 'rgb(0,102,204)';
    const overlaystyle = {
        position: 'absolute',
        backgroundColor: color,
        top: `${y}px`,
        left: `${x}px`,
        width: `${width}px`,
        height: `${height}px`,
        borderWidth: '2px',
        borderStyle: (chosenBbox === id) ? 'solid': 'none',
        borderColor: bordercolor,
    }
    const democode = codes.length > 0 ? codes[id].code : ''

    return (
      (phase === 'result') ?
      <Popover
        content={
          <Paragraph copyable={{
            text: codes.length > 0 ? codes[id].code : ''
        }} style={{ margin: 0 }}>
            <Text
              code
              ellipsis={{
                rows: 3,
                expandable: true,
                symbol: 'more',
              }}
              style={{
                width: 300,
              }}
            >
              {democode}
            </Text>
          </Paragraph>
        }
        title={`Expression #${id}`}
        trigger="click"
      >
        <div
          className="mask"
          key={id}
          onMouseEnter={() => setChosenBbox(id)}
          onMouseLeave={() => setChosenBbox(-1)}
          style={overlaystyle}
        ></div>
      </Popover>
      :
      <div
        className="mask"
        key={id}
        onMouseEnter={() => setChosenBbox(id)}
        onMouseLeave={() => setChosenBbox(-1)}
        style={overlaystyle}
      ></div>

    )
}

const Overlay = ( bboxes ) => {

    const { appPhase, result} = useContext(AppContext);
    const [codes] = result;
    const [phase] = appPhase;

    return (
        <div style={{
            position: 'absolute',
            maxWidth: '900px',
            width: '100%',
            height: '100%',
        }}
        >
            {bboxes.bboxes.map((bbox) => {
                return <OverlayItem
                    key = {bbox.id}
                    bbox = {bbox}
                    phase = {phase}
                />;
            })}
        </div>
    );
}

export default Overlay;