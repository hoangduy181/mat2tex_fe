import React, {useState} from 'react'
import { Row, Col, Collapse, theme, Button, Space, Image, Divider } from 'antd'
import { AppContext } from '../Context';
import { CaretRightOutlined } from '@ant-design/icons';
import Overlay from './Overlay';
import BBTab from './BboxTab';

const {Panel} = Collapse



const BboxCollapse = () => {
  const { token } = theme.useToken();

  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: 'none',
    ghost: true
  };

  return (
        <div>
        <Collapse
          bordered={false}
          defaultActiveKey={['labels', 'bboxes']}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          style={{
            background: token.colorBgContainer,
            width: '100%'
          }}
        >
        <Panel
          header={<span
            // style={{fontWeight: '500',
            // fontSize: '16px'}}
          >Labels</span>}
          key="labels"
          style={panelStyle}
          showArrow={false}
        >
          <p style={{color: 'rgb(18,120,9)'}}>Isolated Expression</p>
          <p style={{color: 'rgb(204,41,90)'}}>Embedded Expression</p>
        </Panel>
        <Panel
          header={<span
            // style={{fontWeight: '500',
            // fontSize: '16px'}}
            >Bounding Boxes</span>}
          key="bboxes"
          style={panelStyle}
          showArrow={false}
        >
              {bboxes.map(
                bbox => {
                return (
                  <BBTab
                    key={bbox.id}
                    {...bbox}
                  />
                );
              })}
          </Panel>
        </Collapse>
        </div>
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
                      <Col p={24}>
                      <Space wrap>
                      <Button type="primary" onClick={() => setPhase('result')}> Get TeX code </Button>
                      <Button onClick={() => setPhase('upload')}> Upload another </Button>
                      </Space>
                      </Col>
                    </Row>
                    <BboxCollapse />
                </Col>
            </Row>
    </div>)
};



export default PredictionDisplay