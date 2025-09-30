// Clase para manejar usuarios del sistema
class UserService {
  constructor() {
    // Usuarios hardcodeados para la demo
    this.users = [
      { 
        id: 1, 
        username: 'alice', 
        password: 'alicepass', 
        roles: ['user'] 
      },
      { 
        id: 2, 
        username: 'bob', 
        password: 'bobpass', 
        roles: ['user', 'admin'] 
      }
    ];
  }

  findByCredentials(username, password) {
    return this.users.find(user => 
      user.username === username && user.password === password
    );
  }

  findById(id) {
    return this.users.find(user => user.id === id);
  }

  findByUsername(username) {
    return this.users.find(user => user.username === username);
  }

  getAllUsers() {
    return this.users.map(user => ({
      id: user.id,
      username: user.username,
      roles: user.roles
    }));
  }
}

module.exports = UserService;
