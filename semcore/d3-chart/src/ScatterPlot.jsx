import React from 'react';
import { transition } from 'd3-transition';
import { Component, sstyled } from '@semcore/core';
import canUseDOM from '@semcore/utils/lib/canUseDOM';
import uniqueIDEnhancement from '@semcore/utils/lib/uniqueID';
import createElement from './createElement';
import { CONSTANT } from './utils';
import ClipPath from './ClipPath';

import style from './style/scatterplot.shadow.css';

class ScatterPlotRoot extends Component {
  static displayName = 'ScatterPlot';
  static style = style;
  static enhance = [uniqueIDEnhancement()];

  static defaultProps = {
    offset: [0, 0],
    duration: 500,
  };

  virtualElement = canUseDOM() ? document.createElement('div') : {};

  generateGetBoundingClientRect(x = 0, y = 0) {
    return () => ({ width: 0, height: 0, top: y, right: x, bottom: y, left: x });
  }

  bindHandlerTooltip =
    (visible, props) =>
    ({ clientX: x, clientY: y }) => {
      const { eventEmitter } = this.asProps;
      this.virtualElement.getBoundingClientRect = this.generateGetBoundingClientRect(x, y);
      this.virtualElement[CONSTANT.VIRTUAL_ELEMENT] = true;
      eventEmitter.emit('onTooltipVisible', visible, props, this.virtualElement);
    };

  animationCircle() {
    const { duration, uid, r, value } = this.asProps;
    const radius = r ? r : value ? 12 : 5.5;
    const selectRect = transition().selection().selectAll(`[id^=${uid}]`).attr('r', 0);
    const selectRectNode = selectRect.node();

    if (duration > 0 && selectRectNode) {
      selectRect.transition().duration(duration).attr('r', radius);
    }
  }

  componentDidUpdate() {
    this.animationCircle();
  }

  componentDidMount() {
    this.animationCircle();
  }

  renderCircle(d, i) {
    const { color, scale, x, y, r, offset, styles, uid, duration, value, valueColor, transparent } =
      this.asProps;
    const [xScale, yScale] = scale;
    const SScatterPlot = this.Element;
    const SValue = 'text';

    return sstyled(styles)(
      <g
        aria-hidden
        key={`circle(#${i})`}
        onMouseMove={this.bindHandlerTooltip(true, { ...this.props, xIndex: i })}
        onMouseLeave={this.bindHandlerTooltip(false, { ...this.props, xIndex: i })}
      >
        <SScatterPlot
          aria-hidden
          id={`${uid}${i}`}
          index={i}
          render="circle"
          clipPath={`url(#${uid})`}
          cx={xScale(d[x]) + offset[0]}
          cy={yScale(d[y]) + offset[1]}
          color={color}
          r={r}
          use:duration={`${duration}ms`}
          transparent={transparent}
        />
        {d[value] && (
          <SValue
            aria-hidden
            x={xScale(d[x]) + offset[0]}
            y={yScale(d[y]) + offset[1]}
            dy=".3em"
            clipPath={`url(#${uid})`}
            color={valueColor}
            transparent={transparent}
          >
            {d[value]}
          </SValue>
        )}
      </g>,
    );
  }

  render() {
    const { data, uid, scale, x, y, value } = this.asProps;
    const [xScale, yScale] = scale;
    const xSize = Math.abs(xScale.range()[0] - xScale.range()[1]);
    const ySize = Math.abs(yScale.range()[0] - yScale.range()[1]);
    const xMargin = Math.min(xScale.range()[0], xScale.range()[1]);
    const yMargin = Math.min(yScale.range()[0], yScale.range()[1]);

    this.asProps.dataHintsHandler.specifyDataRowFields(x, y, value);
    this.asProps.dataHintsHandler.establishDataType('points-cloud');

    return (
      <>
        {data.map(this.renderCircle.bind(this))}
        <ClipPath
          aria-hidden
          id={uid}
          x={xMargin}
          y={yMargin}
          width={`${xSize}px`}
          height={`${ySize}px`}
        />
      </>
    );
  }
}

const ScatterPlot = createElement(ScatterPlotRoot);

export default ScatterPlot;
