import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ConfigProvider } from './context/ConfigContext';
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
import OffersList from './pages/offers/OffersList';
import OfferForm from './pages/offers/OfferForm';
import Settings from './pages/settings/Settings';
import PurchasesList from './pages/purchases/PurchasesList';
import PurchaseForm from './pages/purchases/PurchaseForm';
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
    <ConfigProvider>
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
                    <ClientsList initialType="Cliente" />
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

            {/* Módulo de Ofertas */}
            <Route
              path="/ofertas"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <OffersList />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/ofertas/nuevo"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <OfferForm />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/ofertas/editar/:id"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <OfferForm />
                  </AdminLayout>
                </PrivateRoute>
              }
            />

            {/* Configuración */}
            <Route
              path="/config"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <Settings />
                  </AdminLayout>
                </PrivateRoute>
              }
            />

            {/* Compras / Reposiciones */}
            <Route
              path="/compras"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <PurchasesList />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/compras/nueva"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <PurchaseForm />
                  </AdminLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/compras/editar/:id"
              element={
                <PrivateRoute>
                  <AdminLayout>
                    <PurchaseForm />
                  </AdminLayout>
                </PrivateRoute>
              }
            />

            {/* Rutas en Construcción */}
            <Route path="/ventas" element={<PrivateRoute><AdminLayout><UnderConstruction title="Módulo de Ventas" /></AdminLayout></PrivateRoute>} />
            <Route path="/logs" element={<PrivateRoute><AdminLayout><UnderConstruction title="Historial de Logs" /></AdminLayout></PrivateRoute>} />
            <Route path="/reportes" element={<PrivateRoute><AdminLayout><UnderConstruction title="Reportes y Estadísticas" /></AdminLayout></PrivateRoute>} />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;
