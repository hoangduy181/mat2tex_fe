import React, {useEffect, useState, useRef} from 'react'
import { message, Row, Col,
        Collapse, theme, Button,
        Space, Image, Divider,
        Spin, Tooltip, Skeleton, List, Avatar } from 'antd'
import { AppContext } from '../Context';
import { CaretRightOutlined, SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import Overlay from './Overlay';
import BBTab from './BboxTab';
import axios from 'axios';
import ImageMask ,{ DragablePoint } from './EditableBBox';
import "../css/EditableBBox.css"
import InfiniteScroll from 'react-infinite-scroll-component';

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

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const loadMoreData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    fetch('https://randomuser.me/api/?results=10&inc=name,gender,email,nat,picture&noinfo')
      .then((res) => res.json())
      .then((body) => {
        setData([...data, ...body.results]);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    loadMoreData();
  }, []);

  return (
        <div style={{
          // margin: 'auto',
          // width: '100%',
          height: '300'
          // padding: 'auto',
        }}>
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
            // margin: '4px 0'
            }}>Isolated Expression</p>
          <p style={{
            color: 'rgb(204,41,90)',
            // margin: '4px 0'
            }}>Embedded Expression</p>
        </Panel>
        {/* <Panel
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
          </Panel> */}
        </Collapse>
        <div
          id="scrollableDiv"
          style={{
            height: '300px',
            overflow: 'auto',
          }}>
        <InfiniteScroll
        dataLength={data.length}
        next={loadMoreData}
        hasMore={data.length < 50}
        loader={
          <Skeleton
            avatar
            paragraph={{
              rows: 1,
            }}
            active
          />
        }
        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List
          dataSource={data}
          renderItem={(item) => (
            <List.Item key={item.email}>
              <List.Item.Meta
                avatar={<Avatar src={item.picture.large} />}
                title={<a href="https://ant.design">{item.name.last}</a>}
                description={item.email}
              />
              <div>Content</div>
            </List.Item>
          )}
        />
      </InfiniteScroll>
        </div>
        </div>
      );
};


const PredictionDisplay = () => {
    const {imageDisplay, appPhase, prediction, result, loading, chAnno} = React.useContext(AppContext)
    const [imageUrl] = imageDisplay;
    const [chosenAnno, setChosenAnno] = chAnno
    const [phase, setPhase] = appPhase;
    const [bboxes] = prediction;
    const [codes, setCodes] = result;
    const [isLoading, setIsLoading] = loading;
    const [isAdding, setIsAdding] = useState(false)
    const [isEditingBbox, setIsEditingBbox] = useState(false)
    const childRef = useRef(null)

    const handleDeleteAnnotation = () => {
      childRef.current.deleteChosenAnnotation();
    };

    const handleSaveAnnotations = () => {
      childRef.current.saveAnnotationsToBboxes();
    };



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

    const scale = 900 / imageUrl.width;

    const point_list = bboxes.map(
      bbox => {
        return [bbox.x/scale, bbox.y/scale, (bbox.x+bbox.width)/scale, (bbox.y+bbox.height)/scale, bbox.confidence, (bbox.label == 1) ? 'embedded' : 'isolated', bbox.id.toString()]
      }
    )
    console.log(JSON.stringify(point_list))

    const handleExtract = async () => {
      try {
        setIsLoading(true)
        const imgData = localStorage.getItem('imgData')
        var file = dataURLtoFile(imgData,'image.png');
        console.log(file)
        const fmData = new FormData();
        const config = {
          timeout: 60000, // 1 min timeout
          headers: { "content-type": "multipart/form-data" },
        };
        fmData.append("file", file);
        fmData.append("point_list", JSON.stringify(point_list));

        const res = await axios.post(
          "http://localhost:5000/extract",
          // "",
          fmData,
          config
        ).then(
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
            setIsLoading(false)
            return res
          }
        )
        console.log(codes)
      }
      catch (error) {
        console.log(error)
        setIsLoading(false)
        if (error.code === 'ECONNABORTED') {
          message.error('Request timeout')
        }
        message.error(error.message)
        setPhase('predict')
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
                        className='image-preview unselectable'

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
                    {
                    isEditingBbox ?
                    <ImageMask isAdding = {isAdding} setIsAdding={setIsAdding} ref={childRef}/>
                    :
                    <Overlay bboxes={bboxes}/>
                    }
                </Col>
                <Col p={4}>
                    <Row align='top' style={{marginBottom: '15px'}}>
                      <Col p={24}>
                      <Space wrap >
                      <Button
                        type="primary"
                        block={true}
                        onClick={() => {
                        handleExtract();
                        setPhase('result');
                        }}> Get TeX code </Button>
                      <Button
                        block={true}
                        onClick={
                        () => setPhase('upload')
                        }> Upload another </Button>
                      </Space>
                      </Col>
                    </Row>
                    <Row align='top' style={{marginBottom: '15px'}}>
                      <Col p={24}>
                        {
                        isEditingBbox ?
                        <Space wrap >

                            <Button
                              type="primary"
                              shape="circle"
                              icon={<PlusOutlined />}
                              disabled={isAdding}
                              onClick={() => {
                              setIsAdding(true)
                              console.log('adding')
                            }}/>

                          <Button
                            disabled={isAdding}
                            onClick={
                            () => {
                              setIsEditingBbox(false)
                              handleSaveAnnotations()
                              }
                            }
                            icon={<SaveOutlined />}>
                            Save
                          </Button>
                          <Button
                            disabled={isAdding || chosenAnno === -1}
                            shape="circle"
                            danger={true}
                            onClick={() => {handleDeleteAnnotation()}}
                            icon={<DeleteOutlined />}
                            >


                          </Button>
                        </Space>
                        :
                        <Space wrap >
                          <Button
                            block={true}
                            onClick={() => {
                            setIsEditingBbox(true)
                            setChosenAnno(-1)
                          }}>
                            Edit bounding boxes
                          </Button>
                        </Space>
                        }
                      </Col>
                    </Row>

                    <BboxCollapse />

                </Col>
            </Row>
            </Spin>
    </div>)
};



export default PredictionDisplay