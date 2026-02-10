const app = {
    apiUrl: '/api',

    employee: null,

    init: () => {
        const empNum = localStorage.getItem('employeeId');
        if (empNum) {
            app.employee = { codigo: empNum };
        }

        const loginForm = document.getElementById('login-form');
        const logoutBtn = document.getElementById('logout-btn');

        if (loginForm) {
            loginForm.addEventListener('submit', app.handleLogin);
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', app.handleLogout);
        }

        if (window.location.pathname.includes('dashboard.html')) {
            if (!app.employee) {
                window.location.href = '/index.html';
                return;
            }
            app.loadDashboardData();
        }
    },

    handleLogin: async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('login-message');

        try {
            const response = await fetch(`${app.apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario: username, clave: password })
            });

            const data = await response.json();

            if (response.ok) {
                // Login Success
                localStorage.setItem('employeeId', data.employee.CHR_EMPLCODIGO);
                localStorage.setItem('employeeName', data.employee.VCH_EMPLNOMBRE);
                window.location.href = '/dashboard.html';
            } else {
                // Login Failed
                messageDiv.textContent = data.error || 'Login failed';
                messageDiv.className = 'alert alert-error';
                messageDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            messageDiv.textContent = 'Network error or server offline';
            messageDiv.className = 'alert alert-error';
            messageDiv.style.display = 'block';
        }
    },

    handleLogout: () => {
        localStorage.removeItem('employeeId');
        localStorage.removeItem('employeeName');
        window.location.href = '/index.html';
    },

    loadDashboardData: async () => {
        // Load Clients
        await app.fetchAndRenderClients();
        // Load Accounts
        await app.fetchAndRenderAccounts();

        // Update user info in header
        const userName = localStorage.getItem('employeeName');
        document.getElementById('user-name-display').textContent = userName || 'Employee';
    },

    fetchAndRenderClients: async () => {
        try {
            const response = await fetch(`${app.apiUrl}/clients`);
            const clients = await response.json();

            const tbody = document.getElementById('clients-table-body');
            tbody.innerHTML = '';

            clients.forEach(client => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${client.CHR_CLIECODIGO}</td>
                    <td>${client.VCH_CLIEPATERNO} ${client.VCH_CLIEMATERNO}, ${client.VCH_CLIENOMBRE}</td>
                    <td>${client.CHR_CLIEDNI}</td>
                    <td>${client.VCH_CLIEEMAIL || '-'}</td>
                    <td>
                        <button onclick="app.editClient('${client.CHR_CLIECODIGO}')" style="background: #f1c40f; border:none; padding: 5px; cursor: pointer;"><i class="fas fa-edit"></i></button>
                        <button onclick="app.deleteClient('${client.CHR_CLIECODIGO}')" style="background: #e74c3c; color: white; border:none; padding: 5px; cursor: pointer;"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    },

    showClientModal: (id = null) => {
        const modal = document.getElementById('client-modal');
        const form = document.getElementById('client-form');
        const title = document.getElementById('client-modal-title');

        form.reset();
        document.getElementById('client-id').value = '';

        if (id) {
            title.textContent = 'Editar Cliente';
            // Fetch client data to fill form
            fetch(`${app.apiUrl}/clients/${id}`)
                .then(res => res.json())
                .then(client => {
                    document.getElementById('client-id').value = client.CHR_CLIECODIGO;
                    document.getElementById('client-codigo').value = client.CHR_CLIECODIGO;
                    document.getElementById('client-codigo').disabled = true; // Cannot change ID
                    document.getElementById('client-paterno').value = client.VCH_CLIEPATERNO;
                    document.getElementById('client-materno').value = client.VCH_CLIEMATERNO;
                    document.getElementById('client-nombre').value = client.VCH_CLIENOMBRE;
                    document.getElementById('client-dni').value = client.CHR_CLIEDNI;
                    document.getElementById('client-ciudad').value = client.VCH_CLIECIUDAD;
                    document.getElementById('client-direccion').value = client.VCH_CLIEDIRECCION;
                    document.getElementById('client-telefono').value = client.VCH_CLIETELEFONO;
                    document.getElementById('client-email').value = client.VCH_CLIEEMAIL;
                });
        } else {
            title.textContent = 'Nuevo Cliente';
            document.getElementById('client-codigo').disabled = false;
        }

        modal.style.display = 'flex';

        form.onsubmit = (e) => {
            e.preventDefault();
            app.saveClient();
        };
    },

    editClient: (id) => {
        app.showClientModal(id);
    },

    saveClient: async () => {
        const id = document.getElementById('client-id').value;
        const data = {
            codigo: document.getElementById('client-codigo').value,
            paterno: document.getElementById('client-paterno').value,
            materno: document.getElementById('client-materno').value,
            nombre: document.getElementById('client-nombre').value,
            dni: document.getElementById('client-dni').value,
            ciudad: document.getElementById('client-ciudad').value,
            direccion: document.getElementById('client-direccion').value,
            telefono: document.getElementById('client-telefono').value,
            email: document.getElementById('client-email').value
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${app.apiUrl}/clients/${id}` : `${app.apiUrl}/clients`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Cliente guardado exitosamente');
                document.getElementById('client-modal').style.display = 'none';
                app.fetchAndRenderClients();
            } else {
                const resData = await response.json();
                alert('Error: ' + resData.error);
            }
        } catch (error) {
            console.error('Error saving client:', error);
        }
    },

    deleteClient: async (id) => {
        if (!confirm('¿Seguro que desea eliminar este cliente?')) return;

        try {
            const response = await fetch(`${app.apiUrl}/clients/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                app.fetchAndRenderClients();
            } else {
                alert('Error eliminando cliente');
            }
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    },

    fetchAndRenderAccounts: async () => {
        try {
            const response = await fetch(`${app.apiUrl}/accounts`);
            const accounts = await response.json();

            const tbody = document.getElementById('accounts-table-body');
            tbody.innerHTML = '';

            accounts.forEach(acc => {
                const tr = document.createElement('tr');
                const fecha = new Date(acc.DTT_CUENFECHACREACION).toLocaleString();
                tr.innerHTML = `
                    <td>${acc.CHR_CUENCODIGO}</td>
                    <td>${acc.VCH_CLIEPATERNO} ${acc.VCH_CLIENOMBRE}</td>
                    <td>${acc.CHR_MONECODIGO === '01' ? 'S/.' : '$'} ${acc.DEC_CUENSALDO}</td>
                    <td>${acc.VCH_MONEDESCRIPCION}</td>
                    <td>${acc.VCH_SUCUNOMBRE}</td>
                    <td>${acc.VCH_CREADOR_NOMBRE}</td>
                    <td>${fecha}</td>
                    <td><span class="badge ${acc.VCH_CUENESTADO === 'ACTIVO' ? 'badge-success' : 'badge-danger'}">${acc.VCH_CUENESTADO}</span></td>
                     <td>
                        <button onclick="app.showTransactionModal('${acc.CHR_CUENCODIGO}')" class="btn-sm btn-primary">Operar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    },

    showTransactionModal: (accountId) => {
        alert(`Operaciones para cuenta ${accountId} (Implementar Modal)`);
        // TODO: Implement transaction modal (Deposit/Withdraw) logic here or simply use Prompt for MVP
    },

    loadMyData: async () => {
        // Form Elements
        const form = document.getElementById('my-data-form');
        const empId = localStorage.getItem('employeeId');

        if (!empId) return;

        try {
            const response = await fetch(`${app.apiUrl}/employees/${empId}`);
            const emp = await response.json();

            if (response.ok) {
                document.getElementById('my-codigo').value = emp.CHR_EMPLCODIGO;
                document.getElementById('my-paterno').value = emp.VCH_EMPLPATERNO;
                document.getElementById('my-materno').value = emp.VCH_EMPLMATERNO;
                document.getElementById('my-nombre').value = emp.VCH_EMPLNOMBRE;
                document.getElementById('my-ciudad').value = emp.VCH_EMPLCIUDAD;
                document.getElementById('my-direccion').value = emp.VCH_EMPLDIRECCION;
                document.getElementById('my-usuario').value = emp.VCH_EMPLUSUARIO;
                document.getElementById('my-clave').value = emp.VCH_EMPLCLAVE;
            } else {
                alert('Error loading data: ' + emp.error);
            }
        } catch (error) {
            console.error('Error fetching my data:', error);
        }

        // Attach Submit Handler
        form.onsubmit = async (e) => {
            e.preventDefault();
            await app.updateMyData(empId);
        };
    },

    updateMyData: async (id) => {
        const data = {
            paterno: document.getElementById('my-paterno').value,
            materno: document.getElementById('my-materno').value,
            nombre: document.getElementById('my-nombre').value,
            ciudad: document.getElementById('my-ciudad').value,
            direccion: document.getElementById('my-direccion').value,
            usuario: document.getElementById('my-usuario').value,
            clave: document.getElementById('my-clave').value
        };

        try {
            const response = await fetch(`${app.apiUrl}/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const resData = await response.json();

            if (response.ok) {
                alert('Datos actualizados correctamente');
                localStorage.setItem('employeeName', data.nombre); // Update local name
                document.getElementById('user-name-display').textContent = data.nombre;
            } else {
                alert('Error updating: ' + resData.error);
            }
        } catch (error) {
            console.error('Update error:', error);
        }
    },

    deleteMyAccount: async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) return;

        const empId = localStorage.getItem('employeeId');
        try {
            const response = await fetch(`${app.apiUrl}/employees/${empId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Cuenta eliminada. Adiós.');
                app.handleLogout();
            } else {
                alert('Error deleting account');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', app.init);
