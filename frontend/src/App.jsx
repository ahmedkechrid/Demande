import './App.css';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import Login from './routes/login'
import Request from './routes/userRequest'
import AdminRequest from './routes/adminrequest';
import Archive from './routes/archive'



function App() {
  return (
    <div >
      <Router>
        <Routes>
          <Route path='/' element={<Login/>}/>
          <Route path='/Request' element={<Request/>}/>
          <Route path='/AdminRequest' element={<AdminRequest/>}/>
          <Route path='/Archive' element={<Archive/>}/>

        </Routes>
      </Router>
      
    </div>
  );
}

export default App;
