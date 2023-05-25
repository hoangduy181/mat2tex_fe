import React, {useEffect, useState} from 'react'
import { Row, Col, Collapse, theme, Button, Space, Image, Divider, Spin } from 'antd'
import { AppContext } from '../Context';
import { CaretRightOutlined } from '@ant-design/icons';
import Overlay from './Overlay';
import BBTab from './BboxTab';
import axios from 'axios';
const {Panel} = Collapse



const BboxCollapse = () => {
  const { prediction} = React.useContext(AppContext)
  const [bboxes, setBboxes] = prediction;
  const { token } = theme.useToken();

  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    // border: 'none',
    border: '1px solid #d9d9d9',
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
          <p style={{
            color: 'rgb(18,120,9)',
            margin: '4px 0'
            }}>Isolated Expression</p>
          <p style={{
            color: 'rgb(204,41,90)',
            margin: '4px 0'
            }}>Embedded Expression</p>
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


const PredictionDisplay = () => {
    const {imageDisplay, appPhase, prediction, result, loading} = React.useContext(AppContext)
    const [imageUrl] = imageDisplay;
    const [phase, setPhase] = appPhase;
    const [bboxes] = prediction;
    const [codes, setCodes] = result;
    const [isLoading, setIsLoading] = loading;

    const handleExtract = async () => {

      try {
        setIsLoading(true)
        const res = await axios.get('https://run.mocky.io/v3/d7593ea8-8bf8-4799-98ba-7738db356521').then(
          res => {
            const result_list = res.data.results
            setCodes(result_list)
            setIsLoading(false)
            return res
          }
        )
        console.log(codes)
      }
      catch (error) {
        console.log(error)
      }
    }

    return (<div>
            <Spin spinning={isLoading} size='large'>
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
                      <Space wrap >
                      <Button type="primary" onClick={() => {
                        handleExtract();
                        setPhase('result');
                        }}> Get TeX code </Button>
                      <Button onClick={() => setPhase('upload')}> Upload another </Button>
                      </Space>
                      </Col>
                    </Row>
                    <BboxCollapse />
                </Col>
            </Row>
            </Spin>
    </div>)
};



export default PredictionDisplay