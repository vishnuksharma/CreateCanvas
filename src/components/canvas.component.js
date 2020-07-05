import React, { createRef } from 'react'
import './canvas.component.css';
import eraserImage from '../assets/eraser.svg';
import scissorImage from '../assets/scissor.svg';
import glueImage from '../assets/glue.svg';
import { getShapes } from '../api/canvas.api';

export default class CanvasComponent extends React.Component {
  constructor(props) {
    super(props)
    this.canvas = createRef()
    this.eraser = createRef()
    this.scissor = createRef()
    this.glue = createRef()
  }

  state = {
    focusedShapeId: '',
    dragTo: '',
    isDrag: false,
    isRendered: false,
    action: '',
    currentCoordinate: { x: 0, y: 0 },
    shapes: []
  }

  moveShapes = _ => {
    let point = this.state.currentCoordinate
    let shapes = this.state.shapes
    let index = shapes.findIndex(shape => shape.id === this.state.focusedShapeId)
    switch (shapes[index].type) {
      case 'shape': {
        shapes[index].corners = shapes[index].corners.map(_ => {
          return {
            x: point.x,
            y: point.y
          }
        })
        break
      }

      case 'circle': {
        shapes[index].params.x = point.x
        shapes[index].params.y = point.y
        break
      }

      default: {

      }
    }

    this.setState({
      shapes: shapes
    })

    this.renderShapes()
  }

  shapeHandler = (ctx, shape, element, ev) => {
    if (ctx.isPointInPath(element, ev.offsetX, ev.offsetY)) {
      this.setState({
        previousCoordinate: {
          x: this.state.currentCoordinate.x,
          y: this.state.currentCoordinate.y
        },
        currentCoordinate: {
          x: ev.offsetX,
          y: ev.offsetY
        }
      })
    }
  }

  renderShapes = _ => {
    const canvas = this.canvas.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let ctxs = this.state.shapes.map((shape, index) => {
      const element = new Path2D()
      ctx.beginPath()

      switch (shape.type) {
        case 'shape': {
          ctx.fillStyle = shape.fillColor
          element.moveTo(shape.corners[0].x, shape.corners[0].y)
          shape.corners.map(point =>
            element.lineTo(point.x, point.y)
          )
          element.lineTo(shape.corners[0].x, shape.corners[0].y)
          ctx.fill(element)

          if (shape.split) {
            var splitterX = shape.corners.map(point => point.x)
            var splitterY = shape.corners.map(point => point.y)

            var minXPoint = Math.min.apply(null, splitterX)
            var maxXPoint = Math.max.apply(null, splitterX)
            var minYPoint = Math.min.apply(null, splitterY)
            var maxYPoint = Math.max.apply(null, splitterY)

            ctx.beginPath()
            ctx.fillStyle = '#4472c4'
            ctx.rect(((maxXPoint - minXPoint) / 2) + minXPoint - 5, minYPoint, 10, maxYPoint - minYPoint)
            ctx.fill()
          }
          break
        }

        case 'circle': {
          ctx.fillStyle = shape.fillColor
          element.arc(
            shape.params.x,
            shape.params.y,
            shape.params.radius,
            shape.params.startAngle,
            shape.params.endAngle
          )
          ctx.fill(element)

          if (shape.split) {
            ctx.beginPath()
            ctx.fillStyle = '#4472c4'
            ctx.rect(shape.params.x - 5, shape.params.y - shape.params.radius, 10, shape.params.radius * 2)
            ctx.fill()
          }
          break
        }

        default: {
          // Undefined type
        }
      }

      return { ctx: ctx, element: element, shape: shape }
    })

    if (!this.state.isRendered) {
      canvas.addEventListener('dragover', ev => {
        this.setState({
          isRendered: true
        })
        ctxs.map((item, index) => {
          const { ctx, element, shape } = item
          if (ctx.isPointInPath(element, ev.offsetX, ev.offsetY)) {
            this.setState({
              dragTo: shape.id,
            })

            const currentShapes = this.state.shapes

            if (typeof (currentShapes[index]) !== 'undefined') {
              switch (this.state.action) {
                case 'erase': {
                  currentShapes[index].type = 'deleted'
                  this.setState({
                    shapes: currentShapes
                  })
                  break
                }

                case 'scissor': {
                  currentShapes[index].split = true
                  this.setState({
                    shapes: currentShapes
                  })
                  break
                }

                case 'glue': {
                  currentShapes[index].split = false
                  this.setState({
                    shapes: currentShapes
                  })
                  break
                }

                default: {
                  // No action
                }
              }

              this.renderShapes()
              console.log('Act: ' + this.state.action + ', id: ' + index)
            }
          }
          return null;
        })
      })
    }
  }

  bootstrap = async _ => {
    getShapes()
      .then(data => {
        this.setState({
          shapes: data
        })
        this.renderShapes()
      })
  }

  componentDidMount() {
    this.bootstrap()
    const eraser = this.eraser.current
    const glue = this.glue.current
    const scissor = this.scissor.current

    eraser.addEventListener('dragstart', ev => {
      this.setState({
        action: 'erase'
      })
    })

    glue.addEventListener('dragstart', ev => {
      this.setState({
        action: 'glue'
      })
    })

    scissor.addEventListener('dragstart', ev => {
      this.setState({
        action: 'scissor'
      })
    })
  }

  render() {
    return (
      <div
        style={{
          width: 1200,
          margin: 'auto',
          marginTop: 10
        }}>
        <div>
          <canvas
            width={1000}
            height={500}
            ref={this.canvas}
            style={{
              float: 'left',
              backgroundColor: '#4472c4'
            }}
          />
          <div
            id="tools"
            style={{
              backgroundColor: '#dfdfdf',
              float: 'left',
              width: 100
            }}>
            <img
              ref={this.scissor}
              className="img-btn"
              src={scissorImage}
              alt="scissor"
            />
            <img
              ref={this.eraser}
              className="img-btn"
              src={eraserImage}
              alt="eraser"
            />
            <img
              ref={this.glue}
              className="img-btn"
              src={glueImage}
              alt="glue"
            />
          </div>
        </div>
      </div>
    )
  }
}