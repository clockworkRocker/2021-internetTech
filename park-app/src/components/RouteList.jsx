import { Component } from "react";
import Route from "./Route";

export class RouteListModel {
  static url = 'http://localhost:4321';

  static async getRouteList() {
    const result = await fetch(`${this.url}/routelist`);
    const jsonResult = await result.json();
    return jsonResult;
  }

  static async addRoute({ rid, type }) {
    const result = await fetch(`${this.url}/routelist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newID: rid, newType: type })
    });

    const data = await result.json();

    return (result.status === 200) ? data : Promise.reject(data);
  }

  static async deleteRoute({ rid }) {
    const result = await fetch(`${this.url}/routelist`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rid: rid })
    });

    const data = await result.json();

    return (result.status === 200) ? data : Promise.reject(data);
  }

  static async addStop({ rid, newName }) {
    const result = await fetch(`${this.url}/routelist/${rid}/stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newName: newName })
    });

    const data = await result.json();

    return (result.status === 200) ? data : Promise.reject(data);
  }

  static async editStop({ rid, sid, newName }) {

    const result = await fetch(`${this.url}/routelist/${rid}/stops/${sid}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newName: newName })
    });

    const data = await result.json();

    return (result.status === 200) ? data : Promise.reject(data);
  }
  static async deleteStop({ rid, sid }) {

    const result = await fetch(`${this.url}/routelist/${rid}/stops/${sid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: ""
    });

    const data = await result.json();

    return (result.status === 200) ? data : Promise.reject(data);
  }
}

export default class RouteList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      addingRoute: false,
      addedRouteID: null,
      addedRouteType: "Магистральный",
      routes: []
    };
  }

  async componentDidMount() {
    this.setState({
      routes: await RouteListModel.getRouteList()
    })
  }

  /* ================ INPUT CALLBACKS ================ */
  onAddClick = () => {
    this.setState({ addingRoute: true });
  }

  onKeyPress = ({ key }) => {
    if (key === 'Escape')
      this.reset();
    else if (key === 'Enter') {
      this.onSubmit();
      return;
    }
  }

  onInputChange = ({ target }) => {
    if (target.name === 'add-route-id')
      this.setState({ addedRouteID: target.value });
    else if (target.name === 'add-route-type')
      this.setState({ addedRouteType: target.value });
  }

  onSubmit = (event) => {
    console.log('Adding route', this.state.addedRouteID, 'of type', this.state.addedRouteType);

    if (this.state.addedRouteID && this.state.addedRouteType) {
      this.addRoute();
    } else {
      this.inputReset();
    }

    if (event) event.preventDefault();
  }
  /* ================ REPORT CALLBACKS ================ */

  /* ================ UPDATE CALLBACKS ================ */
  addRoute = async () => {
    await RouteListModel.addRoute({
      rid: this.state.addedRouteID,
      type: this.state.addedRouteType
    });

    var routes = this.state.routes;
    routes.push({
      id: this.state.addedRouteID,
      type: this.state.addedRouteType,
      stops: [],
      nextSID: 0
    });

    this.setState({
      addingRoute: false,
      addedRouteID: null,
      addedRouteType: 'Магистральный',
      routes: routes
    });
  }

  addStop = async ({ rid, newName }) => {
    console.log('Adding stop', newName, 'to route', rid);
    var routes = this.state.routes;
    var rIndex = routes.findIndex((r) => r.id === rid);

    await RouteListModel.addStop({ rid: routes[rIndex].id, newName: newName });

    routes[rIndex].stops.push({
      id: 'R' + routes[rIndex].id + 'S' + routes[rIndex].nextSID,
      name: newName
    });
    routes[rIndex].nextSID++;

    this.setState({ routes: routes });
  }

  editStop = async ({ rid, sid, newName }) => {
    console.log('Renaming stop', sid, 'from', rid, 'to', newName);

    var routes = this.state.routes;
    var rIndex = routes.findIndex((r) => r.id === rid);
    var sIndex = routes[rIndex].stops.findIndex((s) => s.id === sid);

    await RouteListModel.editStop({
      rid,
      sid,
      newName
    });

    routes[rIndex].stops[sIndex].name = newName;

    this.setState({ routes: routes });
  }

  deleteStop = async ({ rid, sid }) => {
    console.log('I want to delete stop', sid, 'from route', rid);

    var routes = this.state.routes;
    var rIndex = routes.findIndex(r => r.id === rid);
    var sIndex = routes[rIndex].stops.findIndex(s => s.id === sid);

    await RouteListModel.deleteStop({ rid, sid });

    routes[rIndex].stops.splice(sIndex, 1);

    this.setState({ routes: routes });
  }

  deleteRoute = async ({ rid }) => {
    console.log(`I want to delete route ${rid}`);

    var routes = this.state.routes;
    var rIndex = routes.findIndex(({ id }) => id === rid);

    await RouteListModel.deleteRoute({ rid });

    routes.splice(rIndex, 1);
    this.setState({ routes });
  }

  inputReset = () => {
    this.setState({
      addingRoute: false,
      addedRouteID: null,
      addedRouteType: ''
    });
  }

  render() {
    return (
      <ul className="route-list">
        {this.state.routes.map((route, index) => <Route
          key={index}
          number={route.id}
          type={route.type}
          stops={route.stops}
          callbacks={{
            addStop: this.addStop,
            editStop: this.editStop,
            deleteStop: this.deleteStop,
            deleteRoute: this.deleteRoute
          }}
        />)}
        <li
          className="row"
          onKeyDown={this.onKeyPress.bind(this)}
        >
          <button
            type="button"
            className="button-big add-button"
            onClick={this.onAddClick.bind(this)}
          />
          <form
            className="row centered"
            onSubmit={this.onSubmit.bind(this)}
          >
            <input
              type="number"
              name="add-route-id"
              id="add-route"
              value={this.state.addedRouteID ? this.state.addedRouteID : ''}
              style={{ display: this.state.addingRoute ? 'inline' : 'none' }}
              onChange={this.onInputChange.bind(this)}
            />
            <select
              name="add-route-type"
              id="add-route-type"
              className="centered"
              value={this.state.addedRouteType}
              style={{ display: this.state.addingRoute ? 'inline' : 'none' }}
              onChange={this.onInputChange.bind(this)}
            >
              <option className="route-type" value="Магистральный">Магистральный</option>
              <option className="route-type" value="Районный">Районный</option>
              <option className="route-type" value="Социальный">Социальный</option>
            </select>
            <button
              type="submit"
              style={{ display: this.state.addingRoute ? 'inline' : 'none' }}
              className="button-big">
              OK
            </button>

          </form>
        </li>
      </ul>
    );
  }
};