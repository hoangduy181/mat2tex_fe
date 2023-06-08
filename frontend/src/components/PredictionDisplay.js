import React, {useEffect, useState, useRef} from 'react'
import { message, Row, Col,
        Collapse, theme, Button,
        Space, Image, Divider,
        Spin, Tooltip, Skeleton, List, Avatar, Modal } from 'antd'
import { AppContext } from '../Context';
import { CaretRightOutlined, SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import Overlay from './Overlay';
import axios from 'axios';
import ImageMask ,{ DragablePoint } from './EditableBBox';
import "../css/EditableBBox.css"
import InfiniteScroll from 'react-infinite-scroll-component';

const {Panel} = Collapse


const BboxCollapse = () => {
  const { prediction, chBbox} = React.useContext(AppContext)
  const [bboxes, setBboxes] = prediction;
  const [chosenBbox, setChosenBbox] = chBbox;
  const { token } = theme.useToken();

  const panelStyle = {
    marginBottom: 24,
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    // border: 'none',
    border: '1px solid #d9d9d9',
    ghost: true
  };
  // const loadMoreData = () => {
  //   if (loading) {
  //     return;
  //   }
  //   setLoading(true);
  //   fetch('https://randomuser.me/api/?results=10&inc=name,gender,email,nat,picture&noinfo')
  //     .then((res) => res.json())
  //     .then((body) => {
  //       setData([...data, ...body.results]);
  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       setLoading(false);
  //     });
  // };
  // useEffect(() => {
  //   loadMoreData();
  // }, []);

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
            }}>Embedded Expression</p>
          <p style={{
            color: 'rgb(204,41,90)',
            margin: '4px 0'
            }}>Isolated Expression</p>
          <p style={{
            color: 'rgb(0,102,204)',
            margin: '4px 0'
            }}>Expression</p>
        </Panel>

        </Collapse>
        <div
          style={{
            backGround: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            border: '1px solid #d9d9d9',
          }}>
          <p style={{
            padding: '0 16px'
          }}
          >Boxes</p>
          <div id="scrollableDiv"
                style={{
                  height: '400px',
                  overflow: 'auto',
                  width: '100%',
                }}>
            <InfiniteScroll
            dataLength={bboxes.length}
            // initialScrollY={66*chosenBbox}
            loader={
              <Skeleton
                avatar
                paragraph={{
                  rows: 1,
                }}
                active
              />
            }
            // endMessage={<Divider plain></Divider>}
            scrollableTarget="scrollableDiv"
          >
            <List
              // bordered
              // header={<div>Boxes</div>}
              dataSource={bboxes}
              size='small'
              split={false}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  onClick={() => setChosenBbox(item.id)}
                  style={{
                    backgroundColor: chosenBbox === item.id ? 'rgba(0,0,0,0.1)' : 'inherit',
                  }}
                  >
                  <List.Item.Meta
                    // avatar={<Avatar src={item.picture.large} />}
                    title={<p
                      style={{
                        color: item.label === 0 ? 'rgb(204,41,90)' : item.label=== 1 ? 'rgb(18,120,9)': 'rgb(0,102,204)',
                      }}
                      >
                      Expression #{item.id}</p>}
                    // description={item.label === 1 ? 'Embedded' :  (item.label === 0) ? 'Isolated' : 'Expression'}
                  />
                  <div>{item.label === 1 ? 'Embedded' :  (item.label === 0) ? 'Isolated' : 'Expression'}</div>
                </List.Item>
              )}
            />
            </InfiniteScroll>
          </div>
        </div>
        </div>
      );
};


const PredictionDisplay = () => {
    const {imageDisplay, appPhase, prediction, result, loading, chAnno} = React.useContext(AppContext)
    const [imageUrl, setImageUrl] = imageDisplay;
    const [chosenAnno, setChosenAnno] = chAnno
    const [phase, setPhase] = appPhase;
    const [bboxes, setBboxes] = prediction;
    const [codes, setCodes] = result;
    const [isLoading, setIsLoading] = loading;
    const [isEditingBbox, setIsEditingBbox] = useState(false)
    const [isAdding, setIsAdding] = useState(false)
    const [displayModal, setDisplayModal] = useState(false)
    const childRef = useRef(null)

    useEffect(() => {
      if (phase === 'predict') {
        setIsEditingBbox(false)
        setIsAdding(false)
      }
      if (phase === 'edit') {
        setIsEditingBbox(true)
      }
    }, [phase])

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



    const handleExtract = async () => {
      try {
        setIsLoading(true)
        setPhase('result');
        if (bboxes.length === 0) {
          message.error('No bounding boxes found. Please add bounding boxes before extracting.')
          setIsLoading(false)
          setPhase('predict')
          return
        }
        const point_list = bboxes.map(
          bbox => {
            return [bbox.x/scale, bbox.y/scale, (bbox.x+bbox.width)/scale, (bbox.y+bbox.height)/scale, bbox.confidence, (bbox.label == 1) ? 'embedded' : 'isolated', bbox.id.toString()]
          }
        )
        const imgData = localStorage.getItem('imgData')
        var file = dataURLtoFile(imgData,'image.png');
        console.log(file)
        const fmData = new FormData();
        const config = {
          timeout: 120000, // 2 min timeout
          headers: { "content-type": "multipart/form-data",
                    "Access-Control-Allow-Origin": "*"
        },
        };
        fmData.append("file", file);
        fmData.append("point_list", JSON.stringify(point_list));

        // real api:
        try {        const res = await axios.post(
          "https://pacific-spire-54560.herokuapp.com/extract",
          // "",
          fmData,
          config
        ).
        // const res = await axios.get(
        //   "https://run.mocky.io/v3/f77c9f27-b85e-46a0-880f-4480ed001866"
        // ).
        then(
          res => {
            const result_list = res.data.predictions.map(
              (prediction, index) => {
                const {img_name, latex} = prediction
                return {
                  id: index,
                  label: bboxes[index].label,
                  code: latex
                }
              }
            )
            setCodes(result_list)
            setIsLoading(false)
            return res
          }
        )
        console.log(codes)}
        catch (error) {
          console.log(error)
          setIsLoading(false)
          message.error(error.message)
          setPhase('predict')
          return
        }
      }
      catch (error) {
        setPhase('predict')
        setIsLoading(false)
        message.error('An error occurred. Please try again.')
        return
      }

    }

    return (<div>
            <Spin spinning={isLoading} size='large'>
            <Modal
              title="Continue without saving?"
              style={{ top: 20 }}
              open={displayModal}
              onOk={() => {
                setDisplayModal(false)
                handleExtract()
              }}
              onCancel={() => {
                setDisplayModal(false)
              }}
            >
              <p> Warning! It appears that you have made changes to the process but have not saved them yet. Do you want to continue without saving? Your changes will be lost if you exit without saving. Press 'Cancel' to go back and save, or 'Ok' to proceed without saving. </p>
            </Modal>
            <Row justify="space-between" align="top">
                <Col p={20} style={{
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
                          maxWidth: '900px'

                        }}
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
                          if (isEditingBbox) {
                            setDisplayModal(true)
                          }
                          else {
                          handleExtract();
                          }
                        }}> Get TeX code </Button>
                      <Button
                        block={true}
                        onClick={
                        () => {
                          setIsAdding(false)
                          setIsEditingBbox(false)
                          setChosenAnno(-1)
                          setBboxes([])
                          setCodes([])
                          setImageUrl({})
                          setPhase('upload')
                          localStorage.removeItem("imgData")
                        }}> Upload another </Button>
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