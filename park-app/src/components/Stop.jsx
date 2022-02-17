import React, { Component } from "react";

export default class Stop extends Component {
  state = {
    editing: false
  };

  constructor(props) {
    super();
    this.state = {
      id: props.id ? props.id : "",
      name: props.name ? props.name : "",
      editing: props.editing ? props.editing : false,
      newName: props.name ? props.name : ""
    };

    this.input = React.createRef();
  }

  /* ================ INPUT CALLBACKS ================ */
  editClick = () => {
    console.log('I want to edit', this.state.name);
    this.input.current.focus();
    this.setState({ editing: true });
  }

  inputChange = ({ target }) => {
    const newName = target.value;
    this.setState({
      newName: newName
    });
  }

  inputReset = () => {
    this.setState({
      newName: this.state.name,
      editing: false
    });
  }

  onKeyPress = ({ key }) => {
    if (key === 'Enter') {
      if (this.state.newName)
        this.updateName();
    }

    else if (key === 'Escape')
      this.inputReset();
  }

  /* ================ REPORT CALLBACKS ================ */
  reportEditStop = () => {
    this.props.callbacks.editStop({
      id: this.state.id,
      newName: this.state.newName
    });
  }

  reportDeleteStop = () => {
    this.props.callbacks.deleteStop({
      id: this.state.id
    });
  }

  /* ================ UPDATE CALLBACKS ================ */
  updateName = () => {
    this.setState({
      name: this.state.newName
    });
    this.reportEditStop();
    this.setState({ editing: false });
  }

  render() {
    return (
      <li className="stop-container row"
        onKeyPress={this.onKeyPress.bind(this)}
      >
        <span className="dot"></span>
        <div className="stop-box">
          <div className="stop-name">
            <span style={{ display: this.state.editing ? 'none' : 'inline' }}>
              {this.state.name}
            </span>
            <input
              ref={this.input}
              type="text"
              id={this.state.id}
              className="edit-name"
              value={this.state.newName}
              style={{ display: this.state.editing ? 'inline' : 'none' }}
              onChange={this.inputChange.bind(this)}
              onBlur={this.updateName.bind(this)}
            />
          </div>
          <div className="row centered">
            <button
              type="button"
              className="button-small edit-button"
              onClick={this.editClick.bind(this)}
            />
            <button
              type="button"
              className="button-small delete-button"
              onClick={this.reportDeleteStop}
            />
          </div>
        </div>
      </li>
    );
  }
};