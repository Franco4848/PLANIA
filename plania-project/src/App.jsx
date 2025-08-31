import React, {useState} from 'react';
import Mapa from './components/Mapa';
import Navbar from './components/Navbar';
import './App.css';

function App(){
  const [activeTab, setActiveTab] = useState('mapa');

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Mapa />
      {/* {aca se pueden mostrar otros componentes encima del mapa} */}
      {activeTab === 'bodegas' && (
        <div className='overlay-content'>
          <h4>Lista de bodegas</h4>
          {/* componente de la lista de bodegas */}
        </div>
      )}
      {activeTab === 'perfil' && (
        <div className='overlay-content'>
          <h4>Mi perfil</h4>
          {/* componente del perfil usuario */}
        </div>
      )}

    </div>
  );
}
export default App;