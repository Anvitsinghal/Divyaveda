import { Routes, Route } from 'react-router-dom';
import Login from './auth/Login';
import Home from './pages/Home';
import RequireAuth from './auth/RequireAuth';
import ProductDetail from './pages/ProductDetail';
 // Assuming you made this, if not, skip for now
import Cart from './pages/Cart';
function App() {
  return (
    <div className="app-container">
       {/* <Navbar /> Uncomment when you build the navbar */}
       
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        
        {/* OPTIONAL: If Home is public, put it here. 
            If Home is private, move it inside RequireAuth below. */}
        <Route path="/" element={<Home />} /> 
        <Route path="/product/:id" element={<ProductDetail />} />
        {/* PROTECTED ROUTES (The Bouncer Area) */}
        <Route element={<RequireAuth />}>
        <Route path="/cart" element={<Cart />} />
   <Route path="/checkout" element={<h1>Checkout Page</h1>} />
           {/* We will add these later: */}
           {/* <Route path="/cart" element={<Cart />} /> */}
           {/* <Route path="/profile" element={<Profile />} /> */}
           <Route path="/checkout" element={<h1>Checkout Page</h1>} />
        </Route>

      </Routes>
    </div>
  );
}

export default App;