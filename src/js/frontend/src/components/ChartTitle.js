import React from "react"
import ReactDOM from "react-dom"
import Radium from "radium"
import { Link } from 'react-router'

let ChartTitle = React.createClass({
  propTypes: {
    sourceName: React.PropTypes.string,
  },

  render: function() {
    let description = this.props.sourceName ?
        <p style={{width: "50%", display: "inline"}}>
          Showing all meetings with {this.props.sourceName}
        </p>
      : "";

    return (
      <div>
        {description}
        <Link style={{float: "right"}} to="/">Back to home</Link>
      </div>
    )
  },
});

module.exports = Radium(ChartTitle);
