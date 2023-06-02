import React, { useContext, useState, useEffect } from "react";
import {forwardRef, useImperativeHandle, useRef} from 'react';
import { AppContext } from "../Context";
import { message, Image, Button, Space, Tooltip } from "antd";
import { SearchOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';
import "../css/EditableBBox.css"
import axios from "axios";


const DragMove = (props) => {
    const {
      onMouseDown,
      onMouseUp,
      onMouseMove,
      onDragMove,
      onAddingPoint,
      children,
      isAdding,
      className
    } = props;

    const [isDragging, setIsDragging] = useState(false);

    const handlePointerDown = (e) => {
      if (isAdding) {
        console.log('Adding point: mouse down')
        onMouseDown(e);
      }
      else {
        console.log('Mouse down '+e.target.className)
        if (e.target.className === 'dot') {
          setIsDragging(`dot-${e.target.id}`);
        }
        if (e.target.className === 'overlay') {
          setIsDragging(`overlay-${e.target.id}`);
        }

        onMouseDown(e);
      }
    };

    const handlePointerUp = (e) => {
      if (isAdding) {
        console.log('Adding point: up')
        onAddingPoint(e)
        onMouseUp(e);
      }
      else {
        console.log('Mouse up')
        setIsDragging(false);
        onMouseUp(e);
      }
    };

    const handlePointerMove = (e) => {
      if (isAdding) {
        console.log('Adding point: move')
        // onMouseMove(e);
      }
      else {
        if (isDragging !== false) {
          onDragMove(isDragging, e)
          console.log('dragging ' + isDragging)
          }
          // onMouseMove(e);
      }
    };

    useEffect(() => {
      console.log('useEffect')
      window.addEventListener("pointerup", handlePointerUp);
      return () => {
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }, [isAdding]);

    return (
      <div
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        style={{
            position: 'absolute',
            maxWidth: '900px',
            width: '100%',
            height: '100%',
            zIndex: 1,
        }}
        className={className}
      >
        {children}
      </div>
    );
  };

DragMove.defaultProps = {
onMouseDown: () => {},
onMouseUp: () => {},
// onMouseMove: () => {}
};



const ImageMask = forwardRef(
  (props, ref) => {

  const {imageDisplay, appPhase, prediction, result, loading, chAnno} = useContext(AppContext)
  // const [imageUrl] = imageDisplay;
  // const [phase, setPhase] = appPhase;
  // const [bboxes, setBboxes] = prediction;
  // const [codes, setCodes] = result;
  // const [isLoading, setIsLoading] = loading;
  const {isAdding, setIsAdding} = props
  const [chosenAnno, setChosenAnno] = chAnno

  // const [isAdding, setIsAdding] = useState(false)
  const [annotations, setAnnotations] = useState([
    {
      p0: {x: 100, y: 100},
      p1: {x: 200, y: 200}
    },
    {
      p0: {x: 300, y: 300},
      p1: {x: 400, y: 400}
    }
  ])

  useImperativeHandle(ref, () => ({
    deleteChosenAnnotation() {
      setAnnotations(annotations.filter((_, index) => index !== chosenAnno));
      setChosenAnno(-1)
    },
  }))

  const [mousePos, setMousePos] = useState({});
  const [tempAnn, setTempAnn] = useState([])
  const [error, setError] = useState(false)
  // mousePos: vị trí tương đối của chuột so với image-mask

  useEffect(() => {
    const imagemask = document.querySelector('.image-mask')
    // imagemask.disableSelection = true
    const bodyRect = document.body.getBoundingClientRect()
    const elemRect = imagemask.getBoundingClientRect()
    const handleMouseMove = (event) => {
      // console.log(event.clientX, elemRect.left, bodyRect.left, window.scrollX)
      // console.log(event.clientY, elemRect.top, bodyRect.top, window.scrollY)
      setMousePos(
        {
          x: event.clientX - (elemRect.left - bodyRect.left) + window.scrollX,
          y: event.clientY - (elemRect.top - bodyRect.top) + window.scrollY
        }
      )
    };

    imagemask.addEventListener('mousemove', handleMouseMove);
    return () => {

      imagemask.removeEventListener(
        'mousemove',
        handleMouseMove
      );
    };
    }, []);

  useEffect(() => {
    if (error == false) return
    message.error('Cannot move bbox outside image')
    // setError(false)
  }, [error]
  )
    // modify 1 point at a time
    const modifyAnnotation = (index, p, newPoint) => {
      const newAnnotations = [...annotations]
      if (p===0) newAnnotations[index].p0 = newPoint
      if (p===1) newAnnotations[index].p1 = newPoint
      setAnnotations(newAnnotations)
    };

    // modify the whole bbox
    const modifyBbox = (index, movementX, movementY) => {
      const newAnnotations = [...annotations]
      newAnnotations[index].p0.x += movementX
      newAnnotations[index].p0.y += movementY
      newAnnotations[index].p1.x += movementX
      newAnnotations[index].p1.y += movementY
      setAnnotations(newAnnotations)
    };


    const handleDragMove = (isDragging, e) => {
        const elements = isDragging.split('-')
        if (elements[0] === 'dot') {
          if (mousePos.x <= 0 || mousePos.y <= 0 || mousePos.x >= 900) {
            // message.error('Cannot move point outside image')
            setError(true)
            return
          }
          setError(false)
          const index = elements[1]
          modifyAnnotation(Math.floor(index/2), index%2, mousePos)
        }
        if (elements[0] === 'overlay') {
          const annotation = annotations[elements[1]]
          if (annotation.p0.x + e.movementX <= 0 ||
              annotation.p0.x + e.movementX >= 900 ||
              annotation.p1.x + e.movementX <= 0 ||
              annotation.p1.x + e.movementX >= 900 ||
              annotation.p0.y + e.movementY <= 0 ||
              annotation.p0.y + e.movementY >= 900 ||
              annotation.p1.y + e.movementY <= 0 ||
              annotation.p1.y + e.movementY >= 900)
            {
              setError(true)
              return
            }
          setError(false)
          console.log(e.movementX, e.movementY)
          modifyBbox(elements[1], e.movementX, e.movementY)
        }

    };
    // adding 2 points to annotations
    const addingToAnnotations = (tempAnn) => {
      setAnnotations([...annotations, {p0: tempAnn[0], p1: tempAnn[1]}])
      setChosenAnno(annotations.length)
      setTempAnn([])
      setIsAdding(false)
      // console.log('end adding')
      console.log('end adding points')

    };

    const handleAddingPoint = (event) => {
      console.log('handle adding point called')
      if (isAdding) {
        const imagemask = document.querySelector('.image-mask')
        const bodyRect = document.body.getBoundingClientRect()
        const elemRect = imagemask.getBoundingClientRect()
        const pos =
          {
            x: event.clientX - (elemRect.left - bodyRect.left) + window.scrollX,
            y: event.clientY - (elemRect.top - bodyRect.top) + window.scrollY
          }

        // console.log(`tempAnn len: ${tempAnn.length}`)
        if (tempAnn.length == 0) {
            tempAnn.push(pos)
            // console.log(Array(newTempAnn))
            // setTempAnn(newTempAnn)
          // console.log(pos)
          // setTempAnn([{x: Math.floor(pos.x), y: Math.floor(pos.y)}])
          // console.log(tempAnn)
        }
        else if (tempAnn.length == 1) {
          tempAnn.push(pos)
          // console.log(newTempAnn)
          // setTempAnn(newTempAnn)
          // setTempAnn([...tempAnn, {x: Math.floor(pos.x), y: Math.floor(pos.y)}])
          // console.log(tempAnn)
          // setAnnotations(annotations.push({p0: tempAnn[0], p1: tempAnn[1]}))
          addingToAnnotations(tempAnn)
        }
      }
    };

    const DragablePoint = ({point, index, isTopLeft}) => {
        var x = point.x
        var y = point.y
        if (isTopLeft) {
            x = point.x - 2
            y = point.y - 2
        }
        else {
            x = point.x - 3
            y = point.y - 3
        }

        const dotStyle = {
            position: 'absolute',
            width: '5px',
            height: '5px',
            backgroundColor: 'red',
            cursor: 'grab',
            zIndex: '10000',
            top: `${y}px`,
            left: `${x}px`,
        }
        return (
            <span
                className='dot'
                style={dotStyle}
                key={index}
                id={index}
            >
            </span>
        )
    };

    return (
            <DragMove
              className='image-mask unselectable'
              onDragMove={handleDragMove}
              onAddingPoint={handleAddingPoint}
              isAdding={isAdding}
              style={{
                position: 'absolute',
                maxWidth: '900px',
                width: '100%',
                height: '100%',
            }}>
                { (tempAnn.length) ?
                  tempAnn.map((point, index) => {
                    return (
                        <DragablePoint point={point} key={index} index={1} isTopLeft={true}/>
                    )})
                  : null
                }
                {
                  (tempAnn.length) ?
                  <div // the temp bounding box when adding new bbox
                    style={{
                      position: 'absolute',
                      top: `${Math.min(tempAnn[0].y, mousePos.y)}px`,
                      left: `${Math.min(tempAnn[0].x, mousePos.x)}px`,
                      width: `${Math.abs(tempAnn[0].x - mousePos.x)}px`,
                      height: `${Math.abs(tempAnn[0].y - mousePos.y)}px`,
                      borderWidth: '2px',
                      borderStyle: 'solid',
                              // cursor: 'all-scroll'
                    }}>
                    {/* {`${mousePos.x} ${mousePos.y}`} */}
                  </div>
                : null
                }

                {annotations.map((annotation, index) => {
                    const overlaystyle = {
                      position: 'absolute',
                      // backgroundColor: color,
                      top: `${Math.min(annotation.p0.y, annotation.p1.y)}px`,
                      left: `${Math.min(annotation.p0.x, annotation.p1.x)}px`,
                      width: `${Math.abs(annotation.p1.x - annotation.p0.x)}px`,
                      height: `${Math.abs(annotation.p1.y - annotation.p0.y)}px`,
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      cursor: 'all-scroll'
                      // borderColor: bordercolor,
                    }

                    const isp0TopLeft = (annotation.p0.x < annotation.p1.x) && (annotation.p0.y < annotation.p1.y)
                    const isp1TopLeft = (annotation.p0.x > annotation.p1.x) && (annotation.p0.y > annotation.p1.y)
                    return (
                      <div className='dragable-bbox' key={index}>
                      <DragablePoint point={annotation.p0} index={2*index} isTopLeft={isp0TopLeft}/>
                      <div
                        className='overlay'
                        id = {index}
                        style = {overlaystyle}
                        onClick={() => setChosenAnno(index)}
                      >
                      </div>
                      <DragablePoint point={annotation.p1} index={2*index+1} isTopLeft={isp1TopLeft}/>
                      </div>
                    )})}

          </DragMove>
        );
})

export default ImageMask;
// export {DragableOverlay, DragablePoint}