import React, { useCallback } from 'react';
import { Component, Root, sstyled } from '@semcore/core';
import Popper from '@semcore/popper';
import { Box } from '@semcore/flex-box';
import findComponent from '@semcore/utils/lib/findComponent';
import resolveColor from '@semcore/utils/lib/color';
import createElement from './createElement';
import { CONSTANT } from './utils';

import style from './style/tooltip.shadow.css';

class TooltipRoot extends Component {
  static displayName = 'Tooltip';

  static style = style;

  state = {
    $visible: false,
  };

  handlerCancel = () => false;

  getTriggerProps() {
    // TODO: как то убрать
    const { x, y } = this.asProps;
    return { x, y };
  }

  getPopperProps() {
    return {
      ...this.state,
    };
  }

  componentDidMount() {
    const { eventEmitter, rootRef } = this.asProps;
    this.unsubscribeTooltipVisible = eventEmitter.subscribe(
      'onTooltipVisible',
      (visible, data, node) => {
        this.setState(
          {
            ...data,
            $visible: visible,
          },
          () => {
            if (node && (node[CONSTANT.VIRTUAL_ELEMENT] || rootRef.current.contains(node))) {
              this?.setPopperTrigger(node);
              this.popper.current?.update();
            }
          },
        );
      },
    );
  }

  componentWillUnmount() {
    if (this.unsubscribeTooltipVisible) {
      this.unsubscribeTooltipVisible();
    }
  }

  render() {
    const { Children, children, tag, ...other } = this.asProps;

    const advanceMode = !!findComponent(Children, [
      Tooltip.Trigger.displayName,
      Tooltip.Popper.displayName,
    ]);
    return (
      <Root
        render={Popper}
        visible={this.state.$visible}
        onFirstUpdate={this.handlerCancel}
        onOutsideClick={this.handlerCancel}
        interaction="none"
        offset={8}
        flip={{ allowedAutoPlacements: ['left', 'right'] }}
      >
        {({ popper, setTrigger }) => {
          this.setPopperTrigger = setTrigger;
          this.popper = popper;
          this.popper.current?.update();
          return advanceMode ? (
            <Children />
          ) : (
            <>
              {tag && <Tooltip.Trigger tag={tag} />}
              <Tooltip.Popper {...other}>{children}</Tooltip.Popper>
            </>
          );
        }}
      </Root>
    );
  }
}

function PopperPopper(props) {
  const { Element: STooltip, styles, $visible, x, y } = props;

  const handlerCancel = useCallback(() => false, []);

  if (!$visible) return null;

  return sstyled(styles)(
    <STooltip
      render={Popper.Popper}
      childrenPosition="inside"
      onMouseMove={handlerCancel}
      x={x}
      y={y}
    />,
  );
}

function Title(props) {
  const STitle = Root;
  const { styles } = props;
  return sstyled(styles)(<STitle render={Box} __excludeProps={['data', 'scale']} />);
}

function Dot(props) {
  const { styles, color, Children } = props;
  const SDotGroup = Root;
  const SDot = Box;
  return sstyled(styles)(
    <SDotGroup render={Box} __excludeProps={['data', 'scale']}>
      <SDot color={resolveColor(color)} />
      <Children />
    </SDotGroup>,
  );
}

function Footer(props) {
  const { styles } = props;
  const SFooter = Root;
  return sstyled(styles)(
    <SFooter render={Box} __excludeProps={['data', 'scale']}/>,
  );
}

const Tooltip = createElement(TooltipRoot, {
  Trigger: Popper.Trigger,
  Popper: PopperPopper,
  Title,
  Footer,
  Dot,
});

export default Tooltip;
