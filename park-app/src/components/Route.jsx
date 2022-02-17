import { Component } from "react";
import Stop from "./Stop";

export default class Route extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.number ? props.number : null,
      type: props.type ? props.type : '',
      stops: props.stops ? props.stops : [],
      nextSID: props.nextStopID ? props.nextStopID : 0
    };
  }

  handleOpening = () => {
    if (this.state.isOpen) {
      this.setState({ isOpen: false });
    } else {
      this.setState({ isOpen: true });
      this.updateStopList();
    }
  }

  /* ================ INPUT CALLBACKS ================ */
  onAddClick = () => {
    this.setState({ addingStop: true });
  }

  inputChange = ({ target }) => {
    this.setState({
      newStop: target.value
    });
  }

  inputReset = () => {
    this.setState({
      addingStop: false,
      newStop: ''
    });
  }

  onKeyPress = ({ key }) => {
    if (key === 'Enter' && this.state.newStop) {
      this.reportAddStop();
      this.inputReset();
    }
    else if (key === 'Escape') {
      this.inputReset();
    }
  }

  /* ================ UPDATE CALLBACKS ================ */
  reportAddStop = () => {
    this.props.callbacks.addStop({
      rid: this.state.id,
      newName: this.state.newStop
    });
  }

  reportEditStop = ({ id, newName }) => {
    this.props.callbacks.editStop({
      rid: this.state.id,
      sid: id,
      newName: newName
    })
  }

  reportDeleteStop = ({ id }) => {
    this.props.callbacks.deleteStop({
      rid: this.state.id,
      sid: id
    });
    console.log(this.props.stops);
  }

  reportDeleteRoute = () => {
    this.props.callbacks.deleteRoute()
  }

  render() {
    return (
      <li className="row" style={{ justifyContent: "space-between" }}>
        <label className="route">
          {this.state.id} ({this.state.type})
          <input
            className="route-display"
            type="checkbox"
          />
          <ul className="stop-list row">
            {this.props.stops.map((stop) =>
              <Stop
                key={stop.id}
                id={stop.id}
                name={stop.name}
                callbacks={{
                  editStop: this.reportEditStop,
                  deleteStop: this.reportDeleteStop
                }}
              />
            )}
            <li className="stop-container row">
              <span className="dot"></span>
              <button className="button-big add-button" onClick={this.onAddClick} />
              <input
                type="text"
                id="add-stop"
                className="edit-name"
                value={this.state.newStop}
                style={{ display: this.state.addingStop ? 'inline' : 'none' }}
                onChange={this.inputChange.bind(this)}
                onKeyDown={this.onKeyPress.bind(this)}
              />
            </li>
          </ul>
        </label>
        <button
          className="button-big delete-button"
          onClick={() => this.props.callbacks.deleteRoute({ rid: this.props.number })} />
      </li>
    );
  }
};