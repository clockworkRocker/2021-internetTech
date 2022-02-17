import { Component } from 'react';
import './App.css';
import RouteList from './components/RouteList.jsx';

class App extends Component {

  render() {
    return (
      <div>
        <header className="row colorbox">
          <div className="filler"></div>
          <span>Троллейбусный парк</span>
          <div className="row userbox">
            <span className="username">%Username%</span>
            <button className="button-big cancel-button"></button>
          </div>
        </header>

        <main>
          <div className="list-container">
            <RouteList />
          </div>
        </main>
      </div>
    );
  }
}

export default App;
