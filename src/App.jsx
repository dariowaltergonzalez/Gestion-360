import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import PublicCatalog from './pages/PublicCatalog';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ProductsList from './pages/products/ProductsList';
import ProductForm from './pages/products/ProductForm';
import CategoriesList from './pages/categories/CategoriesList';
import CategoryForm from './pages/categories/CategoryForm';
import ClientsList from './pages/clients/ClientsList';
import ClientForm from './pages/clients/ClientForm';
import UnderConstruction from './pages/UnderConstruction';
import './App.css';

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate replace to="/login" />;
};

// Layout para la parte administrativa
const AdminLayout = ({ children }) => {
  return (
    <div className="admin-container">
      <Sidebar />
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
};

function App() {
  const { currentUser } = useAuth();

  return (
    <Router>
      <div className="app-wrapper">
        <Navbar />

        <Routes>
          {/* Ruta Pública: Catálogo */}
          <Route path="/" element={<PublicCatalog />} />

          {/* Login y Registro */}
          <Route path="/login" element={
            currentUser ? <Navigate replace to="/dashboard" /> : <Login />
          } />

          <Route path="/signup" element={
            currentUser ? <Navigate replace to="/dashboard" /> : <Signup />
          } />

          <Route path="/forgot-password" element={
            currentUser ? <Navigate replace to="/dashboard" /> : <ForgotPassword />
          } />

          {/* Rutas Privadas (Admin/Operador) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/productos"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <ProductsList />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/productos/nuevo"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <ProductForm />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/productos/editar/:id"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <ProductForm />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/categorias"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <CategoriesList />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/categorias/nueva"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <CategoryForm />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/categorias/editar/:id"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <CategoryForm />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          {/* Gestión de Clientes y Proveedores (Modelo Unificado) */}
          <Route
            path="/clientes"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <ClientsList />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/clientes/nuevo"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <ClientForm />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/clientes/editar/:id"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <ClientForm />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          {/* La ruta /proveedores también usa el mismo sistema unificado */}
          <Route
            path="/proveedores"
            element={
              <PrivateRoute>
                <AdminLayout>
                  <ClientsList initialType="Proveedor" />
                </AdminLayout>
              </PrivateRoute>
            }
          />

          {/* Rutas en Construcción */}
          <Route path="/compras" element={<PrivateRoute><AdminLayout><UnderConstruction title="Módulo de Compras" /></AdminLayout></PrivateRoute>} />
          <Route path="/ventas" element={<PrivateRoute><AdminLayout><UnderConstruction title="Módulo de Ventas" /></AdminLayout></PrivateRoute>} />
          <Route path="/logs" element={<PrivateRoute><AdminLayout><UnderConstruction title="Historial de Logs" /></AdminLayout></PrivateRoute>} />
          <Route path="/reportes" element={<PrivateRoute><AdminLayout><UnderConstruction title="Reportes y Estadísticas" /></AdminLayout></PrivateRoute>} />
          <Route path="/config" element={<PrivateRoute><AdminLayout><UnderConstruction title="Configuración del Sistema" /></AdminLayout></PrivateRoute>} />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
