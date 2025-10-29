/**
 * Cache-Aside Pattern Implementation
 * 
 * Este patrón mejora el rendimiento al mantener datos frecuentemente accedidos
 * en memoria, reduciendo las llamadas a servicios externos y bases de datos.
 * 
 * Funcionamiento:
 * 1. La aplicación primero consulta el cache
 * 2. Si los datos están en cache (cache hit), los devuelve directamente
 * 3. Si no están en cache (cache miss), consulta la fuente de datos original
 * 4. Almacena el resultado en cache para futuras consultas
 * 5. Devuelve los datos al cliente
 */

class CacheAside {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 300000; // 5 minutos por defecto
    this.maxSize = options.maxSize || 1000; // máximo 1000 entradas
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Obtiene un valor del cache
   * @param {string} key - Clave para buscar en el cache
   * @returns {any|null} - Valor del cache o null si no existe o expiró
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }

    // Verificar si el entry ha expirado
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return entry.data;
  }

  /**
   * Almacena un valor en el cache
   * @param {string} key - Clave para almacenar
   * @param {any} data - Datos a almacenar
   * @param {number} customTtl - TTL personalizado (opcional)
   */
  set(key, data, customTtl = null) {
    // Si el cache está lleno, eliminar el más antiguo (LRU simple)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const ttl = customTtl || this.ttl;
    const entry = {
      data: data,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    };

    this.cache.set(key, entry);
  }

  /**
   * Elimina una entrada específica del cache
   * @param {string} key - Clave a eliminar
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Limpia todo el cache
   */
  clear() {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Obtiene estadísticas del cache
   * @returns {object} - Estadísticas del cache
   */
  getStats() {
    const total = this.hitCount + this.missCount;
    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: total > 0 ? (this.hitCount / total * 100).toFixed(2) + '%' : '0%',
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }

  /**
   * Método helper para implementar el patrón Cache-Aside completo
   * @param {string} key - Clave del cache
   * @param {function} fetchFunction - Función para obtener datos si no están en cache
   * @param {number} customTtl - TTL personalizado (opcional)
   * @returns {Promise<any>} - Datos del cache o de la fuente original
   */
  async getOrFetch(key, fetchFunction, customTtl = null) {
    // 1. Intentar obtener del cache
    let data = this.get(key);
    
    if (data !== null) {
      console.log(`🟢 Cache HIT para key: ${key}`);
      return data;
    }

    // 2. Cache miss - obtener de la fuente original
    console.log(`🔴 Cache MISS para key: ${key}`);
    
    try {
      data = await fetchFunction();
      
      // 3. Almacenar en cache para futuras consultas
      this.set(key, data, customTtl);
      
      return data;
    } catch (error) {
      console.error(`❌ Error al obtener datos para key ${key}:`, error.message);
      throw error;
    }
  }
}

// Instancia global del cache para usar en toda la aplicación
const globalCache = new CacheAside({
  ttl: 300000, // 5 minutos
  maxSize: 1000
});

module.exports = {
  CacheAside,
  globalCache
};