import React from 'react'
import { Row, Col, Collapse, theme, Button, Space, Image } from 'antd'
import { AppContext } from '../Context';
import { CaretRightOutlined } from '@ant-design/icons';
import Overlay from './Overlay';

const {Panel} = Collapse


const LabelCollapse = () => {
  const { token } = theme.useToken();

  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
  };

  return (
        <Collapse
          bordered={false}
          defaultActiveKey={['labels', 'bboxes']}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          style={{
            background: token.colorBgContainer,
            width: '100%'
          }}
        >
          <Panel header="Labels" key="labels" style={panelStyle}>
            <p style={{color: 'rgb(18,120,9)'}}>Isolated Expression</p>
            <p style={{color: 'rgb(204,41,90)'}}>Embedded Expression</p>
          </Panel>
          <Panel header="Bounding Boxes" key="bboxes" style={panelStyle}>
              {bboxes.map((bbox) => {
                  return (bbox.label === 0) ?
                    <p style={{color: 'rgb(18,120,9)'}}>
                      Isolated Expression {bbox.id}
                    </p> :
                    <p style={{color: 'rgb(204,41,90)'}}>
                      Embedded Expression  {bbox.id}
                    </p>
                }
              )}
          </Panel>
        </Collapse>
      );
};


const bboxes = [
  {
    id: 1,
    label: 0,
    xtop: 100,
    ytop: 100,
    width: 100,
    height: 100
  },
  {
    id: 2,
    label: 1,
    xtop: 200,
    ytop: 200,
    width: 100,
    height: 100
  }
];



const PredictionDisplay = () => {
    const {imageDisplay, appPhase} = React.useContext(AppContext)
    const [imageUrl] = imageDisplay;
    const [phase, setPhase] = appPhase;


    return (<div>
            <Row justify="space-between" align="top">
                <Col p={20} style={{
                  padding: '0 12px 0 12px',
                  display: 'flex',
    					    justifyContent: 'center',
                  position: 'relative'
                  }}>
                    <img
                        src = {imageUrl.url}
                        className='image-preview'

                        // preview={{
                        //   visible: false,
                        //   mask: <Mask />,
                        //   maskClassName: 'image-preview-mask',
                        //   maskStyle: {width: '100%', height: '100%'}
                        // }}
                        // preview = {false}
                        style = {{
                          display: 'block',
                          // position: 'absolute',
                          // zIndex: 1,
                          width: '100%',
                          maxWidth: '900px'}}
                    >
                    </img>
                    <Overlay bboxes={bboxes} />
                </Col>
                <Col p={4}>
                    <Row align='top' style={{marginBottom: '30px'}}>
                      <Space wrap>
                      <Button type="primary" onClick={() => setPhase('result')}> Get TeX code </Button>
                      <Button onClick={() => setPhase('upload')}> Upload another </Button>
                      </Space>
                    </Row>
                    <Row align='top'>
                        <LabelCollapse />
                    </Row>
                </Col>
            </Row>
    </div>)
};



export default PredictionDisplay