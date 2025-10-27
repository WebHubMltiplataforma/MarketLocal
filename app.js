// MarketLocal - App Simplificada y Funcional
console.log('✅ MarketLocal App cargando...');

class MarketLocalApp {
    constructor() {
        this.API_BASE_URL = 'http://localhost:5000/api';
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('🚀 Inicializando MarketLocal...');
        this.checkAuthStatus();
        this.setupEventListeners();
        this.loadProducts();
        this.showNotification('Aplicación cargada correctamente', 'success');
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');
        
        // Navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target);
            });
        });

        // Botones principales
        document.getElementById('exploreProducts')?.addEventListener('click', () => {
            this.showSection('products');
        });

        document.getElementById('startSelling')?.addEventListener('click', () => {
            this.showSection('upload');
        });

        document.getElementById('createFirstProduct')?.addEventListener('click', () => {
            this.showSection('upload');
        });

        // Botones de auth
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showModal('loginModal');
        });

        document.getElementById('registerBtn').addEventListener('click', () => {
            this.showModal('registerModal');
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Cerrar modales
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal.id);
            });
        });

        // Clicks fuera del modal
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // Switch entre modales
        document.getElementById('switchToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('loginModal');
            this.showModal('registerModal');
        });

        document.getElementById('switchToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.hideModal('registerModal');
            this.showModal('loginModal');
        });

        // Formularios
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            this.handleRegister(e);
        });

        document.getElementById('productForm').addEventListener('submit', (e) => {
            this.handleProductSubmit(e);
        });

        // Filtros
        document.getElementById('applyFilters').addEventListener('click', () => {
            this.applyFilters();
        });

        console.log('✅ Event listeners configurados');
    }

    handleNavigation(linkElement) {
        console.log('📱 Navegando a:', linkElement.getAttribute('data-section'));
        
        // Remover active de todos los links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Agregar active al link clickeado
        linkElement.classList.add('active');
        
        // Mostrar sección
        const sectionId = linkElement.getAttribute('data-section');
        this.showSection(sectionId);
    }

    showSection(sectionId) {
        console.log('🎯 Mostrando sección:', sectionId);
        
        // Ocultar todas las secciones
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar sección objetivo
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Cargar datos específicos si es necesario
            if (sectionId === 'products') {
                this.loadProducts();
            } else if (sectionId === 'my-products') {
                if (this.currentUser) {
                    this.loadUserProducts();
                } else {
                    this.showNotification('Debes iniciar sesión para ver tus productos', 'warning');
                    this.showModal('loginModal');
                }
            } else if (sectionId === 'upload') {
                if (!this.currentUser) {
                    this.showNotification('Debes iniciar sesión para publicar productos', 'warning');
                    this.showModal('loginModal');
                    this.showSection('home');
                }
            }
        }
    }

    showModal(modalId) {
        console.log('📦 Abriendo modal:', modalId);
        document.getElementById(modalId).style.display = 'block';
    }

    hideModal(modalId) {
        console.log('📦 Cerrando modal:', modalId);
        document.getElementById(modalId).style.display = 'none';
    }

    showNotification(message, type = 'info') {
        console.log('💬 Notificación:', message);
        const container = document.getElementById('notificationsContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        container.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    async checkAuthStatus() {
        console.log('🔐 Verificando autenticación...');
        const token = localStorage.getItem('marketlocal_token');
        
        if (token) {
            try {
                const response = await fetch(`${this.API_BASE_URL}/auth/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    this.currentUser = data.user;
                    this.updateUIForLoggedInUser();
                    console.log('✅ Usuario autenticado:', this.currentUser.name);
                } else {
                    localStorage.removeItem('marketlocal_token');
                    console.log('❌ Token inválido');
                }
            } catch (error) {
                localStorage.removeItem('marketlocal_token');
                console.log('❌ Error verificando autenticación:', error);
            }
        } else {
            console.log('🔓 Usuario no autenticado');
        }
    }

    updateUIForLoggedInUser() {
        document.getElementById('authButtons').style.display = 'none';
        document.getElementById('userMenu').style.display = 'flex';
        document.getElementById('userName').textContent = this.currentUser.name;
        console.log('👤 UI actualizada para usuario logueado');
    }

    updateUIForLoggedOutUser() {
        document.getElementById('authButtons').style.display = 'flex';
        document.getElementById('userMenu').style.display = 'none';
        this.currentUser = null;
        console.log('👤 UI actualizada para usuario no logueado');
    }

    async handleLogin(e) {
        e.preventDefault();
        console.log('🔐 Procesando login...');
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showNotification('Email y contraseña son requeridos', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('📨 Respuesta login:', data);

            if (data.success) {
                localStorage.setItem('marketlocal_token', data.token);
                this.currentUser = data.user;
                this.updateUIForLoggedInUser();
                this.hideModal('loginModal');
                document.getElementById('loginForm').reset();
                this.showNotification('¡Bienvenido de vuelta!', 'success');
            } else {
                this.showNotification(data.message || 'Error en el login', 'error');
            }
        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        console.log('📝 Procesando registro...');
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const location = document.getElementById('registerLocation').value;

        if (!name || !email || !password || !location) {
            this.showNotification('Todos los campos son requeridos', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, location })
            });

            const data = await response.json();
            console.log('📨 Respuesta registro:', data);

            if (data.success) {
                localStorage.setItem('marketlocal_token', data.token);
                this.currentUser = data.user;
                this.updateUIForLoggedInUser();
                this.hideModal('registerModal');
                document.getElementById('registerForm').reset();
                this.showNotification('¡Cuenta creada exitosamente!', 'success');
            } else {
                this.showNotification(data.message || 'Error en el registro', 'error');
            }
        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    handleLogout() {
        console.log('🚪 Cerrando sesión...');
        localStorage.removeItem('marketlocal_token');
        this.updateUIForLoggedOutUser();
        this.showNotification('Sesión cerrada', 'success');
        this.showSection('home');
    }

    async loadProducts() {
        console.log('📦 Cargando productos...');
        const productsGrid = document.getElementById('productsGrid');
        
        if (!productsGrid) {
            console.log('❌ No se encontró productsGrid');
            return;
        }

        // Mostrar loading
        productsGrid.innerHTML = `
            <div class="loading-spinner" style="display: block; grid-column: 1 / -1;">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando productos...</p>
            </div>
        `;

        try {
            // Obtener filtros
            const category = document.getElementById('categoryFilter')?.value || '';
            const condition = document.getElementById('conditionFilter')?.value || '';
            
            const queryParams = new URLSearchParams();
            if (category) queryParams.append('category', category);
            if (condition) queryParams.append('condition', condition);

            const response = await fetch(`${this.API_BASE_URL}/products?${queryParams}`);
            const data = await response.json();
            
            console.log('📨 Productos recibidos:', data);

            if (data.success && data.products && data.products.length > 0) {
                this.displayProducts(data.products);
            } else {
                this.showNoProducts();
            }
        } catch (error) {
            console.error('❌ Error cargando productos:', error);
            this.showNoProducts();
            this.showNotification('Error cargando productos', 'error');
        }
    }

    displayProducts(products) {
        console.log('🎨 Mostrando productos:', products.length);
        const grid = document.getElementById('productsGrid');
        
        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <i class="fas fa-${this.getCategoryIcon(product.category)}"></i>
                </div>
                <div class="product-info">
                    <div class="product-category">${this.getCategoryName(product.category)}</div>
                    <h3 class="product-title">${product.title}</h3>
                    <div class="product-price">$${product.price}</div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <div class="product-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${product.location?.address || 'Ubicación no especificada'}
                        </div>
                        <div class="product-seller">
                            <i class="fas fa-user"></i>
                            ${product.seller?.name || 'Vendedor'}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        console.log('✅ Productos mostrados en grid');
    }

    showNoProducts() {
        console.log('📭 No hay productos para mostrar');
        const grid = document.getElementById('productsGrid');
        grid.innerHTML = `
            <div class="no-products" style="display: block; grid-column: 1 / -1;">
                <i class="fas fa-search fa-3x"></i>
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar tus filtros de búsqueda o sé el primero en publicar un producto.</p>
            </div>
        `;
    }

    async loadUserProducts() {
        console.log('📦 Cargando productos del usuario...');
        
        if (!this.currentUser) {
            console.log('❌ Usuario no autenticado');
            return;
        }

        const container = document.getElementById('myProductsList');
        container.innerHTML = `
            <div class="loading-spinner" style="display: block;">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Cargando tus productos...</p>
            </div>
        `;

        try {
            const token = localStorage.getItem('marketlocal_token');
            const response = await fetch(`${this.API_BASE_URL}/products/user/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('📨 Productos del usuario:', data);

            if (data.success && data.products && data.products.length > 0) {
                this.displayUserProducts(data.products);
            } else {
                this.showNoUserProducts();
            }
        } catch (error) {
            console.error('❌ Error cargando productos del usuario:', error);
            this.showNoUserProducts();
        }
    }

    displayUserProducts(products) {
        console.log('🎨 Mostrando productos del usuario:', products.length);
        const container = document.getElementById('myProductsList');
        
        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <i class="fas fa-${this.getCategoryIcon(product.category)}"></i>
                </div>
                <div class="product-info">
                    <div class="product-header">
                        <h3 class="product-title">${product.title}</h3>
                        <span class="product-status ${product.status}">${this.getStatusText(product.status)}</span>
                    </div>
                    <div class="product-price">$${product.price}</div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <div class="product-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${product.location?.address || 'Ubicación no especificada'}
                        </div>
                        <div class="product-views">
                            <i class="fas fa-eye"></i>
                            ${product.views || 0} vistas
                        </div>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-outline btn-sm" onclick="marketLocalApp.deleteProduct('${product._id}')">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showNoUserProducts() {
        console.log('📭 Usuario no tiene productos');
        const container = document.getElementById('myProductsList');
        container.innerHTML = `
            <div class="no-products" style="display: block;">
                <i class="fas fa-box-open fa-3x"></i>
                <h3>Aún no tienes productos publicados</h3>
                <p>Comienza a vender publicando tu primer producto.</p>
                <button class="btn btn-primary" onclick="marketLocalApp.showSection('upload')">
                    <i class="fas fa-plus"></i> Crear Primer Producto
                </button>
            </div>
        `;
    }

    async handleProductSubmit(e) {
        e.preventDefault();
        console.log('📤 Enviando producto...');
        
        if (!this.currentUser) {
            this.showNotification('Debes iniciar sesión para publicar productos', 'warning');
            this.showModal('loginModal');
            return;
        }

        const formData = {
            title: document.getElementById('productTitle').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            condition: document.getElementById('productCondition').value,
            location: document.getElementById('productLocation').value
        };

        // Validaciones básicas
        if (!formData.title || !formData.description || !formData.price || !formData.category || !formData.condition || !formData.location) {
            this.showNotification('Todos los campos son requeridos', 'error');
            return;
        }

        if (formData.price < 0) {
            this.showNotification('El precio no puede ser negativo', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('marketlocal_token');
            const response = await fetch(`${this.API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('📨 Respuesta crear producto:', data);

            if (data.success) {
                this.showNotification('¡Producto publicado exitosamente!', 'success');
                document.getElementById('productForm').reset();
                
                // Recargar productos si estamos en la sección correspondiente
                if (document.getElementById('products').classList.contains('active')) {
                    await this.loadProducts();
                }
                
                // Si estamos en "mis productos", recargar esa sección
                if (document.getElementById('my-products').classList.contains('active')) {
                    await this.loadUserProducts();
                }
            } else {
                this.showNotification(data.message || 'Error al publicar producto', 'error');
            }
        } catch (error) {
            console.error('❌ Error publicando producto:', error);
            this.showNotification('Error de conexión al publicar producto', 'error');
        }
    }

    async deleteProduct(productId) {
        console.log('🗑️ Eliminando producto:', productId);
        
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            return;
        }

        try {
            const token = localStorage.getItem('marketlocal_token');
            const response = await fetch(`${this.API_BASE_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log('📨 Respuesta eliminar producto:', data);

            if (data.success) {
                this.showNotification('Producto eliminado exitosamente', 'success');
                await this.loadUserProducts();
            } else {
                this.showNotification(data.message || 'Error al eliminar producto', 'error');
            }
        } catch (error) {
            console.error('❌ Error eliminando producto:', error);
            this.showNotification('Error de conexión al eliminar producto', 'error');
        }
    }

    applyFilters() {
        console.log('🔍 Aplicando filtros...');
        this.loadProducts();
    }

    getCategoryIcon(category) {
        const icons = {
            'ropa': 'tshirt',
            'electronica': 'mobile-alt',
            'hogar': 'home',
            'vehiculos': 'car',
            'herramientas': 'tools',
            'terrenos': 'warehouse'
        };
        return icons[category] || 'box';
    }

    getCategoryName(category) {
        const categories = {
            'ropa': 'Ropa y Moda',
            'electronica': 'Electrónicos',
            'hogar': 'Hogar y Jardín',
            'vehiculos': 'Vehículos',
            'herramientas': 'Herramientas',
            'terrenos': 'Terrenos'
        };
        return categories[category] || category;
    }

    getStatusText(status) {
        const statusTexts = {
            'disponible': 'Disponible',
            'vendido': 'Vendido',
            'reservado': 'Reservado',
            'inactivo': 'Inactivo'
        };
        return statusTexts[status] || status;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
console.log('📄 DOM cargado, inicializando app...');
document.addEventListener('DOMContentLoaded', () => {
    window.marketLocalApp = new MarketLocalApp();
});

console.log('✅ Script app.js cargado');