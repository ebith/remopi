import './index.sass';
import {h, render, Component} from 'preact';
import {get} from 'axios';
import {library, dom, icon} from '@fortawesome/fontawesome-svg-core';
import {faPowerOff, faThermometerHalf, faLightbulb, faTv, faDesktop, faWind} from '@fortawesome/free-solid-svg-icons';
import meta from './meta';

library.add(faPowerOff, faThermometerHalf, faLightbulb, faTv, faDesktop, faWind);

(async () => {
  const response = await get('/availables');

  const devices = {};
  for (const device of response.data) {
    const [name, action] = device.split(':');
    if (!Array.isArray(devices[name])) {
      devices[name] = [];
    }

    devices[name].push(action);
  }

  const colors = ['is-primary', 'is-danger', 'is-info', 'is-warning', 'is-success', 'is-link'];

  class Remopi extends Component {
    componentDidMount() {
      dom.i2svg();
    }

    exec(e, device, action) {
      get(`/api/${device}/${action}`);
    }

    render() {
      const tileItems = Object.keys(this.props.devices).map((device, index) => {
        const buttonItems = this.props.devices[device].map(action => (
          <p class="control">
            <button className="button is-medium is-inverted is-uppercase" onClick={e => this.exec(e, device, action)}>
              {action}
            </button>
          </p>
        ));

        return (
          <div className="tile-margin">
            <div className={`tile is-child notification ${colors[index % 6]}`}>
              <p className="title device">
                <i className={`fas ${meta[device] ? meta[device].icon : 'fa-power-off'}`} />
                <h2>{meta[device] ? meta[device].title : device}</h2>
              </p>
              <div className="field is-grouped">{buttonItems}</div>
            </div>
          </div>
        );
      });

      return (
        <div>
          <div className="navbar">
            <div className="navbar-brand">
              <h1 className="title navbar-item">Remopi</h1>
            </div>
          </div>
          <div className="container">
            <div className="tile is-ancestor">
              <div className="tile is-parent">{tileItems}</div>
            </div>
          </div>
        </div>
      );
    }
  }

  render(<Remopi devices={devices} />, document.querySelector('#remopi'));
})();
