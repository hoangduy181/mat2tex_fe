import React, {useEffect, useState} from 'react'
import { Row, Col, Collapse, theme, Button, Space, Image, Divider, Spin } from 'antd'
import { AppContext } from '../Context';
import { CaretRightOutlined } from '@ant-design/icons';
import Overlay from './Overlay';
import BBTab from './BboxTab';
import axios from 'axios';
import ImageMask ,{ DragablePoint } from './EditableBBox';
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

    function dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while(n--){
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type:mime});
    }

    const point_list = bboxes.map(
      bbox => {
        return [bbox.x1, bbox.y1, bbox.x2, bbox.y2, bbox.confidence, (bbox.className == 1) ? 'embedded' : 'isolated', bbox.id]
      }
    )

    const handleExtract = async () => {
      try {
        setIsLoading(true)
        const imgData = localStorage.getItem('imgData')
        var file = dataURLtoFile(imgData,'image.png');
        console.log(file)
        const fmData = new FormData();
        const config = {
          headers: { "content-type": "multipart/form-data" },
        };
        fmData.append("image", file);
        fmData.append("point_list", point_list);

        const res = await axios.post(
          "http://localhost:5000/predict",
          // "",
          fmData,
          config
        )
        // const res = await axios.get(
        //   // 'https://run.mocky.io/v3/d7593ea8-8bf8-4799-98ba-7738db356521'
        //   'https://run.mocky.io/v3/1113bdb9-2558-494c-b1bc-0f2300983fc5'
        //   )
          .then(
          res => {
            const result_list = res.data.predictions.map(
              (prediction, index) => {
                const {img_name, latex} = prediction
                return {
                  id: index,
                  code: latex
                }
              }
            )
            setCodes(result_list)

            // let result_dict = {}

            // for (let i = 0; i < res.data.predictions.length; i++) {
            //   prediction = res.data.predictions[i]
            //   const {img_name, latex} = prediction
            //   if (result_dict[img_name] === undefined) {
            //     result_dict[img_name] = latex
            //   }

            // }

            // setCodes(result_dict)
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
                    <Overlay bboxes={bboxes}/>
                    {/* <ImageMask/> */}
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