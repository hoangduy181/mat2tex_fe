import React from 'react'
import { Row, Col, Collapse, theme, Button, Space, Image } from 'antd'
import { AppContext } from '../Context';
import { CaretRightOutlined } from '@ant-design/icons';

const {Panel} = Collapse

const ResultDisplay = () => {
    const {imageDisplay, appPhase, bboxes} = React.useContext(AppContext)
    const [imageUrl] = imageDisplay;
    const [phase, setPhase] = appPhase;


    return (<div>
            <Row justify="space-between" align="top">
                <Col span={20} style={{
                  padding: '0 12px 0 12px',
                  display: 'flex',
    					    justifyContent: 'center'
                  }}>
                    <Image
                        src = {imageUrl.url}
                        className='image-preview'
                        id = 'im1'
                        style = {{display: 'block', width: '100%', maxWidth: '900px'}}
                    />
                </Col>
                <Col span={4}>
                    <p>Bboxes</p>
                </Col>
            </Row>
    </div>)
};



export default ResultDisplay