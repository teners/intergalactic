import React from 'react';
import { Component } from '@semcore/core';
import getOriginChildren from '@semcore/utils/lib/getOriginChildren';
import createElement from './createElement';
import Bar from './Bar';
import HorizontalBar from './HorizontalBar';

class GroupBarRoot extends Component {
  static displayName = 'GroupBar';

  getScaleGroup() {
    const { Children, scale, scaleGroup, x } = this.asProps;
    // TODO: love that hack (by lsroman) ❤️
    const xyScale = x ? scale[0] : scale[1];

    if (scaleGroup) return scaleGroup;

    const domain = React.Children.toArray(getOriginChildren(Children)).reduce((acc, child) => {
      if (React.isValidElement(child) && child.type === GroupBar.Bar && !child.props.hide) {
        acc.push(child.props.y);
      }
      if (
        React.isValidElement(child) &&
        child.type === GroupBar.HorizontalBar &&
        !child.props.hide
      ) {
        acc.push(child.props.x);
      }
      return acc;
    }, []);

    return xyScale
      .copy()
      .range([0, xyScale.bandwidth()])
      .domain(domain)
      .paddingInner(xyScale.paddingOuter())
      .paddingOuter(0);
  }

  getBarProps({ y }) {
    const { x } = this.asProps;

    return {
      offset: [this.scaleGroup(y), 0],
      width: this.scaleGroup.bandwidth(),
      x,
      groupKey: x,
    };
  }

  getHorizontalBarProps({ x }) {
    const { y } = this.asProps;

    return {
      offset: [0, this.scaleGroup(x)],
      height: this.scaleGroup.bandwidth(),
      y,
      groupKey: y,
    };
  }

  render() {
    const Element = this.Element;
    this.scaleGroup = this.getScaleGroup();

    this.asProps.dataHintsHandler.establishDataType('grouped-values');

    return (
      <Element aria-hidden render="g" childrenPosition="inside" scaleGroup={this.scaleGroup} />
    );
  }
}

const GroupBar = createElement(GroupBarRoot, {
  Bar,
  HorizontalBar,
});

export default GroupBar;
