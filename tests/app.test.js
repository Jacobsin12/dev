const request = require('supertest');
const app = require('../app');
const { calculateValue } = require('../lib/logic');

describe('Suite de Pruebas de Calidad de Software', () => {

  describe('Pruebas Unitarias - Lógica de Inventario', () => {
    test('Debe calcular correctamente el valor total (10 * 5 = 50)', () => {
      const result = calculateValue(10, 5);
      expect(result).toBe(50);
    });

    test('Debe retornar 0 si se ingresan valores negativos', () => {
      const result = calculateValue(-10, 5);
      expect(result).toBe(0);
    });

    test('Debe retornar 0 si el stock es 0', () => {
      const result = calculateValue(10, 0);
      expect(result).toBe(0);
    });

    test('Debe manejar precios con decimales correctamente', () => {
      const result = calculateValue(2.5, 4);
      expect(result).toBeCloseTo(10);
    });
  });


  describe('Pruebas de Integración - API Endpoints', () => {
    test('GET /health - Debe responder con status 200 y JSON correcto', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(typeof response.body.uptime).toBe('number');
    });

    test('GET /items - Debe validar la estructura del inventario y cantidad', async () => {
      const response = await request(app).get('/items');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      response.body.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('stock');
        expect(typeof item.stock).toBe('number');
      });
    });

    test('GET /ruta-no-existe - Debe responder 404 para rutas desconocidas', async () => {
      const response = await request(app).get('/no-existe');
      expect(response.statusCode).toBe(404);
    });
  });
});

// Tests adicionales integrados en la misma suite:
describe('Pruebas adicionales - Unitarias e Integración', () => {
  describe('Unitarias adicionales', () => {
    test('Maneja números grandes sin overflow', () => {
      const result = calculateValue(1e6, 1e3);
      expect(result).toBe(1e9);
    });

    test('Retorna NaN para entradas no numéricas', () => {
      const result = calculateValue('a', 3);
      expect(Number.isNaN(result)).toBe(true);
    });
  });

  describe('Integración adicional', () => {
    test('GET /users - Debe responder 200 y contener texto esperado', async () => {
      const res = await request(app).get('/users');
      expect(res.statusCode).toBe(200);
      expect(typeof res.text).toBe('string');
      expect(res.text).toMatch(/respond with a resource/);
    });

    test('POST /items - Debe responder 404 para método no implementado', async () => {
      const res = await request(app).post('/items').send({ name: 'Test' });
      expect(res.statusCode).toBe(404);
    });
  });
});
