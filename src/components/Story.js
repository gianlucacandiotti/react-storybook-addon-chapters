import React from 'react';
import Remarkable from 'react-remarkable';
import Node from './Node.js'

const PropTypesMap = new Map();
for (let typeName in React.PropTypes) {
  if (!React.PropTypes.hasOwnProperty(typeName)) {
    continue
  }
  const type = React.PropTypes[typeName];
  PropTypesMap.set(type, typeName);
}

export default class Story extends React.Component {
  static displayName = 'Story';
  static propTypes = {
    propTables: React.PropTypes.arrayOf(React.PropTypes.func),
    context: React.PropTypes.object,
    info: React.PropTypes.string,
    inline: React.PropTypes.bool,
  }

  stylesheet = {
    link: {
      base: {
        fontFamily: 'sans-serif',
        fontSize: 12,
        display: 'block',
        position: 'absolute',
        textDecoration: 'none',
        background: '#28c',
        color: '#fff',
        padding: '5px 15px',
        cursor: 'pointer',
      },
      topRight: {
        top: 0,
        right: 0,
        borderRadius: '0 0 0 5px',
      },
    },
    info: {
      position: 'absolute',
      background: 'white',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      padding: '0 40px',
      overflow: 'auto',
    },
  }

  constructor(...args) {
    super(...args);
    this.state = {open: false};
  }

  openInfo() {
    this.setState({open: true});
    return false;
  }

  closeInfo() {
    this.setState({open: false});
    return false;
  }

  render() {
    if (this.props.inline) {
      return this.renderInline();
    }
    return this.renderOverlay();
  }

  renderInline() {
    return (
      <div>
        { this.props.children }
        <div className='storybook-story-info-page'>
          <div className='storybook-story-info-body storybook-story-info-body-inline'>
            { this._getInfoContent() }
            { this._getSourceCode() }
            { this._getPropTables() }
          </div>
        </div>
      </div>
    );
  }

  renderOverlay() {
    const linkStyle = {
      ...this.stylesheet.link.base,
      ...this.stylesheet.link.topRight,
    }
    const infoStyle = Object.assign({}, this.stylesheet.info);
    if (!this.state.open) {
      infoStyle.display = 'none';
    }

    return (
      <div>
        { this.props.children }
        <a style={linkStyle} onClick={() => this.openInfo()}>?</a>
        <div style={infoStyle}>
          <a style={linkStyle} onClick={() => this.closeInfo()}>×</a>
          <div className='storybook-story-info-page'>
            <div className='storybook-story-info-body'>
              { this._getInfoHeader() }
              { this._getInfoContent() }
              { this._getSourceCode() }
              { this._getPropTables() }
            </div>
          </div>
        </div>
      </div>
    );
  }

  _getInfoHeader() {
    if (!this.props.context) {
      return null;
    }

    return (
      <header>
        <h1>{this.props.context.kind}</h1>
        <h2>{this.props.context.story}</h2>
      </header>
    );
  }

  _getInfoContent() {
    if (!this.props.info) {
      return '';
    }
    const lines = this.props.info.split('\n');
    while (lines[0].trim() === '') {
      lines.shift();
    }
    let padding = 0;
    const matches = lines[0].match(/^ */);
    if (matches) {
      padding = matches[0].length;
    }
    const source = lines.map(s => s.slice(padding)).join('\n');
    return <Remarkable source={source}></Remarkable>;
  }

  _getSourceCode() {
    return (
      <div>
        <h3>Example Source</h3>
        <pre>
        {React.Children.map(this.props.children, root => (
          <Node depth={0} node={root}></Node>
        ))}
        </pre>
      </div>
    );
  }

  _getPropTables() {
    if (!this.props.propTables) {
      return '';
    }
    const tables = this.props.propTables.map(this._getPropTable.bind(this));
    return <div>{tables}</div>;
  }

  _getPropTable(Comp) {
    if (!Comp) {
      return '';
    }

    const rows = [];
    for (let property in Comp.propTypes) {
      if (!Comp.propTypes.hasOwnProperty(property)) {
        continue
      }
      const type = Comp.propTypes[property];
      const propType = PropTypesMap.get(type) || '-';
      const required = type.isRequired === undefined ? 'yes' : 'no';
      const defaults = this._getDefaultProp(property);
      rows.push({property, propType, required, defaults});
    }

    return (
      <main>
        <h3>&lt;{Comp.displayName || Comp.name} /&gt; PropTypes</h3>
        <table>
          <thead>
            <tr>
              <th>property</th>
              <th>propType</th>
              <th>required</th>
              <th>defaults</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr>
                <td>{row.property}</td>
                <td>{row.propType}</td>
                <td>{row.required}</td>
                <td>{row.defaults}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    );
  }

  _getDefaultProp(property) {
    return '-';
  }
}