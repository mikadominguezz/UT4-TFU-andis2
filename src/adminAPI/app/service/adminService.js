class AdminService {
  constructor(adminRepository) {
    this.adminRepository = adminRepository;
  }

  async getAdmins() {
    const admins = await this.adminRepository.getAdmins();
    return admins;
  }

  async getAdminById(id) {
    const admin = await this.adminRepository.getAdminById(id);
    return admin;
  }

  async saveAdmin(adminData) {
    const savedAdmin = await this.adminRepository.saveAdmin(adminData);
    return savedAdmin;
  }
}

module.exports = AdminService;